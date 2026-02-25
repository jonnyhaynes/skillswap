// Edge function: Send email notification when a new swap proposal is created
// Triggered via database webhook on INSERT to swap_proposals

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SMTP_HOSTNAME = Deno.env.get("SMTP_HOSTNAME") || "sandbox.smtp.mailtrap.io";
const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") || "2525");
const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME") || "";
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD") || "";
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "noreply@skillswap.local";
const SITE_URL = Deno.env.get("SITE_URL") || "http://127.0.0.1:5173";

interface WebhookPayload {
  type: "INSERT";
  table: string;
  record: {
    id: string;
    proposer_id: string;
    recipient_id: string;
    offered_skill_id: string;
    requested_skill_id: string;
    message: string;
    status: string;
    proposed_at: string;
    conversation_id: string;
  };
}

Deno.serve(async (req) => {
  // Verify the shared secret sent by the Supabase database webhook.
  // The webhook must be configured with Authorization: Bearer <WEBHOOK_SECRET>.
  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("WEBHOOK_SECRET env var is not set");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const payload: WebhookPayload = await req.json();

    // Only process INSERT events on swap_proposals
    if (payload.type !== "INSERT" || payload.table !== "swap_proposals") {
      return new Response(JSON.stringify({ message: "Ignored" }), {
        status: 200,
      });
    }

    const { record } = payload;

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Look up proposer and recipient profiles
    const [proposerResult, recipientResult, offeredSkillResult] =
      await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", record.proposer_id)
          .single(),
        supabaseAdmin
          .from("profiles")
          .select("first_name, last_name, email")
          .eq("id", record.recipient_id)
          .single(),
        supabaseAdmin
          .from("skill_listings")
          .select("title")
          .eq("id", record.offered_skill_id)
          .single(),
      ]);

    if (proposerResult.error || recipientResult.error) {
      console.error("Failed to look up profiles:", {
        proposer: proposerResult.error,
        recipient: recipientResult.error,
      });
      return new Response(
        JSON.stringify({ error: "Failed to look up profiles" }),
        { status: 500 }
      );
    }

    const proposerName = `${proposerResult.data.first_name} ${proposerResult.data.last_name}`;
    const recipientName = recipientResult.data.first_name;
    const recipientEmail = recipientResult.data.email;
    const skillTitle = offeredSkillResult.data?.title || "a skill";
    const swapUrl = `${SITE_URL}/swaps/${record.id}`;

    // Build the email
    const subject = `${proposerName} wants to swap skills with you!`;
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: #6366f1; color: white; font-weight: bold; font-size: 14px; padding: 8px 12px; border-radius: 8px;">SS</div>
          <span style="font-size: 18px; font-weight: bold; margin-left: 8px; color: #1e293b;">SkillSwap</span>
        </div>

        <h2 style="color: #1e293b; margin-bottom: 16px;">Hi ${recipientName},</h2>

        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
          <strong>${proposerName}</strong> has sent you a swap proposal for <strong>${skillTitle}</strong>.
        </p>

        ${record.message ? `
        <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 4px 0;">Their message:</p>
          <p style="color: #334155; font-size: 15px; margin: 0;">"${record.message}"</p>
        </div>
        ` : ""}

        <div style="text-align: center; margin: 32px 0;">
          <a href="${swapUrl}" style="display: inline-block; background-color: #6366f1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            View Proposal
          </a>
        </div>

        <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 32px;">
          You're receiving this because someone proposed a skill swap with you on SkillSwap.
        </p>
      </div>
    `;

    // Send email via SMTP using Deno's smtp client
    const { SMTPClient } = await import(
      "https://deno.land/x/denomailer@1.6.0/mod.ts"
    );

    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOSTNAME,
        port: SMTP_PORT,
        tls: false,
        auth: {
          username: SMTP_USERNAME,
          password: SMTP_PASSWORD,
        },
      },
    });

    await client.send({
      from: SENDER_EMAIL,
      to: recipientEmail,
      subject,
      html: htmlBody,
    });

    await client.close();

    console.log(`Swap notification email sent to ${recipientEmail}`);

    return new Response(
      JSON.stringify({ message: "Notification sent", to: recipientEmail }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending swap notification:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
