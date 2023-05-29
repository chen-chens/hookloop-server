import nodemailer from "nodemailer";

const mailTransporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    type: "OAuth2",
    user: process.env.SMTP_SEND_EMAIL,
    clientId: process.env.SMTP_SEND_CLIENT_ID,
    clientSecret: process.env.client_secret,
    refreshToken: process.env.SMTP_SEND_CLIENT_REFRESH_TOKEN,
    accessToken: process.env.SMTP_SEND_CLIENT_ACCESS_TOKEN,
  },
});
export default mailTransporter;
