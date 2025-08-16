const { Node, STATES } = require('./node');

/**
 * Simple demonstration of leader election concepts
 * This file shows the basic mechanics without the full cluster simulation
 */

console.log('🎓 LEADER ELECTION CONCEPTS DEMONSTRATION');
console.log('=========================================\n');

// Create a simple 3-node cluster
console.log('1. Creating 3 nodes...');
const node1 = new Node(1);
const node2 = new Node(2);
const node3 = new Node(3);

// Set up peer relationships
node1.peers = [node2, node3];
node2.peers = [node1, node3];
node3.peers = [node1, node2];

console.log(
  '\n2. Nodes initialized. They will automatically start election process...',
);
console.log('   - Each node starts as a FOLLOWER');
console.log('   - After election timeout, nodes become CANDIDATES');
console.log('   - Candidates request votes from peers');
console.log('   - First to get majority becomes LEADER\n');

// Show status after a short delay
setTimeout(() => {
  console.log('3. Current Status (after initial election):');
  [node1, node2, node3].forEach((node) => {
    const status = node.getStatus();
    const icon =
      status.state === STATES.LEADER
        ? '👑'
        : status.state === STATES.CANDIDATE
        ? '🗳️'
        : '👥';
    console.log(
      `   ${icon} Node ${status.id}: ${status.state} (Term ${status.term})`,
    );
  });
}, 2000);

// Simulate leader failure
setTimeout(() => {
  console.log('\n4. Simulating leader failure...');
  const leader = [node1, node2, node3].find(
    (n) => n.getStatus().state === STATES.LEADER,
  );
  if (leader) {
    console.log(`   💀 Node ${leader.id} (leader) is going down!`);
    leader.simulateFailure();
    console.log('   🔄 Remaining nodes will elect a new leader...');
  }
}, 4000);

// Show final status
setTimeout(() => {
  console.log('\n5. Final Status (after re-election):');
  [node1, node2, node3].forEach((node) => {
    const status = node.getStatus();
    const icon =
      status.state === STATES.LEADER
        ? '👑'
        : status.state === STATES.CANDIDATE
        ? '🗳️'
        : status.state === 'FAILED'
        ? '💀'
        : '👥';
    console.log(
      `   ${icon} Node ${status.id}: ${status.state} (Term ${status.term})`,
    );
  });

  console.log('\n✨ Key Insights:');
  console.log('   • Only one leader exists at a time');
  console.log('   • Term numbers increase with each election');
  console.log('   • Failed nodes are excluded from new elections');
  console.log(
    '   • System remains available as long as majority of nodes work',
  );
  console.log(
    '\n📚 Run "node cluster.js" for a more detailed simulation!',
  );

  process.exit(0);
}, 6000);
