import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generic Mail Sender
const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

// Verification Email
export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  const html = `
    <h2>Verify Your Email</h2>
    <p>Thank you for signing up.</p>
    <p>Please click the button below to verify your account:</p>
    <a 
      href="${verificationUrl}"
      style="
        display:inline-block;
        padding:10px 20px;
        background:#2563eb;
        color:white;
        text-decoration:none;
        border-radius:5px;
      "
    >
      Verify Email
    </a>
    <p>If you didn't create an account, please ignore this email.</p>
  `;

  return sendMail({
    to: email,
    subject: "Verify Your Email",
    html,
  });
};

// Password Reset Email
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const html = `
    <h2>Reset Your Password</h2>
    <p>You requested a password reset.</p>
    <p>Click the button below to set a new password:</p>
    <a
      href="${resetUrl}"
      style="
        display:inline-block;
        padding:10px 20px;
        background:#dc2626;
        color:white;
        text-decoration:none;
        border-radius:5px;
      "
    >
      Reset Password
    </a>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return sendMail({
    to: email,
    subject: "Reset Your Password",
    html,
  });
};

// Password Changed Email
export const sendPasswordChangedEmail = async (email, newPassword) => {
  const html = `
    <h2>Password Changed Successfully</h2>
    <p>Your password has been changed successfully.</p>
    <p>If you did not make this change, please contact our support immediately.</p>
    <p>Your new password is: <strong>${newPassword}</strong></p>
  `;

  return sendMail({
    to: email,
    subject: "Your Password Has Been Changed",
    html,
  });
};

// export const sendPasswordChangedEmail = async (email, newPassword) => {
//   const html = `
//   <!DOCTYPE html>
//   <html>
//   <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
    
//     <table width="100%" cellpadding="0" cellspacing="0">
//       <tr>
//         <td align="center" style="padding:40px 20px;">
          
//           <table width="600" cellpadding="0" cellspacing="0"
//             style="background:#ffffff;border-radius:12px;overflow:hidden;">

//             <!-- Header -->
//             <tr>
//               <td style="background:#111111;padding:30px;text-align:center;">
//                 <h1 style="margin:0;color:#ff7a00;font-size:28px;">
//                   Password Changed
//                 </h1>
//               </td>
//             </tr>

//             <!-- Content -->
//             <tr>
//               <td style="padding:35px;">
//                 <p style="margin-top:0;color:#333;font-size:16px;">
//                   Hello,
//                 </p>

//                 <p style="color:#555;line-height:1.6;">
//                   Your password has been changed successfully.
//                 </p>

//                 <div style="
//                   background:#fff7ed;
//                   border:2px solid #ff7a00;
//                   border-radius:8px;
//                   padding:15px;
//                   text-align:center;
//                   margin:25px 0;
//                 ">
//                   <p style="
//                     margin:0 0 8px;
//                     color:#666;
//                     font-size:13px;
//                   ">
//                     NEW PASSWORD
//                   </p>

//                   <p style="
//                     margin:0;
//                     font-size:22px;
//                     font-weight:bold;
//                     color:#111111;
//                     letter-spacing:1px;
//                   ">
//                     ${newPassword}
//                   </p>
//                 </div>

//                 <p style="color:#555;line-height:1.6;">
//                   If you did not make this change, please contact support immediately.
//                 </p>
//               </td>
//             </tr>

//             <!-- Footer -->
//             <tr>
//               <td style="
//                 background:#111111;
//                 color:#999;
//                 text-align:center;
//                 padding:15px;
//                 font-size:12px;
//               ">
//                 © ${new Date().getFullYear()} Your Company. All rights reserved.
//               </td>
//             </tr>

//           </table>

//         </td>
//       </tr>
//     </table>

//   </body>
//   </html>
//   `;

//   return sendMail({
//     to: email,
//     subject: "🔒 Password Changed Successfully",
//     html,
//   });
// };

export default sendMail;
