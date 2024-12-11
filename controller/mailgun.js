import mailgun from 'mailgun-js';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

async function getSecret(secretName) {
    const [version] = await client.accessSecretVersion({
        name: secretName,
    });
    return version.payload.data.toString('utf8');
}

export async function sendWelcomeEmail(email) {
    console.log(`Attempting to send email to: ${email}`);
    const apiKey = await getSecret('projects/bangkit-c242-ps070/secrets/MAILGUN_API_KEY/versions/latest');
    const domain = await getSecret('projects/bangkit-c242-ps070/secrets/MAILGUN_DOMAIN/versions/latest');
    const fromEmail = await getSecret('projects/bangkit-c242-ps070/secrets/MAILGUN_FROM_EMAIL/versions/latest');

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