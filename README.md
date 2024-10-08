# RabbitMQ-NodeJs

The project RabbitMQ use-case, follow the flow diagram below.

![flow-diagram-demo](./assets/flow-diagram-simple-2.png)

## SETUP

### Install RabbitMQ

docker-compose.yml

```yml
services:
  rabbitmq_standalone:
    image: rabbitmq:3-management
    ports:
      - "15672:15672"
      - "5672:5672"
    volumes:
      - "rabbitmq_standalone:/var/lib/rabbitmq"

volumes:
    rabbitmq_standalone:
```

**Start RabbitMQ:**

```bash
docker compose up -d
```

**Access the admin panel:**

[http://localhost:15672](http://localhost:15672)

![RabbitMQ-admin-panel](./assets/rabbitmq-admin-panel.png)

> The default username and passworrd are both `guest`.
>

![RabbitMQ-admin-panel](./assets/rabbitmq-admin-panel-2.png)

> Your overview tab on RabbitMQ admin panel will be almost empty.
> Don't worry, we still need to add the exchange ex1, a queue q1 and bind the queue to the exchange with the routing key `ex1-q1`.

![RabbitMQ-admin-panel](./assets/rabbitmq-admin-panel-3.png)

> On Exchange tab, create an exchange with the **name**: `ex1`; **type**: `direct`; **durability**: `durable`.
>

![RabbitMQ-admin-panel](./assets/rabbitmq-admin-panel-4.png)

> On Queues and streams tab, create a queue **name:** `q1`; **type**: `Classic`; **durability**: `durable`.
>

![RabbitMQ-admin-panel](./assets/rabbitmq-admin-panel-5.png)

> Enter the queue name `q1`.
>

![RabbitMQ-admin-panel](./assets/rabbitmq-admin-panel-6.png)

> On Bindings section, add a binding to this queue with the **From exchange**: `ex1`; **routing key**: `ex1-q1`.
>

![RabbitMQ-admin-panel](./assets/rabbitmq-admin-panel-7.png)

> Now, on the Channels tab, you will see the open chanels for consumers and producers. So, lets start to creating our application with consumer and producer.
>

>> **NOTE:** _The steps on RabbitMQ admin panel are just for make easy to understand how things (Exchange, Queue, Routing-key) are connected, for this purpose, we've manually deployed those "fragment-artifacts". In the next's sections you will see that on the code, we gonna to assert the exchange, the queue and the bind routing-key._

### Install Dependencies

```bash
npm install
```

### UP THE CONSUMER

```bash
node src/consumer.js
```

> Separe the terminals for the consumer and producer.
>

### PRODUCER (publish a message)

```bash
node src/producer.js Hello Distributed World
```

### SURF ON THE ADMIN PANEL

**TERMINAL SPLIT VIEW:**
![TERMINAL SPLIT VIEW](assets/running-demo-1.png)

**ADMIN PANEL -> CONNECTIONS TAB VIEW:**
![ADMIN PANEL -> CONNECTIONS TAB VIEW](assets/running-demo-2.png)

**ADMIN PANEL -> CHANNELS TAB VIEW:**
![ADMIN PANEL -> CHANNELS TAB VIEW](assets/running-demo-3.png)

## UNDERSTANDING THE CODE

The RabbitMQ is a message broker that uses the AMQP protocol to send and receive messages. We use the lib [amqplib](https://www.npmjs.com/package/amqplib) to connect to the RabbitMQ server and manipulate the artifact fragments (Exchange, Queue, Routing-key).

But first of all, lets understand the firsts steps to stablish the connection with the RabbitMQ server.

**[required] Lib amqplib:**

```js
const amqp = require('amqplib');
```

### Connection

```js
//                                     amqp://user:password@host:port
const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
```

> The connection Connect to an AMQP 0-9-1 server. Is used to open a network connection and create a channel.

### Channel

```js
const channel = await connection.createChannel();
```

> A channel is a virtual connection to a server and it is asynchronous RPCs, almost all methods can respond with a promise or callback.
> It is used to send and receive messages, publish and subscribe to queues, and to execute RPC commands.
>

### Exchange

```js
await channel.assertExchange('ex1', 'direct', { durable: true });
```

> An exchange is a named entity that receives messages from producers and routes them to queues.
>

### Queue

```js
await channel.assertQueue('q1', { durable: true });
```

> A queue is a named entity that receives messages from producers and routes them to consumers.
>

### Bind Queue to Exchange

```js
await channel.bindQueue('q1', 'ex1', 'ex1-q1');
```

> A binding is a relationship between an exchange and a queue.
>

### CONSUMER

```js
channel.consume(QUEUE_NAME, function (msg) {
    console.log("Message:", msg.content.toString())
    return channel.ack(msg);
}, CONSUMER_OPTIONS);
```

**Using the callback implementation:**

```js
#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

const QUEUE_NAME            =   'q1';
const CONSUMER_OPTIONS      =   { noAck: false };

amqp.connect('amqp://localhost:5672', function (error0, connection) {
    if (error0) throw error0;
    connection.createChannel(async function (error1, channel) {
        if (error1) throw error1;
        channel.consume(QUEUE_NAME, function (msg) {
            let content = msg.content.toString();
            if (msg.properties.type === 'application/json') {
                content = JSON.parse(content);
            }
            console.log(" [x] Received: ", {content, fields: msg.fields, properties: msg.properties});
            if (!msg.properties.replyTo) return channel.ack(msg);
            console.log('Replying to %s', msg.properties.replyTo);
            channel.sendToQueue(msg.properties.replyTo, msg.content, {
                correlationId: msg.properties.correlationId
            })

            return channel.ack(msg);
        }, CONSUMER_OPTIONS);

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", QUEUE_NAME);
    });
});
```

**Using the async await implementation:**

```js
#!/usr/bin/env node
var amqp = require('amqplib');
const QUEUE_NAME            =   'q1';
const CONSUMER_OPTIONS      =   { noAck: false };
async function main() {
   const connection = await amqp.connect('amqp://localhost:5672');
   const channel = await connection.createConfirmChannel();
   await channel.assertQueue(QUEUE_NAME, { durable: true });

   channel.consume(QUEUE_NAME, function (msg) {
        let content = msg.content.toString();
        if (msg.properties.type === 'application/json') {
            content = JSON.parse(content);
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
}
main();
```

### PRODUCER

```js
CONST QUEUE_NAME = 'q1';
SEND_OPTIONS = { persistent: true, type: 'application/json' };
```

**Using the callback implementation:**

```js
channel.sendToQueue(
    QUEUE_NAME,
    Buffer.from(JSON.stringify(data)),
    SEND_OPTIONS, 
    (err: any, ok: Replies.Empty) => {
        if (err) {
            console.log("Error sending message to queue:", err);
            return;
        }
        console.log("Message sent to queue");
    }
);
```

**Using the async await implementation:**

```js
const ok = await new Promise((resolve, _) => {
    channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify(data)),
        SEND_OPTIONS,
        (err: any, ok: Replies.Empty) => {
            if (err) {
                console.log("Error sending message to queue:", err);
                resolve(false);
            }
            console.log("Message sent to queue");
            resolve(true);
        }
    );
});
```

## RabbitMQ Operations

### `createExchange(exchangeName, exchangeType, callback)`

Creates a new exchange on the RabbitMQ server.

- **exchangeName**: The name of the exchange to create.
- **exchangeType**: The type of exchange to create (e.g., 'direct', 'fanout', etc.).
- **callback**: A callback function to handle the result of the operation.

---

### `createQueue(queueName, callback)`

Creates a new queue on the RabbitMQ server.

- **queueName**: The name of the queue to create.
- **callback**: A callback function to handle the result of the operation.

---

### `bindQueue(queueName, exchangeName, routingKey, callback)`

Binds a queue to an exchange on the RabbitMQ server.

- **queueName**: The name of the queue to bind.
- **exchangeName**: The name of the exchange to bind to.
- **routingKey**: The routing key to use for binding.
- **callback**: A callback function to handle the result of the operation.

---

### `sendMessage(exchangeName, routingKey, message, callback)`

Sends a message to an exchange on the RabbitMQ server.

- **exchangeName**: The name of the exchange to send to.
- **routingKey**: The routing key to use for sending.
- **message**: The message to send.
- **callback**: A callback function to handle the result of the operation.

---

### `receiveMessage(queueName, callback)`

Receives a message from a queue on the RabbitMQ server.

- **queueName**: The name of the queue to receive from.
- **callback**: A callback function to handle the received message.

## FLOW DIAGRAMS

### Simple Flow Diagram

![flow-diagram-demo](./assets/flow-diagram-simple.png)
![flow-diagram-demo](./assets/flow-diagram-simple-2.png)

---

RabbitMQ flow with producers (p1, p2), one exchange (ex1), one queue (q1), and two consumers (c1 and c2).

1. **Producer and Exchange:**
   - The producer (p1) sends messages to the exchange (ex1). The exchange type is not specified here, but for simplicity, we will assume it is a direct exchange.
   - The exchange (ex1) routes messages to the queue (q1) based on the binding key associated with the exchange-queue relationship.

2. **Routing and Binding Key:**
   - In this case, the binding key is empty. This means that the direct exchange (ex1) routes all messages from the producer (p1) to the queue (q1) regardless of the routing key.

3. **Queue and Consumers:**
   - Queue (q1) stores all messages routed from the exchange (ex1).
   - Consumers (c1 and c2) are both subscribed to queue (q1). They pull messages from the queue and process them.

This diagram illustrates a basic RabbitMQ flow where a single producer sends messages to an exchange, which routes all messages to a queue based on an empty binding key. The queue then holds the messages until they are consumed by multiple consumers.

---

Feel free to adjust the exchange type if you have more specific details, such as whether it is a fanout, topic, or another type of exchange.

---

### Flow Diagram | Exchange binding diferent queues by routing key

![flow-diagram-demo](./assets/flow-diagram.png)
![flow-diagram-demo](./assets/flow-diagram-2.png)

---

This diagram illustrates a basic RabbitMQ flow with three producers (p1, p2, p3), one exchange (ex1), two queues (q1, q2), and three consumers (c1, c2, c4).

1. **Producers and Exchange Type:**
   - Producers p1 and p2 send messages to exchange ex1 using a "direct" exchange type. This means that messages are routed to queues based on the routing key provided by the producers.
   - Producer p3 sends messages to the exchange with a different routing key.

2. **Routing Keys and Queues:**
   - In this setup, messages from producers p1 and p2 use the routing key `ex1-q1`. The direct exchange ex1 routes these messages to queue q1.
   - Messages from producer p3 use the routing key `ex1-q2`. The direct exchange ex1 routes these messages to queue q2.

3. **Queues and Consumers:**
   - Queue q1 holds messages routed from producers p1 and p2.
   - Queue q2 holds messages routed from producer p3.
   - Consumer c1 subscribes to queue q1 and consumes messages from it.
   - Consumer c2 also subscribes to queue q1 and consumes messages from it.
   - Consumer c4 subscribes to queue q2 and consumes messages from it.

This diagram illustrates a straightforward RabbitMQ flow, demonstrating the use of a direct exchange for routing messages based on routing keys. In a real-world scenario, you might have additional producers, exchanges, queues, and consumers, and you may use various routing keys to achieve more complex message routing patterns.
