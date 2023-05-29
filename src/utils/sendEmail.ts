import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_SEND_EMAIL,
    pass: process.env.SMTP_SEND_PASSWORD,
  },
});

export interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
const sendEmail = async (mailOptions: MailOptions): Promise<SMTPTransport.SentMessageInfo> => {
  // nodemailer 基礎設定
  return transporter.sendMail(mailOptions);
};

export default sendEmail;
