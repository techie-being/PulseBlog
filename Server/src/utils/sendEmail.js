import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  console.log("Attempting to send email to:", options.email);

  const email = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<h1>Reset Password</h1><p>${options.message}</p>`,
  });

  return email;
};

export { sendEmail };