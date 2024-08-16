# RabbitMQ-NodeJs

The project RabbitMQ use-case, follow the flow diagram below.

![flow-diagram-demo](./assets/flow-diagram-simple-2.png)

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
