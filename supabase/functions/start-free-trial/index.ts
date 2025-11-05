import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const requestSchema = z.object({
  deviceId: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
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

    const { deviceId } = validation.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if device has already used trial
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('device_id', deviceId)
      .eq('subscription_type', 'trial')
      .maybeSingle();

    if (existingSubscription) {
      return new Response(
        JSON.stringify({ success: false, error: 'Device has already used trial' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create 3-day trial subscription
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert([{
        device_id: deviceId,
        user_id: null,
        is_active: true,
        started_at: new Date().toISOString(),
        expires_at: expiryDate.toISOString(),
        subscription_type: 'trial',
        villa_limit: 1,
      }]);

    if (subscriptionError) {
      console.error('Error creating trial subscription:', subscriptionError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to start trial' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          isActive: true,
          type: 'trial',
          expiresAt: expiryDate.toISOString(),
          villaLimit: 1
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
