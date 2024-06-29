# Express Caching Demonstration

This is a simple Express application that demonstrates the concept of caching to improve data retrieval performance.

## Setup

1. Install the necessary dependencies by running `npm install`.
2. In this directory, run `node app.js` to start the application.

## Usage

The application has two routes:

1. GET /no-cache: This route retrieves data without using cache, simulating a longer response time.
2. GET /with-cache: This route retrieves data using a simple in-memory cache, showcasing the performance improvement.

## Testing

You can use the following `curl` commands to test the application:

- To retrieve data without cache:

```bash
curl http://localhost:3000/no-cache
```

- To retrieve data with cache:

```bash
curl http://localhost:3000/with-cache
```

The first request to `/with-cache` will take approximately the same time as a request to `/no-cache`. However, subsequent requests to `/with-cache` will be significantly faster, demonstrating the benefits of caching.

Please note that the mock database simulates a delay to fetch data, which is why the first request to the caching route still has a delay.
