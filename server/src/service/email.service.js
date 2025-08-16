import { Resend } from 'resend';
import config from '../config/config.js';
import logger from '../util/logger.js';

const resend = new Resend(config.email.key);

const verifyConnection = async() => {
  try {
    if (!config.email.key) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    const { data, error } = await resend.domains.list();
    if (error) {
      throw new Error(`API Error: ${error.message}`);
    }
    logger.info('Email service (Resend) connection verified');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error(`Email service (Resend) connection failed: ${errorMessage}`);
    return false;
  }
}

verifyConnection().catch(console.error);

export default {
  sendEmail: async (to, subject, text, html) => {
    try {
      console.log('Attempting to send email:', {
        from: `SpykeAI <${config.email.from}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        hasHtml: !!html,
        apiKeyConfigured: !!config.email.key
      });

      const { data, error } = await resend.emails.send({
        from: `SpykeAI <${config.email.from}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
        ...(html && { html }),
      });

      if (error) {
        console.error('Resend API error:', error);
        throw new Error(`Resend API Error: ${JSON.stringify(error)}`);
      }

      console.log('Email sent successfully:', data);
      return data;
    } catch (err) {
      console.error('Email service error:', err);
      if (err instanceof Error) {
        throw new Error(`Failed to send email: ${err.message}`);
      }
      throw new Error('An unknown error occurred while sending email');
    }
  },
};