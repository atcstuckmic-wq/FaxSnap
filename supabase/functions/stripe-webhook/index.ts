import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    return new Response('No signature', { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )

    console.log('Webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          const userId = session.metadata?.userId
          const tokens = parseInt(session.metadata?.tokens || '0')
          const paymentIntentId = session.payment_intent as string

          if (userId && tokens > 0) {
            // Update purchase record
            const { error: updateError } = await supabase
              .from('token_purchases')
              .update({ status: 'completed' })
              .eq('stripe_payment_intent_id', paymentIntentId)

            if (updateError) {
              console.error('Failed to update purchase:', updateError)
              return new Response('Database error', { 
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              })
            }

            // Create individual tokens with expiration dates (6 months from now)
            const expirationDate = new Date()
            expirationDate.setMonth(expirationDate.getMonth() + 6)

            const tokenRecords = Array.from({ length: tokens }, () => ({
              user_id: userId,
              purchase_id: null, // Will be updated after we get the purchase ID
              expires_at: expirationDate.toISOString(),
            }))

            const { error: tokenError } = await supabase
              .from('user_tokens')
              .insert(tokenRecords)

            if (tokenError) {
              console.error('Failed to create tokens:', tokenError)
              return new Response('Token creation error', { 
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              })
            }

            console.log(`Added ${tokens} tokens to user ${userId}`)
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Mark purchase as failed
        await supabase
          .from('token_purchases')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        break
      }
    }

    return new Response('OK', { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: `Webhook error: ${error.message}` }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})