const axios = require('axios');

// Cluster monitoring dashboard
class ClusterMonitor {
  constructor(ports = [3001, 3002, 3003]) {
    this.ports = ports;
    this.baseUrls = ports.map((port) => `http://localhost:${port}`);
  }

  async getClusterStatus() {
    const nodes = [];

    for (let i = 0; i < this.baseUrls.length; i++) {
      const url = this.baseUrls[i];
      const port = this.ports[i];

      try {
        const response = await axios.get(`${url}/status`, {
          timeout: 1000,
        });
        nodes.push({
          ...response.data,
          online: true,
          url: url,
        });
      } catch (error) {
        nodes.push({
          id: `unknown`,
          port: port,
          state: 'OFFLINE',
          online: false,
          url: url,
          error: error.message,
        });
      }
    }

    return nodes;
  }

  async printClusterStatus() {
    console.clear();
    console.log('🖥️  DISTRIBUTED LEADER ELECTION CLUSTER MONITOR');
    console.log('===============================================');
    console.log(`📅 ${new Date().toLocaleString()}`);
    console.log('');

    try {
      const nodes = await this.getClusterStatus();
      const leader = nodes.find((node) => node.state === 'LEADER');
      const followers = nodes.filter(
        (node) => node.state === 'FOLLOWER',
      );
      const candidates = nodes.filter(
        (node) => node.state === 'CANDIDATE',
      );
      const offline = nodes.filter((node) => !node.online);

      // Cluster overview
      console.log('📊 CLUSTER OVERVIEW');
      console.log('─'.repeat(50));
      console.log(
        `👑 Leader:     ${
          leader
            ? `Node ${leader.id} (Port ${leader.port}, Term ${leader.term})`
            : 'None'
        }`,
      );
      console.log(`👥 Followers:  ${followers.length} node(s)`);
      console.log(`🗳️  Candidates: ${candidates.length} node(s)`);
      console.log(`💀 Offline:    ${offline.length} node(s)`);
      console.log(`🔗 Total:      ${nodes.length} node(s)`);
      console.log('');

      // Detailed node status
      console.log('📋 NODE DETAILS');
      console.log('─'.repeat(50));

      nodes.forEach((node) => {
        const icon = this.getStateIcon(node.state);
        const status = node.online ? '🟢' : '🔴';
        const termInfo = node.online
          ? `Term ${node.term || 0}`
          : 'Offline';

        console.log(
          `${status} ${icon} Node ${node.id || '?'} (Port ${
            node.port
          }) - ${node.state} - ${termInfo}`,
        );

        if (!node.online) {
          console.log(`    ❌ Error: ${node.error}`);
        } else if (node.leaderId && node.state === 'FOLLOWER') {
          console.log(`    👑 Following: Node ${node.leaderId}`);
        }
      });

      console.log('');

      // System health
      const onlineCount = nodes.filter((n) => n.online).length;
      const healthPercentage = Math.round(
        (onlineCount / nodes.length) * 100,
      );

      console.log('🏥 SYSTEM HEALTH');
      console.log('─'.repeat(50));
      console.log(
        `📡 Connectivity: ${healthPercentage}% (${onlineCount}/${nodes.length} nodes online)`,
      );

      if (leader) {
        console.log(`⚡ Leadership: Stable (Node ${leader.id})`);
      } else if (candidates.length > 0) {
        console.log(
          `⚡ Leadership: Election in progress (${candidates.length} candidates)`,
        );
      } else {
        console.log(`⚡ Leadership: No leader or candidates`);
      }

      // Show current term across cluster
      const terms = nodes
        .filter((n) => n.online && n.term !== undefined)
        .map((n) => n.term);
      if (terms.length > 0) {
        const maxTerm = Math.max(...terms);
        const minTerm = Math.min(...terms);
        console.log(
          `🕐 Consensus: Term ${maxTerm}${
            minTerm !== maxTerm
              ? ` (inconsistent: ${minTerm}-${maxTerm})`
              : ' (consistent)'
          }`,
        );
      }
    } catch (error) {
      console.log('❌ Error fetching cluster status:', error.message);
    }

    console.log('');
    console.log(
      '🔄 Auto-refreshing every 3 seconds... (Press Ctrl+C to exit)',
    );
    console.log('💡 Manual commands:');
    console.log(
      '   curl http://localhost:3001/cluster  - Detailed cluster info',
    );
    console.log(
      '   curl -X POST http://localhost:300X/step-down  - Force leader to step down',
    );
  }

  getStateIcon(state) {
    switch (state) {
      case 'LEADER':
        return '👑';
      case 'CANDIDATE':
        return '🗳️';
      case 'FOLLOWER':
        return '👥';
      default:
        return '💀';
    }
  }

  startMonitoring() {
    // Initial display
    this.printClusterStatus();

    // Update every 3 seconds
    this.interval = setInterval(() => {
      this.printClusterStatus();
    }, 3000);
  }

  stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

// Check if running directly (not imported)
if (require.main === module) {
  const monitor = new ClusterMonitor();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Stopping monitor...');
    monitor.stopMonitoring();
    process.exit(0);
  });

  console.log('🚀 Starting cluster monitor...');
  console.log('📡 Monitoring ports: 3001, 3002, 3003');
  console.log('');

  monitor.startMonitoring();
}

module.exports = ClusterMonitor;
