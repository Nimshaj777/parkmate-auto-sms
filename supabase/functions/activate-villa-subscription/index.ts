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
  villaId: z.string().trim().min(1).max(50),
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

    const { code, deviceId, villaId } = validation.data;

    // Create service role client
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for existing active subscription for this villa and device
    const { data: existingSubscription } = await supabaseServiceRole
      .from('villa_subscriptions')
      .select('*')
      .eq('villa_id', villaId)
      .eq('device_id', deviceId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    // Validate activation code
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

    // Check if code has expired
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Activation code has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check villa activation limit on the code
    const { data: villaActivations, error: countError } = await supabaseServiceRole
      .from('villa_subscriptions')
      .select('villa_id', { count: 'exact', head: false })
      .eq('activation_code', code);

    if (countError) {
      console.error('Error counting villa activations:', countError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to verify code usage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get unique villas activated with this code
    const uniqueVillas = new Set((villaActivations || []).map(v => v.villa_id));
    
    // Check if this is a new villa activation (not extending existing)
    if (!existingSubscription && uniqueVillas.size >= codeData.villa_count) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `This activation code has reached its villa limit (${codeData.villa_count} villas)` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let newExpiryDate: Date;
    let message: string;

    if (existingSubscription) {
      // Extend existing subscription
      const currentExpiry = new Date(existingSubscription.expires_at);
      newExpiryDate = new Date(currentExpiry);
      newExpiryDate.setDate(newExpiryDate.getDate() + codeData.duration);
      
      const { error: updateError } = await supabaseServiceRole
        .from('villa_subscriptions')
        .update({ expires_at: newExpiryDate.toISOString() })
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('Error extending subscription:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to extend subscription' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      message = `Villa subscription extended! New expiry: ${newExpiryDate.toISOString()}`;
    } else {
      // Create new villa subscription
      newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + codeData.duration);

      const { error: insertError } = await supabaseServiceRole
        .from('villa_subscriptions')
        .insert([{
          villa_id: villaId,
          device_id: deviceId,
          user_id: null, // No user association
          activation_code: code,
          is_active: true,
          activated_at: new Date().toISOString(),
          expires_at: newExpiryDate.toISOString(),
        }]);

      if (insertError) {
        console.error('Error creating villa subscription:', insertError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to activate villa subscription' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      message = `Villa subscription activated! Expires: ${newExpiryDate.toISOString()}`;
    }

    // Mark code as used if not already
    if (!codeData.is_used) {
      await supabaseServiceRole
        .from('activation_codes')
        .update({
          is_used: true,
          used_by_device_id: deviceId,
          used_at: new Date().toISOString(),
        })
        .eq('id', codeData.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message,
        expiresAt: newExpiryDate.toISOString()
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
