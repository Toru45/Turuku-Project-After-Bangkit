import mailgun from 'mailgun-js';
import dotenv from "dotenv";

dotenv.config();

export async function sendWelcomeEmail(email) {
    console.log(`Attempting to send email to: ${email}`);
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;
    const fromEmail =process.env.MAILGUN_FROM_EMAIL;

    const mg = mailgun({ apiKey, domain });

    const data = {
        from: fromEmail,
        to: email,
        subject: 'Selamat Datang!',
        text: 'Terima kasih telah mendaftar. Selamat datang di aplikasi TURUKU!',
    };

    mg.messages().send(data, (error, body) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', body);
        }
    });
}