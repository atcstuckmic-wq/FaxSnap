import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const payload = await req.json()
    const { data: eventData } = payload

    console.log('Telnyx webhook received:', eventData.event_type)

    // Store webhook for debugging
    await supabase
      .from('fax_webhooks')
      .insert({
        telnyx_fax_id: eventData.payload?.id || 'unknown',
        event_type: eventData.event_type,
        status: eventData.payload?.status,
        payload: payload,
      })

    // Handle fax status updates
    if (eventData.event_type === 'fax.delivered' || 
        eventData.event_type === 'fax.failed' ||
        eventData.event_type === 'fax.sending') {
      
      const faxId = eventData.payload?.id
      const status = eventData.payload?.status

      if (faxId && status) {
        // Map Telnyx status to our status
        let mappedStatus = status
        if (status === 'delivered') mappedStatus = 'delivered'
        else if (status === 'failed') mappedStatus = 'failed'
        else if (status === 'sending') mappedStatus = 'sending'

        // Update fax record
        const { error } = await supabase
          .from('faxes')
          .update({ 
            status: mappedStatus,
            updated_at: new Date().toISOString()
          })
          .eq('telnyx_fax_id', faxId)

        if (error) {
          console.error('Failed to update fax status:', error)
          return new Response('Database error', { status: 500 })
        }

        console.log(`Updated fax ${faxId} status to ${mappedStatus}`)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Telnyx webhook error:', error)
    return new Response(`Webhook error: ${error.message}`, { status: 400 })
  }
})