# Database Sharding Lesson

This lesson covers the basics of database sharding, including setting up app servers to handle data storage and retrieval, a proxy server to forward requests based on a sharding strategy, and a simple file-based representation of database shards.

## Setup

1. Install the necessary dependencies by running `npm install`.
2. Start multiple instances of the app server on different ports and specify data directories. This simulates different shards. For example:
   ```bash
   PORT=3001 DATA_DIR=shard1 node server.js
   PORT=3002 DATA_DIR=shard2 node server.js
   ```
   Each command starts an app server instance representing a shard, listening on a different port and using a separate directory for data storage.
3. Start the proxy server to forward requests to the appropriate app server based on a sharding strategy. For example:
   ```bash
   node proxyServer.js
   ```
   The proxy server listens on port 8080 and determines the target shard for each request.

## Usage

Once the system is running, you can store and retrieve data using the proxy server. Here are some example curl commands:

- To store data:

  ```bash
  curl -X POST http://localhost:8080/data -H "Content-Type: application/json" -d '{"key":"yourKey", "value":"yourValue"}'
  ```

- To retrieve data:
  ```bash
    curl http://localhost:8080/data/yourKey
  ```

Replace `yourKey` and `yourValue` with the key and value you wish to store.

## Architecture

The system's architecture is designed to be simple yet illustrative of database sharding principles. The proxy server uses a hashing function to determine which shard should handle a given key. This approach demonstrates how database sharding can distribute data across multiple servers to improve scalability and performance.
