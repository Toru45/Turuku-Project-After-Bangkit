import { PubSub } from '@google-cloud/pubsub';
import { sendWelcomeEmail } from './controller/mailgun.js';

const pubSubClient = new PubSub();
const subscriptionName = 'welcome-email-sub'; // Ganti dengan nama subscription Anda

const subscription = pubSubClient.subscription(subscriptionName);

const messageHandler = message => {
    const email = message.data.toString();
    console.log(`Received message: ${email}`);

    // Kirim email selamat datang
    sendWelcomeEmail(email)
        .then(() => {
            console.log(`Email sent to ${email}`);
            message.ack(); // Acknowledge the message
        })
        .catch(error => {
            console.error('Error sending email:', error);
            message.nack(); // Nack the message if there was an error
        });
};

// Listen for new messages
subscription.on('message', messageHandler);