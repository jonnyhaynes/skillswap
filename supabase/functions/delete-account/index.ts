// supabase/functions/delete-account/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('SITE_URL') ?? 'http://localhost:5173',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the user's JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // User client — validates the JWT and gives us the user
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

    // Admin client — bypasses RLS for mutations and admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { action, confirmation } = await req.json()

    // ── EXPORT ──────────────────────────────────────────────────────────────
    if (action === 'export') {
      const exportData = await generateExport(supabaseAdmin, user.id)
      return new Response(JSON.stringify(exportData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── DELETE ──────────────────────────────────────────────────────────────
    if (action === 'delete') {
      if (confirmation !== 'DELETE') {
        return new Response(JSON.stringify({ error: 'Confirmation must be the string DELETE' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Step 1: Atomic DB cleanup (anonymise reviews, cancel swaps, update conversations)
      const { error: rpcError } = await supabaseAdmin.rpc('delete_account_data', {
        p_user_id: user.id,
      })
      if (rpcError) throw new Error(`RPC failed: ${rpcError.message}`)

      // Step 2: Delete avatar files from storage
      const { data: avatarFiles } = await supabaseAdmin.storage
        .from('avatars')
        .list(user.id)
      if (avatarFiles && avatarFiles.length > 0) {
        const paths = avatarFiles.map((f) => `${user.id}/${f.name}`)
        await supabaseAdmin.storage.from('avatars').remove(paths)
      }

      // Step 3: Delete the auth user — cascades profiles, skill_listings,
      //         messages, swap_proposals, remaining reviews, user_reports
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (deleteError) throw new Error(`Auth delete failed: ${deleteError.message}`)

      console.log(`Account deleted: ${user.id}`)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('delete-account error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function generateExport(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string
): Promise<object> {
  const [
    { data: profile },
    { data: skillListings },
    { data: conversations },
    { data: messages },
    { data: swapProposals },
    { data: reviewsWritten },
    { data: reviewsReceived },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('skill_listings').select('*').eq('user_id', userId),
    supabase.from('conversations').select('*').contains('participant_ids', [userId]),
    supabase.from('messages').select('*').eq('sender_id', userId),
    supabase
      .from('swap_proposals')
      .select('*')
      .or(`proposer_id.eq.${userId},recipient_id.eq.${userId}`),
    supabase.from('reviews').select('*').eq('reviewer_id', userId),
    supabase.from('reviews').select('*').eq('reviewee_id', userId),
  ])

  return {
    exported_at: new Date().toISOString(),
    profile: profile ?? {},
    skill_listings: skillListings ?? [],
    conversations: conversations ?? [],
    messages: messages ?? [],
    swap_proposals: swapProposals ?? [],
    reviews_written: reviewsWritten ?? [],
    reviews_received: reviewsReceived ?? [],
  }
}
