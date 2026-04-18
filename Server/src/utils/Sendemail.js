import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  console.log("Attempting to send email to:", options.email);
  console.log("Using Host:", process.env.EMAIL_HOST);
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<h1>Reset Password</h1><p>${options.message}</p>`,
  };

  // 3. Actually send the email
  return await transporter.sendMail(mailOptions);
};

export {sendEmail};