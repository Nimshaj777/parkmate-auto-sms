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

    const { deviceId, ipFingerprint } = await req.json();

    if (!deviceId) {
      return new Response(
        JSON.stringify({ eligible: false, error: 'Device ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if device has already used trial
    const { data: deviceData, error: deviceError } = await supabase
      .from('trial_devices')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (deviceData && deviceData.has_used_trial) {
      return new Response(
        JSON.stringify({ eligible: false, reason: 'Device has already used trial' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if IP has already used trial (if IP fingerprint provided)
    if (ipFingerprint) {
      const { data: ipData, error: ipError } = await supabase
        .from('trial_devices')
        .select('*')
        .eq('ip_fingerprint', ipFingerprint)
        .eq('has_used_trial', true);

      if (ipData && ipData.length > 0) {
        return new Response(
          JSON.stringify({ eligible: false, reason: 'IP address has already used trial' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ eligible: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ eligible: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
