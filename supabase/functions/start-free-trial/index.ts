import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const requestSchema = z.object({
  deviceId: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  ipFingerprint: z.string().trim().max(100).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    const { deviceId, ipFingerprint } = validation.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check eligibility first
    const { data: deviceData } = await supabase
      .from('trial_devices')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (deviceData && deviceData.has_used_trial) {
      return new Response(
        JSON.stringify({ success: false, error: 'Device has already used trial' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check IP eligibility (if provided)
    if (ipFingerprint) {
      const { data: ipData } = await supabase
        .from('trial_devices')
        .select('*')
        .eq('ip_fingerprint', ipFingerprint)
        .eq('has_used_trial', true);

      if (ipData && ipData.length > 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'IP address has already used trial' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Register trial device
    const { error: deviceError } = await supabase
      .from('trial_devices')
      .upsert({
        device_id: deviceId,
        ip_fingerprint: ipFingerprint || null,
        has_used_trial: true,
        trial_started_at: new Date().toISOString()
      });

    if (deviceError) {
      console.error('Error registering trial device:', deviceError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to register trial' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create trial subscription (3 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    const { error: subError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        device_id: deviceId,
        subscription_type: 'trial',
        is_active: true,
        expires_at: expiresAt.toISOString()
      });

    if (subError) {
      console.error('Error creating trial subscription:', subError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create trial subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          isActive: true,
          type: 'trial',
          expiresAt: expiresAt.toISOString()
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
