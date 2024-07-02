# Pooling and Streaming in Node.js

Welcome to the lesson on Pooling and Streaming in Node.js. This guide will help you understand the concepts of pooling and streaming, and how they can be used to handle real-time data efficiently. You will simulate a simple chat application that demonstrates both techniques.

## Overview

Pooling and streaming are two approaches to handle real-time data in applications. Pooling involves periodically requesting data from the server, while streaming allows data to be pushed from the server to the client in real-time.

## Setup

1. Install the necessary dependencies by running `npm install`.
2. Start the server by running `node server.js`.

## Usage

Once the server is running, you can simulate a chat application using the following steps:

- Run the Client in Pooling Mode:
  - Open a new terminal and run:
  ```bash
  MODE=poll NAME=YourName node client.js
  ```
  - This command starts the client in pooling mode, where it periodically requests messages from the server.
- Run the Client in Streaming Mode:
  - Open another terminal and run:
  ```bash
  MODE=stream NAME=YourName node client.js
  ```
  - This command starts the client in streaming mode, where it listens for real-time messages from the server.

## Experimenting with the Application

- Send Messages: Type messages into the terminal running the client.js script and press enter. Observe how messages are displayed in both the polling and streaming clients.
- Switch Modes: Try switching between polling and streaming modes by changing the MODE environment variable and restarting the client.
