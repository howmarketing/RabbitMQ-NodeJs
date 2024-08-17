#!/usr/bin/env node

const amqp                      =       require('amqplib');
/**
 * @description                 This is just and only for a learning purpose about RabbitMQ.
 * 
 * */
const CONNECTION                =       'amqp://guest:guest@localhost:5672';    //   string
const EXCHANGE_NAME             =       'ex1';                                  //   string
const EXCHANGE_TYPE             =       'direct';                               //   "direct" | "topic" | "headers" | "fanout" | "match" | string
const EXCHANGE_OPTIONS          =       { durable: true };                      //   { durable: boolean }
const QUEUE_NAME                =       'q1';                                   //   string
const QUEUE_OPTIONS             =       { durable: true };                      //   { durable: boolean }
const ROUTING_KEY               =       'ex1-q1';                               //   string
const message                   =       process.argv.slice(2).join(' ') || Date.now().toString();
(async () => {
    let _, _e, _q, _b;
    const connection            =       await amqp.connect(CONNECTION);
    const execution             =       await (async () => {
        try {
            const channel       =       await connection.createConfirmChannel();
            _e                  =       await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, EXCHANGE_OPTIONS);
            _q                  =       await channel.assertQueue(QUEUE_NAME, QUEUE_OPTIONS);
            _b                  =       await channel.bindQueue(_q.queue, _e.exchange, ROUTING_KEY);
            _                   =       await channel.waitForConfirms();
            const published     =       await new Promise(( resolve, reject) => {
                channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(message), { persistent: true }, (err, _) => {
                    if (err) reject(false);
                    resolve(true);
                });
            });
            return published;
        } catch (error) {
            console.error(error);
            return false;
        }
    })()
    .then(async published => ({ published, message, metadata: { EXCHANGE_NAME, EXCHANGE_TYPE, EXCHANGE_OPTIONS, QUEUE_NAME, QUEUE_OPTIONS, ROUTING_KEY }}));
    console.log(execution)
    await connection.close();
})();
