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

### Connection

```js
const amqp = require('amqplib');
(async () => {
   const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
   /** 
    * 
    * @description The `createConfirmChannel` method returns the instance of ConfirmChannel that extends Channel.
    * This increment the methods `waitForConfirms` and `waitForConfirmsOrDie`.
    * 
    * */
   const channel = await connection.createConfirmChannel();
})()
```



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
