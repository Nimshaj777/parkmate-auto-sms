import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const requestSchema = z.object({
  code: z.string().trim().regex(/^PK\d{6}[A-Z]{2}$/),
  deviceId: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
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

    const { code, deviceId } = validation.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Check for existing active subscription to stack time
    const { data: existingSubscriptions } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    let expiresAt = new Date();
    let subscriptionMessage = '';
    
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      const existing = existingSubscriptions[0];
      const existingExpiry = new Date(existing.expires_at);
      
      // Stack time: If existing subscription not expired yet, add from expiry date
      if (existingExpiry > new Date()) {
        expiresAt = new Date(existingExpiry);
        expiresAt.setDate(expiresAt.getDate() + codeData.duration);
        subscriptionMessage = 'Subscription extended! Time added to existing subscription.';
      } else {
        // Expired subscription, start fresh from today
        expiresAt.setDate(expiresAt.getDate() + codeData.duration);
        subscriptionMessage = 'Subscription activated!';
      }
    } else {
      // No existing subscription, start fresh
      expiresAt.setDate(expiresAt.getDate() + codeData.duration);
      subscriptionMessage = 'Subscription activated!';
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

    // Create new subscription (stacked)
    const { error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        device_id: deviceId,
        subscription_type: 'activation_code',
        is_active: true,
        activation_code: code,
        villa_limit: codeData.villa_count || 1,
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
        message: subscriptionMessage,
        subscription: {
          isActive: true,
          type: 'activation_code',
          expiresAt: expiresAt.toISOString(),
          activationCode: code,
          villaLimit: codeData.villa_count || 1
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
