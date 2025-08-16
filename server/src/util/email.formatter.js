import config from '../config/config.js';

const baseTemplate = (content, title = 'Spyke AI') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Kumbh Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            background-color: #f8f9fa;
            color: #333;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #00FF89 0%, #FFC050 100%);
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            color: #121212;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .header p {
            color: #121212;
            font-size: 16px;
            opacity: 0.8;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .content h2 {
            color: #121212;
            font-size: 24px;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .content p {
            color: #555;
            margin-bottom: 16px;
            font-size: 16px;
        }
        
        .button {
            display: inline-block;
            background: #00FF89;
            color: #121212 !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0, 255, 137, 0.2);
        }
        
        .button:hover {
            transform: translateY(-1px);
            background: #FFC050;
            color: #FFFFFF !important;
            box-shadow: 0 4px 8px rgba(255, 192, 80, 0.3);
        }
        
        .code-box {
            background-color: rgba(0, 255, 137, 0.05);
            border: 2px dashed #00FF89;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        
        .code {
            font-family: 'Courier New', monospace;
            font-size: 24px;
            font-weight: bold;
            color: #121212;
            letter-spacing: 3px;
        }
        
        .divider {
            height: 1px;
            background-color: #e9ecef;
            margin: 30px 0;
        }
        
        .footer {
            background-color: #121212;
            color: #FFFFFF;
            padding: 30px;
            text-align: center;
        }
        
        .footer p {
            color: #FFFFFF;
            opacity: 0.8;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .footer a {
            color: #00FF89;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #00FF89;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
        }
        
        .warning-box {
            background-color: rgba(255, 192, 80, 0.1);
            border: 1px solid #FFC050;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        
        .warning-box p {
            color: #121212;
            margin: 0;
            font-size: 14px;
            font-weight: 500;
        }
        
        .success-box {
            background-color: rgba(0, 255, 137, 0.1);
            border: 1px solid #00FF89;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        
        .success-box p {
            color: #121212;
            margin: 0;
            font-size: 14px;
            font-weight: 500;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .content h2 {
                font-size: 20px;
            }
            
            .button {
                display: block;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Spyke AI</h1>
            <p>Where Ideas Meet Intelligence</p>
        </div>
        ${content}
        <div class="footer">
            <p>� 2024 Spyke AI. All rights reserved.</p>
            <p>Premium AI Prompts, Automation Solutions & Digital Tools Marketplace</p>
            <div class="social-links">
                <a href="${config.client.url}">Visit Platform</a> |
                <a href="${config.client.url}/support">Support</a> |
                <a href="${config.client.url}/privacy">Privacy Policy</a>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const emailTemplates = {
    registration: (data) => {
        const { emailAddress, confirmationUrl, confirmationCode } = data;
        
        const content = `
            <div class="content">
                <h2>Welcome to Spyke AI! =�</h2>
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
                <h2>Account Confirmed Successfully! </h2>
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
                <h2>Password Reset Request =</h2>
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
                <h2>Password Reset Successful </h2>
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
                <h2>New Login to Your Account =</h2>
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
    }
};

export default emailTemplates;