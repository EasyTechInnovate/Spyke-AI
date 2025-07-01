import nodemailer from 'nodemailer';
import config from '../config/config.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

export default {
  sendEmail: async (to, subject, text, html) => {
    try {
      await transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        text,
        ...(html && { html }),
      });
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to send email: ${err.message}`);
      }
      throw new Error('An unknown error occurred while sending email');
    }
  },
};