const { Node, STATES } = require('./node');

class Cluster {
  constructor(nodeCount = 5) {
    this.nodes = [];
    this.nodeCount = nodeCount;

    console.log(
      `\n🚀 Starting Leader Election Cluster with ${nodeCount} nodes\n`,
    );
    console.log('=' * 80);

    // Create nodes
    for (let i = 1; i <= nodeCount; i++) {
      this.nodes.push(new Node(i));
    }

    // Set peers for each node (all other nodes)
    this.nodes.forEach((node) => {
      node.peers = this.nodes.filter((n) => n.id !== node.id);
    });

    // Start monitoring cluster state
    this.startMonitoring();

    // Simulate leader failure after some time
    setTimeout(() => {
      this.simulateLeaderFailure();
    }, 8000);

    // Show final status
    setTimeout(() => {
      this.showClusterStatus();
      console.log(
        '\n🏁 Cluster simulation completed. You can see how leader election works!',
      );
      console.log(
        '📚 Check the README.md for more information about the algorithm.',
      );
    }, 15000);
  }

  startMonitoring() {
    console.log('\n📊 Cluster Status Updates:\n');

    this.monitoringInterval = setInterval(() => {
      this.showClusterStatus();
    }, 2000);

    // Stop monitoring after demo
    setTimeout(() => {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }
    }, 14000);
  }

  showClusterStatus() {
    const timestamp = new Date().toISOString().substr(11, 8);
    console.log(`\n[${timestamp}] 📋 CLUSTER STATUS:`);
    console.log('─'.repeat(60));

    let leader = null;
    let followers = [];
    let candidates = [];
    let failed = [];

    this.nodes.forEach((node) => {
      const status = node.getStatus();
      const stateIcon = this.getStateIcon(status.state);

      switch (status.state) {
        case STATES.LEADER:
          leader = status;
          console.log(
            `${stateIcon} Node ${status.id}: Leader (Term ${status.term})`,
          );
          break;
        case STATES.CANDIDATE:
          candidates.push(status);
          console.log(
            `${stateIcon} Node ${status.id}: Candidate (Term ${status.term})`,
          );
          break;
        case STATES.FOLLOWER:
          followers.push(status);
          console.log(
            `${stateIcon} Node ${status.id}: Follower (Term ${status.term})`,
          );
          break;
        default:
          failed.push(status);
      }
    });

    // Show leader
    if (leader) {
      console.log(
        `👑 LEADER:    Node ${leader.id} (Term ${leader.term})`,
      );
    } else {
      console.log(`👑 LEADER:    None - Election in progress`);
    }

    // Show candidates
    if (candidates.length > 0) {
      console.log(
        `🗳️  CANDIDATES: ${candidates
          .map((c) => `Node ${c.id}`)
          .join(', ')}`,
      );
    }

    // Show followers
    if (followers.length > 0) {
      const leaderInfo = leader
        ? ` (following Node ${leader.id})`
        : ' (no leader)';
      console.log(
        `👥 FOLLOWERS: ${followers
          .map((f) => `Node ${f.id}`)
          .join(', ')}${leaderInfo}`,
      );
    }

    // Show failed nodes
    if (failed.length > 0) {
      console.log(
        `💀 FAILED:    ${failed
          .map((f) => `Node ${f.id}`)
          .join(', ')}`,
      );
    }

    console.log('─'.repeat(60));
  }

  getStateIcon(state) {
    switch (state) {
      case STATES.LEADER:
        return '👑';
      case STATES.CANDIDATE:
        return '🗳️';
      case STATES.FOLLOWER:
        return '👥';
      default:
        return '💀';
    }
  }

  simulateLeaderFailure() {
    const leader = this.nodes.find(
      (node) => node.getStatus().state === STATES.LEADER,
    );

    if (leader) {
      console.log(
        `\n⚠️  SIMULATING LEADER FAILURE - Node ${leader.id} is going down!`,
      );
      console.log(
        '🔄 Watch as the remaining nodes elect a new leader...\n',
      );
      leader.simulateFailure();
    } else {
      console.log(
        '\n⚠️  No leader found to simulate failure - election may still be in progress',
      );
    }
  }

  getCurrentLeader() {
    return this.nodes.find(
      (node) => node.getStatus().state === STATES.LEADER,
    );
  }

  getAliveNodes() {
    return this.nodes.filter(
      (node) => node.getStatus().state !== 'FAILED',
    );
  }
}

// Demo scenarios
function runBasicDemo() {
  console.log('🎯 BASIC LEADER ELECTION DEMONSTRATION');
  console.log('=======================================\n');
  console.log('This demo shows:');
  console.log('1. Initial election when cluster starts');
  console.log('2. Leader sending heartbeats to followers');
  console.log('3. Re-election when leader fails');
  console.log('4. Consensus among remaining nodes\n');

  new Cluster(5);
}

function runSmallClusterDemo() {
  console.log('🎯 SMALL CLUSTER DEMONSTRATION (3 nodes)');
  console.log('=========================================\n');
  console.log(
    'This demo shows leader election with minimal majority (2/3 nodes)\n',
  );

  new Cluster(3);
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--small')) {
  runSmallClusterDemo();
} else if (args.includes('--help')) {
  console.log('Leader Election Cluster Demo\n');
  console.log('Usage:');
  console.log('  node cluster.js          - Run basic 5-node demo');
  console.log('  node cluster.js --small  - Run 3-node demo');
  console.log('  node cluster.js --help   - Show this help\n');
} else {
  runBasicDemo();
}
