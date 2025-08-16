# Leader Election in Distributed Systems

This lesson demonstrates the concept of leader election in distributed systems using a simplified Raft-inspired consensus algorithm implementation in JavaScript. Leader election is a critical component in distributed systems that ensures one node acts as the coordinator for the cluster.

## Key Concepts

### Leader Election

The process by which nodes in a cluster elect a single "leader" responsible for coordinating operations and making decisions for the entire cluster. When properly implemented, leader election ensures all nodes know who the current leader is and can elect a new leader if the current one fails.

### Consensus Algorithm

Complex algorithms used to achieve agreement among distributed nodes. This implementation demonstrates key concepts from the Raft consensus algorithm, including:

- **Terms**: Logical time periods that help nodes stay synchronized
- **Elections**: Process of choosing a new leader when needed
- **Heartbeats**: Regular messages from leader to followers to maintain leadership

### Node States

- **Follower**: Default state, responds to requests from leaders and candidates
- **Candidate**: Transitional state when a node is trying to become leader
- **Leader**: Coordinates the cluster and sends heartbeats to followers

## Real-World Applications

Leader election is used in many distributed systems:

- **etcd**: Kubernetes uses etcd for configuration storage and leader election
- **Apache Kafka**: Partition leaders are elected to handle reads/writes
- **MongoDB**: Replica sets use leader election for primary node selection
- **ZooKeeper**: Provides leader election services for other distributed applications

## Setup

1. Install dependencies by running `npm install` in the root directory.
2. In this directory, start the cluster simulation with `node cluster.js`.

## Usage

The application simulates a cluster of 5 nodes implementing leader election:

- Each node starts as a **Follower**
- When no heartbeats are received, nodes become **Candidates** and start an election
- Candidates request votes from other nodes
- The first candidate to receive majority votes becomes the **Leader**
- The leader sends periodic heartbeats to maintain leadership
- If the leader fails, a new election begins

## Testing

Start the simulation:

```bash
node cluster.js
```

The console will show:

- Node state changes (Follower → Candidate → Leader)
- Vote requests and responses
- Heartbeat messages
- Election timeouts and new elections

You can also test individual scenarios:

```bash
# Run a simple demonstration showing key concepts
node demo.js

# Run different cluster sizes
node cluster.js --small  # 3-node cluster
node cluster.js          # 5-node cluster
```

## Experiment

- Modify the election timeout values in `node.js` to see how it affects election frequency
- Adjust the heartbeat interval to observe the impact on system stability
- Try changing the cluster size in `cluster.js` to understand how majority voting works
- Simulate network partitions by temporarily stopping message delivery between nodes

## Key Insights

1. **Split Votes**: When multiple candidates start elections simultaneously, votes may be split, requiring multiple election rounds
2. **Randomized Timeouts**: Random election timeouts prevent repeated split votes
3. **Majority Requirement**: A candidate needs more than half the votes to become leader
4. **Term Numbers**: Higher term numbers take precedence, ensuring newer elections override older ones
5. **Heartbeat Frequency**: Too frequent heartbeats waste resources, too infrequent heartbeats cause unnecessary elections

This implementation provides a foundation for understanding how distributed systems achieve consensus and maintain coordination in the presence of failures.
