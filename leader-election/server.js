const { DistributedNode } = require('./distributed-node');

// Get node configuration from command line arguments
const args = process.argv.slice(2);
const nodeId = args[0] || '1';
const port = parseInt(args[1]) || 3000 + parseInt(nodeId);

console.log(`
🚀 Starting Distributed Leader Election Node
============================================
Node ID: ${nodeId}
Port: ${port}
Cluster File: ./cluster.json

Available endpoints:
- GET  http://localhost:${port}/status      - Node status
- GET  http://localhost:${port}/cluster     - Full cluster status  
- POST http://localhost:${port}/step-down   - Force leader to step down

Usage Examples:
- curl http://localhost:${port}/status
- curl http://localhost:${port}/cluster
- curl -X POST http://localhost:${port}/step-down

Press Ctrl+C to stop the node gracefully.
============================================
`);

const node = new DistributedNode(nodeId, port);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await node.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await node.stop();
  process.exit(0);
});

// Start the node
node
  .start()
  .then(() => {
    console.log(
      `✅ Node ${nodeId} is ready and running on port ${port}`,
    );
    console.log(
      `🔍 Monitor cluster status: curl http://localhost:${port}/cluster\n`,
    );
  })
  .catch((error) => {
    console.error('❌ Failed to start node:', error);
    process.exit(1);
  });
