import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const requestSchema = z.object({
  code: z.string().trim().min(1).max(50),
  deviceId: z.string().trim().min(1).max(100),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid input parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { code, deviceId } = validation.data;

    // Create service role client (no auth required)
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if activation code exists and is valid
    const { data: codeData, error: codeError } = await supabaseServiceRole
      .from('activation_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (codeError || !codeData) {
      console.error('Code lookup error:', codeError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid activation code' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code is already used
    if (codeData.is_used) {
      return new Response(
        JSON.stringify({ success: false, error: 'Activation code has already been used' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code has expired
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Activation code has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing active subscription for this device
    const { data: existingSubscription } = await supabaseServiceRole
      .from('user_subscriptions')
      .select('*')
      .eq('device_id', deviceId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let newExpiryDate: Date;
    
    if (existingSubscription) {
      // Stack the new duration on top of existing subscription
      const currentExpiry = new Date(existingSubscription.expires_at);
      newExpiryDate = new Date(currentExpiry);
      newExpiryDate.setDate(newExpiryDate.getDate() + codeData.duration);
    } else {
      // No existing subscription, start from now
      newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + codeData.duration);
    }

    // Mark code as used
    const { error: updateError } = await supabaseServiceRole
      .from('activation_codes')
      .update({
        is_used: true,
        used_by_device_id: deviceId,
        used_at: new Date().toISOString(),
      })
      .eq('id', codeData.id);

    if (updateError) {
      console.error('Error updating code:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process activation code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new subscription record
    const { error: subscriptionError } = await supabaseServiceRole
      .from('user_subscriptions')
      .insert([{
        device_id: deviceId,
        user_id: null, // No user association
        is_active: true,
        started_at: new Date().toISOString(),
        expires_at: newExpiryDate.toISOString(),
        subscription_type: 'paid',
        villa_limit: codeData.villa_count,
        activation_code: code,
      }]);

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: existingSubscription 
          ? `Subscription extended! New expiry date: ${newExpiryDate.toISOString()}`
          : `Subscription activated! Expires: ${newExpiryDate.toISOString()}`,
        subscription: {
          isActive: true,
          type: 'paid',
          expiresAt: newExpiryDate.toISOString(),
          villaLimit: codeData.villa_count,
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
