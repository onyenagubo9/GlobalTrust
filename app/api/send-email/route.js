import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return Response.json({ ok: false, error: "Missing email data" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_HOST,
      port: process.env.ZOHO_PORT,
      secure: true, // true for SSL (465), false for TLS (587)
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },
    });

    await transporter.sendMail({
      from: `"GlobalTrust Bank" <${process.env.ZOHO_USER}>`,
      to,
      subject,
      html,
    });

    return Response.json({ ok: true, message: "Email sent successfully ✅" });
  } catch (error) {
    console.error("Email send error:", error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
