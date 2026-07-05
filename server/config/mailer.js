import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('Resend configured ✅');

export const sendStatusEmail = async (toEmail, seekerName, jobTitle, company, newStatus) => {
  const statusMessages = {
    Reviewed: `Good news! Your application for ${jobTitle} at ${company} is being reviewed.`,
    Interview: `Congratulations! You've been shortlisted for an interview for ${jobTitle} at ${company}.`,
    Offered: `Amazing news! You've received a job offer for ${jobTitle} at ${company}!`,
    Rejected: `Thank you for applying to ${jobTitle} at ${company}. Unfortunately, you have not been selected at this time.`
  };

  const message = statusMessages[newStatus];
  if (!message) return;

  await resend.emails.send({
    from: 'HireFlow <onboarding@resend.dev>',
    to: toEmail,
    subject: `Application Update — ${jobTitle} at ${company}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #091426;">HireFlow Application Update</h2>
        <p style="color: #45474c;">Hi ${seekerName},</p>
        <p style="color: #45474c;">${message}</p>
        <div style="background: #f7f9fb; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #091426;"><strong>Position:</strong> ${jobTitle}</p>
          <p style="margin: 8px 0 0; color: #091426;"><strong>Company:</strong> ${company}</p>
          <p style="margin: 8px 0 0; color: #091426;"><strong>Status:</strong> ${newStatus}</p>
        </div>
        <p style="color: #45474c;">Good luck with your application!</p>
        <p style="color: #75777d; font-size: 12px;">HireFlow — Your career journey starts here.</p>
      </div>
    `
  });

  console.log(`Email sent to ${toEmail}`);
};

export const sendOtpEmail = async (toEmail, otp) => {
  await resend.emails.send({
    from: 'HireFlow <onboarding@resend.dev>',
    to: toEmail,
    subject: 'HireFlow — Password Reset OTP',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #091426;">Password Reset Request</h2>
        <p style="color: #45474c;">Your OTP for password reset is:</p>
        <div style="background: #f7f9fb; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
          <h1 style="color: #0058be; font-size: 48px; letter-spacing: 8px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #45474c;">This OTP expires in 10 minutes.</p>
        <p style="color: #75777d; font-size: 12px;">HireFlow — Your career journey starts here.</p>
      </div>
    `
  });
};