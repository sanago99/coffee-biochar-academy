import { NextResponse } from "next/server";

/**
 * POST /api/approve-email
 * Body: { toEmail: string; toName: string }
 *
 * Sends an approval notification email via SMTP (nodemailer).
 * Required env vars in .env.local:
 *   SMTP_HOST     — e.g. smtp.gmail.com
 *   SMTP_PORT     — e.g. 587
 *   SMTP_USER     — e.g. notificaciones@coffeebiochar.com
 *   SMTP_PASS     — app-specific password
 *   SMTP_FROM     — display name + address, e.g. "Coffee Biochar <notificaciones@coffeebiochar.com>"
 *   NEXT_PUBLIC_BASE_URL — e.g. https://academy.coffeebiochar.com
 */
export async function POST(req: Request) {
  try {
    const { toEmail, toName } = await req.json();
    if (!toEmail || !toName) {
      return NextResponse.json({ error: "toEmail and toName are required" }, { status: 400 });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM ?? `Coffee Biochar Academy <${user}>`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://academy.coffeebiochar.com";

    if (!host || !user || !pass) {
      // Email not configured — log and return success so approval still works
      console.warn("[approve-email] SMTP env vars not configured. Skipping email.");
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Dynamic import so nodemailer is only loaded server-side
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: toEmail,
      subject: "Tu cuenta ha sido aprobada — Coffee Biochar Academy",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#1C1912;border:1px solid #2A2418;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#1C1912,#0C0A07);padding:32px 32px 24px;text-align:center;border-bottom:1px solid #2A2418;">
            <img src="${baseUrl}/logo.png" alt="Coffee Biochar Academy" style="height:56px;width:auto;" />
          </div>
          <div style="padding:32px;">
            <p style="font-size:13px;text-transform:uppercase;letter-spacing:0.15em;color:#F5A623;font-weight:700;margin-bottom:8px;">
              Cuenta activada
            </p>
            <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#F2EDE3;margin-bottom:16px;line-height:1.2;">
              Hola, ${toName}
            </h1>
            <p style="font-size:15px;color:#A09080;line-height:1.7;margin-bottom:24px;">
              Tu cuenta en <strong style="color:#F2EDE3;">Coffee Biochar Academy</strong> ha sido verificada y activada.
              Ya puedes ingresar a la plataforma y comenzar tu formación como extensionista.
            </p>
            <a href="${baseUrl}/login" style="display:inline-block;background:#F5A623;color:#0C0A07;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
              Ingresar a la plataforma →
            </a>
            <p style="font-size:12px;color:#5E5248;margin-top:28px;line-height:1.6;">
              Biodiversal SAS BIC · Agricultura Regenerativa · Colombia<br/>
              Si tienes preguntas escríbenos a <a href="mailto:info@coffeebiochar.com" style="color:#F5A623;">info@coffeebiochar.com</a>
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[approve-email]", error);
    // Don't fail the approval if email fails
    return NextResponse.json({ ok: true, emailError: true });
  }
}
