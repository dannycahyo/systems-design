# Publish-Subscribe Pattern in Node.js with WebSockets

This lesson introduces the Publish-Subscribe (Pub/Sub) pattern, a messaging paradigm where senders (publishers) of messages are not programmed to send their messages to specific receivers (subscribers). This pattern is useful for building scalable and decoupled systems.

## Overview

We'll build a simple Pub/Sub system using Node.js, Express, and WebSockets. This system allows clients to publish messages to topics and subscribe to topics to receive messages.

## Setup

1. Install the necessary dependencies by running `npm install`.
2. Start the server with `node server.js`.
3. Open another terminal window to run a publisher or subscriber.

## Usage

### Running a Publisher

1. Set the `TOPIC_ID` environment variable to specify the topic (default is "general").
2. Run `node publisher.js`.
3. Type messages into the terminal and press Enter to publish them to the topic.

To publish messages to a topic, you can use this simple script below to simulate real-time data, such as stock prices. Here's an example script that publishes "New Stock Price" messages to the `stock_prices` topic, simulating a stock broker's updates:

```bash
(for i in $(seq 1 1000); do sleep 1; echo "New Stock Price"; done) | NAME=STOCK_BROKER TOPIC_ID=stock_prices node publisher.js
```

And try to make new topic for example stock news with this command:

```bash
(for i in $(seq 1 1000); do sleep 1; echo "New Stock News"; done) | NAME=STOCK_NEWS TOPIC_ID=stock_news node publisher.js
```

### Running a Subscriber

1. Set the `TOPIC_ID` environment variable to the same topic as the publisher.
2. Run `node subscriber.js`.
3. Messages published to the topic will be displayed in real-time.

To subscribe to a topic, you can use this simple script below to simulate real-time data, such as stock prices. Here's an example script that subscribes to the `stock_prices` topic to receive updates from the stock broker:

```bash
NAME=STOCK_BROKER TOPIC_ID=stock_prices node subscriber.js
```

And try to subscribe to the new topic for example stock news with this command:

```bash
NAME=STOCK_NEWS TOPIC_ID=stock_news node subscriber.js
```

## Experiment

- Try running multiple publishers and subscribers with different topics to see how the Pub/Sub system behaves.
- Modify the server to add features like message persistence, topic creation on demand, or access control for topics.

This lesson provides a foundation for understanding and implementing the Publish-Subscribe pattern, a key concept in building modern, real-time, and scalable web applications.
