import { PubSub } from '@google-cloud/pubsub';
import { sendWelcomeEmail } from './mailgun.js';

const pubSubClient = new PubSub();
const subscriptionName = 'welcome-email-sub';

async function listenForMessages() {
    const subscription = pubSubClient.subscription(subscriptionName);

    const messageHandler = async (message) => {
        const email = message.data.toString();
        console.log(`Received message: ${email}`);

        // Kirim email selamat datang
        await sendWelcomeEmail(email);
        message.ack();
    };

    subscription.on('message', messageHandler);
    console.log(`Listening for messages on ${subscriptionName}...`);
}

listenForMessages().catch(console.error);