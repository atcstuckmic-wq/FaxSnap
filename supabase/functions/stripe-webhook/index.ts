import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
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
              return new Response('Database error', { status: 500 })
            }

            // Add tokens to user profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('tokens')
              .eq('id', userId)
              .single()

            if (profileError) {
              console.error('Failed to get profile:', profileError)
              return new Response('Profile error', { status: 500 })
            }

            const { error: tokenError } = await supabase
              .from('profiles')
              .update({ tokens: (profile.tokens || 0) + tokens })
              .eq('id', userId)

            if (tokenError) {
              console.error('Failed to add tokens:', tokenError)
              return new Response('Token update error', { status: 500 })
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

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(`Webhook error: ${error.message}`, { status: 400 })
  }
})