const nodemailer = require('nodemailer');
const xss = require('xss');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    sanitizeInput(input) {
        if (!input) return '';

        const cleaned = xss(input, {
            whiteList: {},
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script', 'style']
        });
        return cleaned.trim();
    }

    async sendVerificationCode(email, code, firstName) {
        const cleanFirstName = this.sanitizeInput(firstName) || 'Користувач';
        const cleanCode = this.sanitizeInput(code);
        const mailOptions = {
            from: `"TechIndustry" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 Код підтвердження реєстрації - TechIndustry',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Inter', -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; }
                        .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px 20px; text-align: center; }
                        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
                        .content { padding: 40px 30px; }
                        .greeting { font-size: 18px; margin-bottom: 20px; color: #cbd5e1; }
                        .code-container { background: #0f172a; border: 2px solid #6366f1; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
                        .code { font-size: 48px; font-weight: bold; letter-spacing: 10px; color: #6366f1; font-family: 'Courier New', monospace; }
                        .info { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 20px 0; }
                        .warning { background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 8px; color: #fca5a5; }
                        .footer { background: #0f172a; padding: 30px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #334155; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚀 TechIndustry</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Привіт, <strong>${cleanFirstName}</strong>! 👋</p>
                            <p class="info">
                                Дякуємо за реєстрацію на платформі <strong>TechIndustry</strong>! 
                                Щоб завершити створення облікового запису, будь ласка, підтвердіть свою електронну адресу.
                            </p>
                            
                            <div class="code-container">
                                <div style="color: #94a3b8; font-size: 14px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px;">Ваш код підтвердження</div>
                                <div class="code">${cleanCode}</div>
                            </div>

                            <p class="info">
                                Введіть цей код на сторінці реєстрації, щоб активувати ваш акаунт та отримати доступ до всіх курсів та можливостей платформи.
                            </p>

                            <div class="warning">
                                ⚠️ <strong>Важливо:</strong> Код дійсний протягом <strong>10 хвилин</strong>. 
                                Якщо ви не реєструвалися на TechIndustry, проігноруйте це повідомлення.
                            </div>
                        </div>
                        <div class="footer">
                            <p>З повагою, команда TechIndustry 💜</p>
                            <p style="margin-top: 15px;">
                                © ${new Date().getFullYear()} TechIndustry. Всі права захищені.
                            </p>
                            <p style="margin-top: 10px; color: #475569;">
                                Це автоматичне повідомлення, будь ласка, не відповідайте на нього.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        try {
            const info = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email sending error:', error);
            throw new Error('Помилка відправки email');
        }
    }

    async sendPasswordResetCode(email, code, firstName) {
        const cleanFirstName = this.sanitizeInput(firstName) || 'Користувач';
        const cleanCode = this.sanitizeInput(code);
        const mailOptions = {
            from: `"TechIndustry" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔑 Відновлення паролю - TechIndustry',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Inter', -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; }
                        .header { background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); padding: 40px 20px; text-align: center; }
                        .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 700; }
                        .content { padding: 40px 30px; }
                        .greeting { font-size: 18px; margin-bottom: 20px; color: #cbd5e1; }
                        .code-container { background: #0f172a; border: 2px solid #ec4899; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
                        .code { font-size: 48px; font-weight: bold; letter-spacing: 10px; color: #ec4899; font-family: 'Courier New', monospace; }
                        .info { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 20px 0; }
                        .warning { background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 8px; color: #fca5a5; }
                        .footer { background: #0f172a; padding: 30px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #334155; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔑 Відновлення паролю</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Привіт, <strong>${cleanFirstName}</strong>! 👋</p>
                            <p class="info">
                                Ми отримали запит на відновлення паролю для вашого облікового запису на <strong>TechIndustry</strong>.
                            </p>
                            
                            <div class="code-container">
                                <div style="color: #94a3b8; font-size: 14px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px;">Код відновлення</div>
                                <div class="code">${cleanCode}</div>
                            </div>

                            <p class="info">
                                Введіть цей код на сторінці відновлення паролю, щоб встановити новий пароль.
                            </p>

                            <div class="warning">
                                ⚠️ <strong>Важливо:</strong> Код дійсний протягом <strong>10 хвилин</strong>. 
                                Якщо ви не запитували відновлення паролю, проігноруйте це повідомлення.
                            </div>
                        </div>
                        <div class="footer">
                            <p>З повагою, команда TechIndustry 💜</p>
                            <p style="margin-top: 15px;">
                                © ${new Date().getFullYear()} TechIndustry. Всі права захищені.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        try {
            const info = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email sending error:', error);
            throw new Error('Помилка відправки email');
        }
    }

    async verifyEmailExists(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        if (email.length > 255) {
            return false;
        }

        if (/<|>|script/i.test(email)) {
            return false;
        }
        return true;
    }
}

module.exports = new EmailService();