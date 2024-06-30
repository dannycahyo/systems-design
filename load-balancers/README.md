# Load Balancer Demonstration

This lesson demonstrates how to set up Nginx as a load balancer to distribute traffic between multiple instances of an Express.js application.

## Setup

### Express Application

1. Run `npm install` to install the necessary dependencies.
2. In this directory, start two instances of the application on different ports:
   - `PORT=3000 node server.js`
   - `PORT=3001 node server.js`

### Nginx

1. Install Nginx on your system.
2. Replace the content of your `nginx.conf` file with the provided configuration.
3. Start or reload Nginx.

## Testing

To test the load balancer, send multiple requests to your Nginx server's listening port 8081. Observe how requests are distributed between the two application instances:

```bash
curl http://localhost:8080/api/data
```
