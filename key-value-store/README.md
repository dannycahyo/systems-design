# Key-Value Store Demonstration

This lesson demonstrates how to use Redis as a key-value store in conjunction with an Express.js application to cache data.

## Setup

### Redis

1. Install Redis on your system.
2. Start the Redis server.

### Application

1. Run `npm install` to install the necessary dependencies, including `redis`.
2. Start the application with `node server.js`.

## Testing

To test the caching mechanism:

- First, make a request to `/no-cache/index.html` to fetch data without caching:

```bash
curl http://localhost:3000/no-cache/index.html
```

- Next, make a request to `/with-cache/index.html` to fetch data with caching:

```bash
curl http://localhost:3000/with-cache/index.html
```

- Finally, make a request to `/with-cache/index.html` again to fetch the cached data:

```bash
curl http://localhost:3000/with-cache/index.html
```

You should see the response time decrease significantly when fetching the cached data. Since the cache expiration time is set to 10 seconds, if you make the request again after 10 seconds, the response time will increase as the cache is invalidated and the data is fetched again.

## Conclusion

This setup demonstrates using Redis as a key-value store to cache data in an Express.js application, improving response times for repeated requests.
