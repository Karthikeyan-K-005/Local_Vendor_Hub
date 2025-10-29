import nodemailer from 'nodemailer';

/**
 * @description Sends an email using Nodemailer.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject line.
 * @param {string} text - Plain text body of the email.
 */
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465, // true for port 465, false otherwise
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    await transporter.sendMail({
      from: `"Local Store Hub" <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: subject,
      text: text,
    });

    // Removed success console log per request constraints (keeping it quiet)
    // console.log('Email sent successfully'.green); 
  } catch (error) {
    console.error('Error sending email:'.red, error);
  }
};

export default sendEmail;