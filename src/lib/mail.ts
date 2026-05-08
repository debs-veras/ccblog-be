import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(to: string, subject: string, html: string) {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
    });

    console.dir(response, {
      depth: null,
    });

    return response;
  } catch (error) {
    console.error("RESEND ERROR:");
    console.error(error);
    throw error;
  }
}
