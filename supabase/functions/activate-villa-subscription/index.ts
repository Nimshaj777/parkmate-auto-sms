import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Initialize Supabase clients
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { code, deviceId, villaId } = await req.json();

    console.log('Activating villa subscription:', { code, deviceId, villaId });

    // Validate inputs
    if (!code || !deviceId || !villaId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: code, deviceId, or villaId' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate code format (PK + 6 digits + 2 uppercase letters)
    const codePattern = /^PK\d{6}[A-Z]{2}$/;
    if (!codePattern.test(code)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid activation code format' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if villa already has an active subscription
    const { data: existingVillaSub, error: existingSubError } = await supabaseAdmin
      .from('villa_subscriptions')
      .select('*')
      .eq('villa_id', villaId)
      .eq('device_id', deviceId)
      .single();

    if (existingSubError && existingSubError.code !== 'PGRST116') {
      console.error('Error checking existing villa subscription:', existingSubError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Error checking existing subscription' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (existingVillaSub && existingVillaSub.is_active && new Date(existingVillaSub.expires_at) > new Date()) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'This villa already has an active subscription',
          message: `Expires on ${new Date(existingVillaSub.expires_at).toLocaleDateString()}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if code exists and is valid
    const { data: activationCode, error: codeError } = await supabaseAdmin
      .from('activation_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (codeError || !activationCode) {
      console.error('Activation code not found:', codeError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid activation code' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if code has already been used
    if (activationCode.is_used) {
      // If code is used, check if it's being reused by the same device
      if (activationCode.used_by_device_id !== deviceId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'This activation code has already been used by another device' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Check if code's validity period has expired (30 days from first use)
      if (activationCode.used_at) {
        const firstUsedDate = new Date(activationCode.used_at);
        const expiryDate = new Date(firstUsedDate);
        expiryDate.setDate(expiryDate.getDate() + activationCode.duration);
        
        if (new Date() > expiryDate) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'This activation code has expired (30 days from first use)' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      }

      // Check villa_count limit - count how many villas this code has activated
      const { data: existingActivations, error: countError } = await supabaseAdmin
        .from('villa_subscriptions')
        .select('villa_id')
        .eq('activation_code', code)
        .eq('device_id', deviceId);

      if (countError) {
        console.error('Error counting existing activations:', countError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Error checking activation limit' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      const villaCount = activationCode.villa_count || 1;
      const uniqueVillas = new Set(existingActivations?.map(a => a.villa_id) || []);
      
      // If this villa is already activated, allow reactivation (extension)
      if (!uniqueVillas.has(villaId) && uniqueVillas.size >= villaCount) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `This activation code can only activate ${villaCount} villa(s). Limit reached.` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    // Check if code has expired (for unused codes)
    if (!activationCode.is_used && activationCode.expires_at && new Date(activationCode.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'This activation code has expired' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Calculate expiration date
    const duration = activationCode.duration || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    // If villa already has a subscription, extend it
    if (existingVillaSub) {
      const currentExpiry = new Date(existingVillaSub.expires_at);
      const newExpiry = currentExpiry > new Date() ? currentExpiry : new Date();
      newExpiry.setDate(newExpiry.getDate() + duration);

      const { error: updateError } = await supabaseAdmin
        .from('villa_subscriptions')
        .update({
          activation_code: code,
          is_active: true,
          expires_at: newExpiry.toISOString(),
        })
        .eq('id', existingVillaSub.id);

      if (updateError) {
        console.error('Error extending villa subscription:', updateError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Error extending villa subscription' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Mark code as used
      await supabaseAdmin
        .from('activation_codes')
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
          used_by_device_id: deviceId,
        })
        .eq('code', code);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: `Villa subscription extended by ${duration} days`,
          subscription: {
            villaId,
            isActive: true,
            expiresAt: newExpiry.toISOString(),
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Create new villa subscription
    const { error: insertError } = await supabaseAdmin
      .from('villa_subscriptions')
      .insert({
        villa_id: villaId,
        device_id: deviceId,
        activation_code: code,
        is_active: true,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error creating villa subscription:', insertError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Error creating villa subscription' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Mark code as used
    await supabaseAdmin
      .from('activation_codes')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        used_by_device_id: deviceId,
      })
      .eq('code', code);

    console.log('Villa subscription activated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Villa activated for ${duration} days`,
        subscription: {
          villaId,
          isActive: true,
          expiresAt: expiresAt.toISOString(),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in activate-villa-subscription:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
