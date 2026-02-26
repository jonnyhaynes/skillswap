// Edge function: submit a user report with server-side Turnstile verification.
//
// The client sends the Cloudflare Turnstile token along with the report data.
// This function verifies the token against Cloudflare's siteverify API using
// the secret key (never exposed to the browser), then inserts the report.
// This closes the bypass where the UI gate could be skipped by calling the
// Supabase REST API directly.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
const TURNSTILE_SECRET_KEY = Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET_KEY') ?? ''

if (!TURNSTILE_SECRET_KEY) {
  console.error('CLOUDFLARE_TURNSTILE_SECRET_KEY is not set — bot protection is disabled')
}

const corsHeaders = {
  'Access-Control-Allow-Origin': SITE_URL,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── Authenticate the caller ───────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Parse body ────────────────────────────────────────────────────────
    const {
      reportedUserId,
      reason,
      description,
      evidenceSwapId,
      evidenceSkillId,
      turnstileToken,
    } = await req.json()

    if (!reportedUserId || !reason || !description) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: 'Missing verification token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Verify Turnstile token ────────────────────────────────────────────
    const turnstileRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    )
    const turnstileData = await turnstileRes.json()
    if (!turnstileData.success) {
      return new Response(JSON.stringify({ error: 'Verification failed. Please try again.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Insert report ─────────────────────────────────────────────────────
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: insertError } = await supabaseAdmin
      .from('user_reports')
      .insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        reason,
        description,
        evidence_swap_id: evidenceSwapId ?? null,
        evidence_skill_id: evidenceSkillId ?? null,
      })

    if (insertError) {
      // Unique constraint violation — report already exists
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'You have already submitted a report for this user.' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw new Error(insertError.message)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('submit-report error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
