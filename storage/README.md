# Express Storage Demonstration

This is a simple Express application that demonstrates the concept of in-memory and persistent storage.

## Setup

1. Install the necessary dependencies by running `npm install`.
2. On this directory, run `node app.js` to start the application.

## Usage

The application has three routes:

1. POST /data: This route is used to add data. The type of storage (memory or persistent) is specified in the request body.
2. GET /data/:key: This route is used to retrieve data. It first checks in-memory storage, and if the data is not found, it checks persistent storage.
3. DELETE /data/:key: This route is used to delete data from both in-memory and persistent storage.

## Testing

You can use the following `curl` commands to test the application:

- To add data to in-memory storage:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"key":"testKey", "value":"testValue", "type":"memory"}' http://localhost:3000/data
```

- To add data to persistent storage:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"key":"testKey", "value":"testValue", "type":"persistent"}' http://localhost:3000/data
```

- To retrieve data:

```bash
curl http://localhost:3000/data/testKey
```

- To delete data in-memory:

```bash
curl -X DELETE -H "Content-Type: application/json" -d '{"key":"testKey", "type":"memory"}' http://localhost:3000/data
```

- To delete data in persistent:

```bash
curl -X DELETE -H "Content-Type: application/json" -d '{"key":"testKey", "type":"persistent"}' http://localhost:3000/data
```

Pleease replace `testKey` and `testValue` with your desired key and value.
