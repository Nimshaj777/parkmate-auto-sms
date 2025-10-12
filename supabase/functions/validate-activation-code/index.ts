import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { code, deviceId } = await req.json();

    if (!code || !deviceId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Code and deviceId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate code format
    const codePattern = /^PK\d{6}[A-Z]{2}$/;
    if (!codePattern.test(code)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid code format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to check and update the code
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if code exists and is unused
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('activation_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (codeError || !codeData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid activation code' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (codeData.is_used) {
      return new Response(
        JSON.stringify({ success: false, error: 'This code has already been used' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code has expired (if expires_at is set)
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: 'This code has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark code as used
    const { error: updateError } = await supabaseAdmin
      .from('activation_codes')
      .update({
        is_used: true,
        used_by_device_id: deviceId,
        used_at: new Date().toISOString()
      })
      .eq('code', code);

    if (updateError) {
      console.error('Error updating code:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to activate code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create subscription
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + codeData.duration);

    const { error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        device_id: deviceId,
        subscription_type: 'activation_code',
        is_active: true,
        activation_code: code,
        expires_at: expiresAt.toISOString()
      });

    if (subError) {
      console.error('Error creating subscription:', subError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          isActive: true,
          type: 'activation_code',
          expiresAt: expiresAt.toISOString(),
          activationCode: code
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
