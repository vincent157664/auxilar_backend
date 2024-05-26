import nodemailer from "nodemailer";

const sendMail = async (to: String, content) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "auxilarorg@gmail.com",
      pass: "rzudhgajijoejkxj",
    },
  });

  // Use the transporter to send emails
  try {
    const res = await transporter.sendMail({
      from: "auxilarorg@gmail.com",
      to,
      subject: "Email Verification",
      html: content,
    });
    console.log(res);
  } catch (error) {
    console.log(error);
  }
};
export default sendMail;
