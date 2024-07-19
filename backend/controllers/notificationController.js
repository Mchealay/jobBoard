const nodemailer = require("nodemailer");

let transporter;

// Create SMTP Transporter
const createTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Configured for a live SMTP service (e.g. Gmail)
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log("Nodemailer: Configured live SMTP service.");
  } else {
    // Fallback: Ethereal mail for development/testing
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`Nodemailer: Using Ethereal fallback. View sent emails at https://ethereal.email (User: ${testAccount.user})`);
    } catch (err) {
      // Complete mock log fallback if Ethereal connection fails or offline
      console.log("Nodemailer: Ethereal setup failed, using console logger fallback.");
      transporter = {
        sendMail: async (mailOptions) => {
          console.log("========== MOCK EMAIL SENT ==========");
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`Body: ${mailOptions.text || mailOptions.html}`);
          console.log("=====================================");
          return { messageId: "mock-id-" + Date.now() };
        }
      };
    }
  }
};

// Initialize
createTransporter();

// Send email helper
const sendEmail = async (to, subject, text, html) => {
  try {
    if (!transporter) {
      await createTransporter();
    }
    const info = await transporter.sendMail({
      from: '"JobPortal Admin" <no-reply@jobportal.com>',
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Email send failed:", error.message);
  }
};

exports.sendApplicationNotification = async (employerEmail, employerName, jobTitle, applicantName) => {
  const subject = `New Application for ${jobTitle}`;
  const text = `Hello ${employerName},\n\n${applicantName} has applied for your job opening "${jobTitle}". Log in to your dashboard to review their resume and update application status.\n\nBest regards,\nJobPortal Team`;
  const html = `
    <h3>Hello ${employerName},</h3>
    <p><strong>${applicantName}</strong> has applied for your job opening: <strong>${jobTitle}</strong>.</p>
    <p>Log in to your dashboard to review their resume and track their application.</p>
    <br/>
    <p>Best regards,<br/>JobPortal Team</p>
  `;
  return await sendEmail(employerEmail, subject, text, html);
};

exports.sendStatusUpdateNotification = async (seekerEmail, seekerName, jobTitle, status) => {
  const subject = `Application Status Update: ${jobTitle}`;
  const text = `Hello ${seekerName},\n\nWe wanted to let you know that the status of your application for "${jobTitle}" has been updated to: ${status}.\n\nBest regards,\nJobPortal Team`;
  const html = `
    <h3>Hello ${seekerName},</h3>
    <p>We wanted to let you know that the status of your application for <strong>${jobTitle}</strong> has been updated to: <strong>${status}</strong>.</p>
    <br/>
    <p>Best regards,<br/>JobPortal Team</p>
  `;
  return await sendEmail(seekerEmail, subject, text, html);
};
