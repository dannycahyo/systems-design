# Reverse Proxy Demonstration

This lesson demonstrates how to set up a reverse proxy using Nginx in front of an Express.js application. The reverse proxy will forward requests to the Express application and return responses to the client.

## Setup

### Express Application

1. Run `npm install` to install the necessary dependencies.
2. In this directory, start the application with `node server.js`.

### Nginx

1. Install Nginx on your system.
2. Replace the content of your `nginx.conf` file with the provided configuration.
3. Start or reload Nginx.

## Testing

To test the reverse proxy, send a request to your Nginx server's domain or IP address followed by `/api/data`. You should receive a response from the Express application through Nginx.

```bash
curl http://localhost:8081/api/data
```
