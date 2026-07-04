import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

console.log('Brevo API configured ✅');

export const sendStatusEmail = async (toEmail, seekerName, jobTitle, company, newStatus) => {
  const statusMessages = {
    Reviewed: `Good news! Your application for ${jobTitle} at ${company} is being reviewed.`,
    Interview: `Congratulations! You've been shortlisted for an interview for ${jobTitle} at ${company}.`,
    Offered: `Amazing news! You've received a job offer for ${jobTitle} at ${company}!`,
    Rejected: `Thank you for applying to ${jobTitle} at ${company}. Unfortunately, you have not been selected at this time.`
  };

  const message = statusMessages[newStatus];
  if (!message) return;

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = `Application Update — ${jobTitle} at ${company}`;
  sendSmtpEmail.to = [{ email: toEmail, name: seekerName }];
  sendSmtpEmail.sender = { email: process.env.EMAIL_USER, name: 'HireFlow' };
  sendSmtpEmail.htmlContent = `
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
  `;

  await apiInstance.sendTransacEmail(sendSmtpEmail);
  console.log(`Email sent to ${toEmail}`);
};

export const sendOtpEmail = async (toEmail, otp) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = 'HireFlow — Password Reset OTP';
  sendSmtpEmail.to = [{ email: toEmail }];
  sendSmtpEmail.sender = { email: process.env.EMAIL_USER, name: 'HireFlow' };
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #091426;">Password Reset Request</h2>
      <p style="color: #45474c;">Your OTP for password reset is:</p>
      <div style="background: #f7f9fb; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <h1 style="color: #0058be; font-size: 48px; letter-spacing: 8px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #45474c;">This OTP expires in 10 minutes.</p>
      <p style="color: #75777d; font-size: 12px;">HireFlow — Your career journey starts here.</p>
    </div>
  `;

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};