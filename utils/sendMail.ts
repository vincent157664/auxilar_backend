import nodemailer from "nodemailer";

const sendMail = async (to: String, content) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "georgebollin99@gmail.com",
      pass: "mmusszvmvgtjsusx",
    },
  });

  // Use the transporter to send emails
  try {
    const res = await transporter.sendMail({
      from: "georgebollin99@gmail.com",
      to,
      subject: "Email Verification",
      html: content,
    });
  } catch (error) {}
};
export default sendMail;
