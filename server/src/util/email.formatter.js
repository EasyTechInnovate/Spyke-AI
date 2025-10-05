import config from '../config/config.js';

const baseTemplate = (content, title = 'Spyke AI') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
        /* --- Base Resets --- */
        body,table,td,p,div { margin:0; padding:0; }
        img { border:0; line-height:100%; outline:none; text-decoration:none; }
        table { border-collapse:collapse; }
        body { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; background:#f5f7f8; font-family:'League-spartan', 'Helvetica Neue', Arial, sans-serif; }
        /* Container border was invisible because header & border used same green */
        .outer-shell { padding:24px 12px; background:#f5f7f8; }
        .outer { width:100%; max-width:640px; margin:0 auto; background:#ffffff; border:2px solid #00FF89; box-shadow:0 0 0 1px #00FF89,0 0 12px rgba(0,255,137,0.35); border-radius:14px; overflow:hidden; }
        .header { background:#00FF89; padding:40px 24px 34px; text-align:center; }
        .logo-circle { width:72px; height:72px; border-radius:50%; background:#121212; border:2px solid #00FF89; margin:0 auto 18px; }
        .brand-title { font-size:30px; line-height:1.1; margin:0 0 10px; font-weight:700; color:#121212; }
        .tagline { font-size:16px; margin:0; color:#121212; opacity:.85; font-weight:500; }
        .content { padding:42px 38px 46px; font-size:16px; line-height:1.55; color:#333; }
        .content h2 { font-size:24px; margin:0 0 20px; color:#121212; font-weight:600; }
        .content p { margin:0 0 16px; }
        .button { display:inline-block; background:#00FF89; color:#121212 !important; text-decoration:none; padding:15px 32px; border-radius:6px; font-weight:600; font-size:15px; letter-spacing:.4px; box-shadow:0 2px 6px rgba(0,255,137,0.35); }
        .button:hover { background:#00e676; }
        .code-box { background:rgba(0,255,137,.08); border:2px dashed #00FF89; padding:18px 20px; border-radius:10px; text-align:center; margin:26px 0; }
        .code { font-family:monospace; font-size:22px; font-weight:700; letter-spacing:3px; color:#121212; }
        .divider { height:1px; background:#e6e9ec; margin:34px 0; }
        .notice, .success-box, .warning-box { background:rgba(0,255,137,.12); border:1px solid #00FF89; border-radius:8px; padding:14px 16px; margin:22px 0; }
        .notice p { margin:0; font-size:14px; font-weight:500; color:#121212; }
        .footer { background:#121212; text-align:center; padding:34px 28px; }
        .footer p { margin:0 0 10px; font-size:13px; color:#FFFFFF; opacity:.85; }
        .footer a { color:#00FF89; text-decoration:none; font-weight:600; }
        .footer a:hover { text-decoration:underline; }
        .social-links { margin-top:14px; font-size:13px; }
        .social-links a { margin:0 6px; }
        /* Mobile */
        @media (max-width:620px) {
            .content { padding:34px 24px 40px !important; }
            .brand-title { font-size:26px !important; }
            .content h2 { font-size:21px !important; }
            .logo-circle { width:66px !important; height:66px !important; }
        }
    </style>
</head>
<body>
  <div class="outer-shell">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" class="outer">
      <tr>
        <td class="header" style="background:#00FF89;">
          <!-- Bullet‑proof centered circle & logo (no flex for email client safety) -->
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <div class="logo-circle" style="width:72px;height:72px;border-radius:50%;background:#121212;border:2px solid #00FF89;">
                  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAAPoCAYAAABNo9TkAAAACXBIWXMAAB2HAAAdhwGP5fFlAAAEwGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA2LTE2PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjliMTU2NDFlLTdjZjAtNGNjNS1hN2QwLTU5ZjhkNDVlYWRmYjwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5TcHlrZSAtIDI0PC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpwZGY9J2h0dHA6Ly9ucy5hZG9iZS5jb20vcGRmLzEuMy8nPgogIDxwZGY6QXV0aG9yPlN5ZWQgRmFyaGFuIEFsaTwvcGRmOkF1dGhvcj4KIDwvcmRmOkRlc2NyaXB0aW9uPgo8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSdyJz8+Y8vGfQAAgxtJREFUeJzs1z1rVFEYhdEdQeNHIRwFEQU1pYWxUP9/J8RCErASVGIhgjmdokHUwglMoaTR3M1kLXi553a7fbYCAAAALG5r6QEAAACAQAcAAIAKAh0AAAAKCHQAAAAoINABAACggEAHAACAAgIdAAAACgh0AAAAKCDQAQAAoIBABwAAgAICHQAAAAoIdAAAACgg0AEAAKCAQAcAAIACAh0AAAAKCHQAAAAoINABAACggEAHAACAAgIdAAAACgh0AAAAKCDQAQAAoIBABwAAgAICHQAAAAoIdAAAACgg0AEAAKCAQAcAAIACAh0AAAAKCHQAAAAoINABAACggEAHAACAAgIdugDWmfsooxsM7AAAAABJRU5ErkJggg==" width="40" height="40" alt="Spyke AI" style="display:block;width:40px;height:40px;" />
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0;">
                <h1 class="brand-title" style="font-family:'League-spartan';">Spyke AI</h1>
                <p class="tagline" style="font-family:'League-spartan';">Where Ideas Meet Intelligence</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td class="content" style="font-family:'league-spartan';">
          ${content}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p style="font-family:'league-spartan';">&copy; 2024 Spyke AI. All rights reserved.</p>
          <p style="font-family:'league-spartan';">Premium AI Prompts, Automation Solutions & Digital Tools Marketplace</p>
          <div class="social-links" style="font-family:'League Spartan',Arial,sans-serif;">
            <a href="https://www.spykeai.com" target="_blank">Visit Platform</a> |
            <a href="https://www.spykeai.com/contactus" target="_blank">Support</a> |
            <a href="https://spykeai.com/privacy-policy" target="_blank">Privacy Policy</a>
          </div>
          <!-- Social icon row (icons only, no text) -->
          <div class="social-links" style="margin-top:14px; font-size:0; line-height:0;">
            <!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center"><tr><![endif]-->
            <a href="https://x.com/spykeai" target="_blank" aria-label="Twitter" style="display:inline-block; margin:0 6px;">
              <img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMEZGOEkiIHN0cm9rZS13aWR0aD0iMS41IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJUd2l0dGVyIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSI2IiBmaWxsPSIjMTIxMjEyIi8+PHBhdGggZD0iTTkgMTZsMy40LTUuN0g4LjFsNi41LTYuMy0zLjEgNS4xSDExbC0yIDYuOSIgIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==" width="24" height="24" style="display:block; width:24px; height:24px;" alt="Twitter" />
            </a>
            <a href="https://www.linkedin.com/company/spykeai/" target="_blank" aria-label="LinkedIn" style="display:inline-block; margin:0 6px;">
              <img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJMaW5rZWRJbiIgc3Ryb2tlPSIjMDBGRjhJIiBzdHJva2Utd2lkdGg9IjEuNSI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNiIgZmlsbD0iIzEyMTIxMiIvPjxnIGZpbGw9IiMwMEZGOEkiPjxwYXRoIGQ9Ik04IDEwSDExVjE3SDgiLz48Y2lyY2xlIGN4PSI5LjUiIGN5PSI3LjUiIHI9IjEuNSIvPjxwYXRoIGQ9Ik0xMyAxMEgxNnYxYy4zLS43IDEuMS0xLjUgMi0xLjUgMS40IDAgMi41IDEuMSAyLjUgMi41VjE3VjEzLjVjMC0uNi0uNS0xLTEtMXMtMSAuNC0xIDFWMTdIMTJWMTAiLz48L2c+PC9zdmc+" width="24" height="24" style="display:block; width:24px; height:24px;" alt="LinkedIn" />
            </a>
            <a href="https://www.facebook.com/Spykeaitech/" target="_blank" aria-label="Facebook" style="display:inline-block; margin:0 6px;">
              <img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMEZGOEkiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkZhY2Vib29rIiBzdHJva2Utd2lkdGg9IjEuNSI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNiIgZmlsbD0iIzEyMTIxMiIvPjxwYXRoIGQ9Ik0xMiAyMHYtNyBoMy4xTDE2IDlIMTJWN2MwLS44LjMtMSAxLjUtMUgxNnYtM0gxMy41QzkuOSAzIDkgNS40IDkgN3YyaC0yVjloMlYyMCIgZmlsbD0iIzAwRkY4SSIgc3Ryb2tlPSJub25lIi8+PC9zdmc+" width="24" height="24" style="display:block; width:24px; height:24px;" alt="Facebook" />
            </a>
            <a href="https://www.youtube.com/@SpykeAITech?sub_confirmation=1" target="_blank" aria-label="YouTube" style="display:inline-block; margin:0 6px;">
              <img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMEZGOEkiIHN0cm9rZS13aWR0aD0iMS41IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJZb3VUdWJlIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSI2IiBmaWxsPSIjMTIxMjEyIi8+PHBhdGggZD0iTTkgN2g2YzIuNyAwIDQgMS4zIDQgNHYyYzAgMi43LTEuMyA0LTQgNEg5Yy0yLjcgMC00LTEuMy00LTR2LTJjMC0yLjcgMS4zLTQgNC00eiIgZmlsbD0iIzAwRkY4SSIgc3Ryb2tlPSJub25lIi8+PHBhdGggZD0iTTEwLjUgMTVsNC01LTQgNVoiIGZpbGw9IiMxMjEyMTIiLz48L3N2Zz4=" width="24" height="24" style="display:block; width:24px; height:24px;" alt="YouTube" />
            </a>
            <a href="https://www.instagram.com/spykeai/" target="_blank" aria-label="Instagram" style="display:inline-block; margin:0 6px;">
              <img src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMEZGOEkiIHN0cm9rZS13aWR0aD0iMS41IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJJbnN0YWdyYW0iPjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgcng9IjYiIGZpbGw9IiMxMjEyMTIiLz48cGF0aCBkPSJNMTIgOWMtMS42IDAtMyAxLjQtMyAzczEuNCAzIDMgMyAzLTEuNCAzLTMtMS40LTMtMy0zeiIgZmlsbD0iIzAwRkY4SSIgc3Ryb2tlPSJub25lIi8+PHBhdGggZD0iTTE1IDkuNWExLjUgMS41IDAgMSAwIDAtMyAxLjUgMS41IDAgMCAwIDAgM3oiIGZpbGw9IiMwMEZGOEkiIHN0cm9rZT0ibm9uZSIvPjwvc3ZnPg==" width="24" height="24" style="display:block; width:24px; height:24px;" alt="Instagram" />
            </a>
            <!--[if mso]></tr></table><![endif]-->
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

const styleContent = (html) => {
  if (!html) return html;
  return html
    .replace(/<a([^>]*class=\"button\"[^>]*)>([\s\S]*?)<\/a>/g, (_m, attrs, text) => `<a ${attrs} style="display:inline-block;background:#00FF89;color:#121212!important;font-weight:600;padding:14px 30px;border-radius:4px;font-size:15px;letter-spacing:.4px;box-shadow:0 2px 6px rgba(0,255,137,0.35);text-decoration:none;">${text}</a>`);
};

export const emailTemplates = {
    registration: (data) => {
        const { emailAddress, confirmationUrl, confirmationCode } = data;
        
        const content = `
            <div class="content">
                <h2>Welcome to Spyke AI!</h2>
                <p>Thank you for joining our premium marketplace for AI prompts, automation solutions, and digital tools.</p>
                <p>To complete your registration and unlock access to our platform, please confirm your email address.</p>
                
                <p style="text-align: center;">
                    <a href="${confirmationUrl}" class="button">Confirm Your Account</a>
                </p>
                
                <div class="divider"></div>
                
                <p><strong>What's next?</strong></p>
                <p>Once confirmed, you'll be able to:</p>
                <ul style="padding-left: 20px; margin-bottom: 20px;">
                    <li>Browse premium AI prompts and automation solutions</li>
                    <li>Purchase and download digital assets instantly</li>
                    <li>Apply to become a seller and monetize your AI expertise</li>
                    <li>Access our comprehensive resource library</li>
                </ul>
                
                <div class="warning-box">
                    <p><strong>Security Note:</strong> This confirmation link will expire in 24 hours. If you didn't create this account, please ignore this email.</p>
                </div>
            </div>
        `;
        
        return {
            subject: 'Welcome to Spyke AI - Confirm Your Account',
            html: baseTemplate(content, 'Welcome to Spyke AI'),
            text: `Welcome to Spyke AI! Please confirm your account by visiting: ${confirmationUrl}`
        };
    },

    confirmation: (data) => {
        const { emailAddress, dashboardUrl } = data;
        
        const content = `
            <div class="content">
                <h2>Account Confirmed Successfully!</h2>
                <p>Congratulations! Your Spyke AI account has been successfully verified.</p>
                
                <div class="success-box">
                    <p>You now have full access to our premium marketplace featuring battle-tested AI prompts, automation solutions, and digital tools.</p>
                </div>
                
                <p style="text-align: center;">
                    <a href="${dashboardUrl}" class="button">Access Your Dashboard</a>
                </p>
                
                <div class="divider"></div>
                
                <p><strong>Ready to explore?</strong></p>
                <p>Here's what you can do now:</p>
                <ul style="padding-left: 20px; margin-bottom: 20px;">
                    <li><strong>Browse Products:</strong> Discover premium AI prompts and automation tools</li>
                    <li><strong>Make Purchases:</strong> Buy and download digital assets instantly</li>
                    <li><strong>Become a Seller:</strong> Apply to sell your own AI solutions</li>
                    <li><strong>Join Community:</strong> Connect with other AI enthusiasts</li>
                </ul>
                
                <p>If you have any questions, our support team is here to help!</p>
            </div>
        `;
        
        return {
            subject: 'Account Confirmed - Welcome to Spyke AI!',
            html: baseTemplate(content, 'Account Confirmed - Spyke AI'),
            text: `Your Spyke AI account has been confirmed! Access your dashboard at: ${dashboardUrl}`
        };
    },

    forgotPassword: (data) => {
        const { emailAddress, resetUrl, resetToken } = data;
        
        const content = `
            <div class="content">
                <h2>Password Reset Request</h2>
                <p>We received a request to reset the password for your Spyke AI account associated with <strong>${emailAddress}</strong>.</p>
                
                <p style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Your Password</a>
                </p>
                
                <div class="divider"></div>
                
                <div class="warning-box">
                    <p><strong>Important Security Information:</strong></p>
                    <p>" This reset link will expire in 1 hour</p>
                    <p>" If you didn't request this reset, please ignore this email</p>
                    <p>" Your account remains secure until you use this link</p>
                </div>
                
                <p>If the button above doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
                
                <p>If you continue to have problems, please contact our support team.</p>
            </div>
        `;
        
        return {
            subject: 'Password Reset Request - Spyke AI',
            html: baseTemplate(content, 'Password Reset - Spyke AI'),
            text: `Reset your Spyke AI password using this link: ${resetUrl} (expires in 1 hour)`
        };
    },

    resetPassword: (data) => {
        const { emailAddress, loginUrl } = data;
        
        const content = `
            <div class="content">
                <h2>Password Reset Successful</h2>
                <p>Your Spyke AI account password has been successfully updated.</p>
                
                <div class="success-box">
                    <p>Your account is now secure with your new password. You can log in immediately using your new credentials.</p>
                </div>
                
                <p style="text-align: center;">
                    <a href="${loginUrl}" class="button">Log In to Your Account</a>
                </p>
                
                <div class="divider"></div>
                
                <p><strong>Account Security Tips:</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 20px;">
                    <li>Use a unique password for your Spyke AI account</li>
                    <li>Enable two-factor authentication when available</li>
                    <li>Never share your login credentials</li>
                    <li>Log out from shared or public computers</li>
                </ul>
                
                <div class="warning-box">
                    <p><strong>Didn't make this change?</strong> If you didn't reset your password, please contact our support team immediately at ${config.client.url}/support</p>
                </div>
            </div>
        `;
        
        return {
            subject: 'Password Reset Successful - Spyke AI',
            html: baseTemplate(content, 'Password Reset Complete - Spyke AI'),
            text: `Your Spyke AI password has been successfully reset. Log in at: ${loginUrl}`
        };
    },

    loginAlert: (data) => {
        const { emailAddress, loginTime, loginIP, location } = data;
        
        const content = `
            <div class="content">
                <h2>New Login to Your Account</h2>
                <p>We noticed a new login to your Spyke AI account. Here are the details:</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${emailAddress}</p>
                    <p style="margin: 5px 0;"><strong>Time:</strong> ${loginTime}</p>
                    <p style="margin: 5px 0;"><strong>IP Address:</strong> ${loginIP}</p>
                    ${location ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>` : ''}
                </div>
                
                <p>If this was you, no action is needed. If you don't recognize this login, please secure your account immediately.</p>
                
                <div class="warning-box">
                    <p><strong>If this wasn't you:</strong></p>
                    <p>1. Change your password immediately</p>
                    <p>2. Review your account activity</p>
                    <p>3. Contact our support team</p>
                </div>
                
                <p style="text-align: center;">
                    <a href="${config.client.url}/account/security" class="button">Review Account Security</a>
                </p>
            </div>
        `;
        
        return {
            subject: 'New Login Alert - Spyke AI',
            html: baseTemplate(content, 'Login Alert - Spyke AI'),
            text: `New login to your Spyke AI account at ${loginTime} from ${loginIP}. If this wasn't you, please secure your account.`
        };
    },

    'payout-request-confirmation': (data) => {
        const { sellerName, amount, currency, requestId, estimatedProcessingTime } = data;
        
        const content = `
            <div class="content">
                <h2>🎉 It's Your Payout Day!</h2>
                <p>Hello ${sellerName},</p>
                <p>Great news! Your payout request has been submitted successfully and is now being reviewed by our team.</p>
                
                <div class="success-box">
                    <p><strong>Payout Details:</strong></p>
                    <p>• Amount: ${currency} $${amount.toFixed(2)}</p>
                    <p>• Request ID: ${requestId}</p>
                    <p>• Estimated Processing Time: ${estimatedProcessingTime}</p>
                </div>
                
                <p><strong>What happens next?</strong></p>
                <p>Our team will review your payout request and process it according to our standard procedures. You'll receive email updates as your request progresses through our system.</p>
                
                <p style="text-align: center;">
                    <a href="${config.client.url}/seller/payouts" class="button">View Payout Status</a>
                </p>
                
                <div class="divider"></div>
                
                <p>Thank you for being a valued seller on our platform. Your contributions help make Spyke AI the premier destination for AI solutions!</p>
            </div>
        `;
        
        return {
            subject: '🎉 It\'s Your Payout Day! Request Submitted Successfully',
            html: baseTemplate(content, 'Payout Request - Spyke AI'),
            text: `Your payout request for ${currency} $${amount.toFixed(2)} has been submitted successfully. Request ID: ${requestId}. Estimated processing time: ${estimatedProcessingTime}.`
        };
    },

    'payout-admin-notification': (data) => {
        const { adminName, sellerName, sellerId, amount, currency, requestId, payoutMethod } = data;
        
        const content = `
            <div class="content">
                <h2>New Payout Request - Admin Action Required</h2>
                <p>Hello ${adminName},</p>
                <p>A new payout request has been submitted and requires your review.</p>
                
                <div class="warning-box">
                    <p><strong>Payout Request Details:</strong></p>
                    <p>• Seller: ${sellerName}</p>
                    <p>• Seller ID: ${sellerId}</p>
                    <p>• Amount: ${currency} $${amount.toFixed(2)}</p>
                    <p>• Payout Method: ${payoutMethod}</p>
                    <p>• Request ID: ${requestId}</p>
                </div>
                
                <p>Please review this request and take appropriate action in the admin dashboard.</p>
                
                <p style="text-align: center;">
                    <a href="${config.client.url}/admin/payouts/${requestId}" class="button">Review Payout Request</a>
                </p>
                
                <div class="divider"></div>
                
                <p><strong>Admin Actions Available:</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 20px;">
                    <li>Approve the payout request</li>
                    <li>Request additional information</li>
                    <li>Put the request on hold</li>
                    <li>Reject the request with reason</li>
                </ul>
            </div>
        `;
        
        return {
            subject: 'New Payout Request - Admin Action Required',
            html: baseTemplate(content, 'Admin Notification - Spyke AI'),
            text: `New payout request from ${sellerName} for ${currency} $${amount.toFixed(2)}. Request ID: ${requestId}. Please review in admin dashboard.`
        };
    },

    'payout-approved': (data) => {
        const { sellerName, amount, currency, requestId, approvedAt, estimatedProcessingTime } = data;
        
        const content = `
            <div class="content">
                <h2>✅ Payout Approved - Processing Soon!</h2>
                <p>Hello ${sellerName},</p>
                <p>Excellent news! Your payout request has been approved and will be processed soon.</p>
                
                <div class="success-box">
                    <p><strong>Approved Payout Details:</strong></p>
                    <p>• Amount: ${currency} $${amount.toFixed(2)}</p>
                    <p>• Request ID: ${requestId}</p>
                    <p>• Approved At: ${new Date(approvedAt).toLocaleString()}</p>
                    <p>• Estimated Processing: ${estimatedProcessingTime}</p>
                </div>
                
                <p><strong>Next Steps:</strong></p>
                <p>Your payout will be processed by our finance team and sent to your registered payout method. You'll receive another notification once the payment has been initiated.</p>
                
                <p style="text-align: center;">
                    <a href="${config.client.url}/seller/payouts" class="button">View Payout Status</a>
                </p>
                
                <div class="divider"></div>
                
                <p>Thank you for your patience. We appreciate your continued contribution to the Spyke AI marketplace!</p>
            </div>
        `;
        
        return {
            subject: '✅ Payout Approved - Processing Soon!',
            html: baseTemplate(content, 'Payout Approved - Spyke AI'),
            text: `Your payout request for ${currency} $${amount.toFixed(2)} has been approved! Request ID: ${requestId}. Processing will begin within ${estimatedProcessingTime}.`
        };
    },

    'payout-rejected': (data) => {
        const { sellerName, amount, currency, requestId, rejectionReason } = data;
        
        const content = `
            <div class="content">
                <h2>❌ Payout Request Update</h2>
                <p>Hello ${sellerName},</p>
                <p>We've reviewed your recent payout request and unfortunately cannot process it at this time.</p>
                
                <div class="warning-box">
                    <p><strong>Request Details:</strong></p>
                    <p>• Amount: ${currency} $${amount.toFixed(2)}</p>
                    <p>• Request ID: ${requestId}</p>
                    <p>• Reason: ${rejectionReason}</p>
                </div>
                
                <p><strong>What you can do:</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 20px;">
                    <li>Review the rejection reason above</li>
                    <li>Address any issues mentioned</li>
                    <li>Contact our support team if you need clarification</li>
                    <li>Submit a new payout request once issues are resolved</li>
                </ul>
                
                <p style="text-align: center;">
                    <a href="${config.client.url}/seller/payouts" class="button">View Payout Dashboard</a>
                </p>
                
                <div class="divider"></div>
                
                <p>If you have questions about this decision or need assistance, please don't hesitate to reach out to our support team.</p>
            </div>
        `;
        
        return {
            subject: '❌ Payout Request Update',
            html: baseTemplate(content, 'Payout Update - Spyke AI'),
            text: `Your payout request for ${currency} $${amount.toFixed(2)} could not be processed. Reason: ${rejectionReason}. Request ID: ${requestId}.`
        };
    },

    'payout-hold': (data) => {
        const { sellerName, amount, currency, requestId, holdReason } = data;
        
        const content = `
            <div class="content">
                <h2>⏸️ Payout Request On Hold</h2>
                <p>Hello ${sellerName},</p>
                <p>Your payout request is currently on hold for additional review.</p>
                
                <div class="warning-box">
                    <p><strong>Hold Details:</strong></p>
                    <p>• Amount: ${currency} $${amount.toFixed(2)}</p>
                    <p>• Request ID: ${requestId}</p>
                    <p>• Hold Reason: ${holdReason}</p>
                </div>
                
                <p><strong>What this means:</strong></p>
                <p>Your payout request is temporarily paused while we conduct additional verification or review. This is a standard procedure in certain cases and does not indicate any issue with your account.</p>
                
                <p><strong>Next steps:</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 20px;">
                    <li>No action is required from you at this time</li>
                    <li>Our team will complete the review process</li>
                    <li>You'll be notified once the hold is resolved</li>
                    <li>Contact support if you have urgent questions</li>
                </ul>
                
                <p style="text-align: center;">
                    <a href="${config.client.url}/seller/payouts" class="button">View Payout Status</a>
                </p>
                
                <div class="divider"></div>
                
                <p>We appreciate your patience during this review process.</p>
            </div>
        `;
        
        return {
            subject: '⏸️ Payout Request On Hold',
            html: baseTemplate(content, 'Payout Hold - Spyke AI'),
            text: `Your payout request for ${currency} $${amount.toFixed(2)} is on hold for: ${holdReason}. Request ID: ${requestId}. You'll be notified when resolved.`
        };
    },

    'payout-processing': (data) => {
        const { sellerName, amount, currency, requestId, transactionId, estimatedCompletion } = data;
        
        const content = `
            <div class="content">
                <h2>🔄 Your Payout is Being Processed!</h2>
                <p>Hello ${sellerName},</p>
                <p>Great news! Your payout is now being processed by our finance team.</p>
                
                <div class="success-box">
                    <p><strong>Processing Details:</strong></p>
                    <p>• Amount: ${currency} $${amount.toFixed(2)}</p>
                    <p>• Request ID: ${requestId}</p>
                    <p>• Transaction Reference: ${transactionId}</p>
                    <p>• Estimated Completion: ${estimatedCompletion}</p>
                </div>
                
                <p><strong>What's happening now:</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 20px;">
                    <li>Your payout has been initiated with our payment processor</li>
                    <li>The funds are being transferred to your registered payout method</li>
                    <li>You'll receive a final confirmation once completed</li>
                </ul>
                
                <p style="text-align: center;">
                    <a href="${config.client.url}/seller/payouts" class="button">Track Payout Progress</a>
                </p>
                
                <div class="divider"></div>
                
                <p><strong>Please note:</strong> Depending on your payout method and bank, it may take additional time for the funds to appear in your account after processing is complete.</p>
            </div>
        `;
        
        return {
            subject: '🔄 Your Payout is Being Processed!',
            html: baseTemplate(content, 'Payout Processing - Spyke AI'),
            text: `Your payout for ${currency} $${amount.toFixed(2)} is being processed. Transaction ID: ${transactionId}. Estimated completion: ${estimatedCompletion}.`
        };
    },

    'payout-completed': (data) => {
        const { sellerName, amount, currency, requestId, transactionId, completedAt } = data;
        
        const content = `
            <div class="content">
                <h2>🎉 Payout Completed Successfully!</h2>
                <p>Hello ${sellerName},</p>
                <p>Fantastic news! Your payout has been completed successfully.</p>
                
                <div class="success-box">
                    <p><strong>Completed Payout Details:</strong></p>
                    <p>• Amount: ${currency} $${amount.toFixed(2)}</p>
                    <p>• Request ID: ${requestId}</p>
                    <p>• Transaction Reference: ${transactionId}</p>
                    <p>• Completed At: ${new Date(completedAt).toLocaleString()}</p>
                </div>
                
                <p><strong>Important notes:</strong></p>
                <ul style="padding-left: 20px; margin-bottom: 20px;">
                    <li>The funds have been successfully transferred</li>
                    <li>Depending on your bank/provider, it may take 1-3 business days to appear</li>
                    <li>Keep the transaction reference for your records</li>
                    <li>A receipt is available in your seller dashboard</li>
                </ul>
                
                <p style="text-align: center;">
                    <a href="${config.client.url}/seller/payouts" class="button">View Payout History</a>
                </p>
                
                <div class="divider"></div>
                
                <p>Thank you for being a valued seller on Spyke AI! Keep creating amazing content, and we'll keep processing your earnings smoothly.</p>
                
                <p><strong>Ready for your next payout?</strong> Continue selling and earning - we'll be here when you're ready to withdraw again!</p>
            </div>
        `;
        
        return {
            subject: '🎉 Payout Completed Successfully!',
            html: baseTemplate(content, 'Payout Completed - Spyke AI'),
            text: `Your payout for ${currency} $${amount.toFixed(2)} has been completed! Transaction ID: ${transactionId}. Funds should arrive within 1-3 business days.`
        };
    }
};

export default emailTemplates;