const amqp = require('amqplib');


const RABBITMQ_URL              =       'amqp://guest:guest@localhost:5672';                        //   string
const EXCHANGE_NAME             =       'ex1';                                                      //   string
const EXCHANGE_TYPE             =       'direct';                                                   //   "direct" | "topic" | "headers" | "fanout" | "match" | string
const QUEUE_NAME                =       'q1';                                                       //   string
const ROUTING_KEY               =       `${EXCHANGE_NAME}-${QUEUE_NAME}`;                                                   //   string
const EXCHANGE_OPTIONS          =       { durable: true };                                          //   { durable: boolean }
const QUEUE_OPTIONS             =       { durable: true };                                          //   { durable: boolean }
const MESSAGE_OPTIONS           =       { persistent: true };                                       //   { durable: boolean }
const MESSAGE                   =       process.argv.slice(2).join(' ') || Date.now().toString();   //   string
const CONSUMER_OPTIONS          =       { noAck: false };                                           //   { noAck: boolean }
let CALLBACK_QUEUE              =       `${ROUTING_KEY}_callback`;                                                       //   string
/**
 * Function to send a message
 * 
 * @param {amqp.ConfirmChannel} channel 
 * @returns {Promise<boolean>}
 */
async function sendMessage(channel, msg = MESSAGE) {
    try {
        const published = await new Promise( (resolve) => channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(JSON.stringify({msg})), {
            ...MESSAGE_OPTIONS,
            type: 'application/json',
            replyTo: CALLBACK_QUEUE
        }, (err, ok) => resolve(!err)))
        return published;
    } catch (error) {
        console.error('Error sending message:', error);
        return false
    }
}
/**
 * 
 * @param { amqp.Connection } connection 
 */
async function consumeCallback(connection) {
    try {
        const channel = await connection.createConfirmChannel();
        const callbackQueue = await channel.assertQueue("", {durable: true, exclusive: true});
        CALLBACK_QUEUE = callbackQueue.queue;
        await channel.waitForConfirms();

        // Consume a message from the queue
        const consumer = await channel.consume(CALLBACK_QUEUE, (msg) => {
            msg.content = JSON.parse(msg.content.toString());
            console.log(`Callback message:`,msg);
            channel.ack(msg); // Acknowledge the message
        }, CONSUMER_OPTIONS);
        return consumer.consumerTag;
    } catch (error) {
        console.error('Error receiving message:', error);
    }
}
// Function to receive a message
/**
 * 
 * @param {amqp.ConfirmChannel} channel 
 */
async function receiveMessage(channel) {
    try {
        // channel.prefetch(1);
        // Consume a message from the queue
        await channel.consume(QUEUE_NAME, (msg) => {
                console.log(`Consummed: [x] -> ${msg.content.toString()}`);
                channel.ack(msg); // Acknowledge the message
        }, CONSUMER_OPTIONS);
    } catch (error) {
        console.error('Error receiving message:', error);
    }
}

// Main function to set up RabbitMQ and handle messages
async function main() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createConfirmChannel();
        await consumeCallback(connection);

        // Ensure the exchange exists
        await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, EXCHANGE_OPTIONS);
        
        // Ensure the queue exists
        await channel.assertQueue(QUEUE_NAME, QUEUE_OPTIONS);

        // Bind the queue to the exchange with the routing key
        await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

        await channel.waitForConfirms();

        console.log('Channel setup confirmed');

        // Start receiving messages
        // receiveMessage(channel);

        const roundtripMassiveSender = async ({total_rounds = 2, messages_per_round = 4, interval = 5000}) => {
            if (total_rounds < 1) return;
            console.log(`------- Roundtrip ${total_rounds} starting ------`);
            await new Promise( async (r) => {
                let sent = 1;
                let casting = [];
                while ((sent - 1) < messages_per_round) {
                    await sendMessage(channel, `round: ${total_rounds}, sent: ${sent}`);
                    // casting.push(sendMessage(channel, `round: ${total_rounds}, sent: ${sent}`));
                    sent += 1;
                    console.log(`#${sent} [>]`);
                }
                console.log('Broadcasting...');
                const broadcast = await Promise.all(casting);
                casting = [];
                setTimeout( () => r(), interval);
            });
            total_rounds -= 1;
            return await roundtripMassiveSender({total_rounds, messages_per_round, interval});
        }
        roundtripMassiveSender({total_rounds: 100,  messages_per_round: 2, interval: 5000});

    } catch (error) {
        console.error('Error:', error);
    }
}

// Execute the main function
main();