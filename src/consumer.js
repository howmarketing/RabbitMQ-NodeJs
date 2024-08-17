#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

const QUEUE_NAME            =   'q1';
const CONSUMER_OPTIONS      =   { noAck: false };
amqp.connect('amqp://localhost:5672', function (error0, connection) {
    if (error0) throw error0;
    connection.createChannel(async function (error1, channel) {
        if (error1) throw error1;
        channel.prefetch(1);
        channel.consume(QUEUE_NAME, function (msg) {
            let content = msg.content.toString();
            if (msg.properties.type === 'application/json') {
                content = JSON.parse(content);
                // console.log("Json message: ", content);
            }
            console.log(" [x] Received: ", {content, fields: msg.fields, properties: msg.properties});
            if (!msg.properties.replyTo) {
                return channel.ack(msg);
            }
            console.log('Replying to %s', msg.properties.replyTo);
            channel.sendToQueue(msg.properties.replyTo, msg.content, {
                correlationId: msg.properties.correlationId
            })

            return channel.ack(msg);
        }, CONSUMER_OPTIONS);

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", QUEUE_NAME);
    });
});