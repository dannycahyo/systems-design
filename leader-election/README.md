# Distributed Leader Election System

This lesson demonstrates **real distributed leader election** using independent HTTP servers that communicate over the network. Unlike simulations, this implementation shows how leader election works in actual distributed systems like Kubernetes with etcd, Apache Kafka, or MongoDB replica sets.

## Key Features

### Real Distributed Architecture

- **Independent Servers**: Each node runs as a separate HTTP server
- **Network Communication**: Nodes communicate via REST APIs over HTTP
- **Service Discovery**: Automatic peer discovery using shared cluster registry
- **Graceful Handling**: Proper handling of network failures and node crashes

### Production-Like Behavior

- **Realistic Timeouts**: Longer timeouts suitable for network communication
- **Health Monitoring**: HTTP endpoints for monitoring cluster status
- **Fault Tolerance**: Automatic re-election when leaders fail
- **Concurrent Safety**: Thread-safe operations and atomic state changes

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

## Quick Start

### Automated Cluster Management

The easiest way to explore leader election:

```bash
# Start interactive demo (recommended)
./cluster-manager.sh demo

# Or manually manage cluster
./cluster-manager.sh start    # Start 3-node cluster
./cluster-manager.sh status   # Check cluster status
./cluster-manager.sh stop     # Stop cluster
```

### Manual Node Management

Start individual nodes to see real distributed behavior:

```bash
# Terminal 1: Start Node 1 (will become leader)
node server.js 1 3001

# Terminal 2: Start Node 2 (will become follower)
node server.js 2 3002

# Terminal 3: Start Node 3 (will become follower)
node server.js 3 3003
```

### Real-time Monitoring

```bash
# Live cluster dashboard
node monitor.js

# Manual status checks
curl http://localhost:3001/cluster
curl http://localhost:3002/status
```

## Testing Real Scenarios

### Scenario 1: Normal Startup

```bash
# Start nodes one by one and observe leadership
node server.js 1 3001  # Becomes leader (first node)
node server.js 2 3002  # Becomes follower
node server.js 3 3003  # Becomes follower
```

### Scenario 2: Leader Failure

```bash
# Kill the leader process (Ctrl+C) and watch re-election
# Or use the API:
curl -X POST http://localhost:3001/step-down
```

### Scenario 3: Node Recovery

```bash
# Restart a failed node - it will automatically become follower
node server.js 1 3001  # Rejoins as follower even if it was leader before
```

### Scenario 4: Network Monitoring

```bash
# Monitor cluster status in real-time
node monitor.js

# Check individual node status
curl http://localhost:3001/status
curl http://localhost:3002/cluster
```

## API Endpoints

Each node exposes REST APIs for monitoring and control:

```bash
# Node status
GET http://localhost:300X/status

# Full cluster status
GET http://localhost:300X/cluster

# Force leader to step down (testing)
POST http://localhost:300X/step-down
```

## Architecture

### Distributed Components

- **`server.js`**: Individual node server (can be started independently)
- **`distributed-node.js`**: Core leader election logic with HTTP communication
- **`monitor.js`**: Real-time cluster monitoring dashboard
- **`cluster-manager.sh`**: Automation scripts for cluster management
- **`cluster.json`**: Service discovery registry (auto-generated)

### Communication Flow

1. **Service Discovery**: Nodes register in `cluster.json` when starting
2. **Elections**: HTTP POST requests for vote solicitation
3. **Heartbeats**: Periodic HTTP POST from leader to followers
4. **Monitoring**: HTTP GET endpoints for status and cluster info

### Network Protocol

```
Vote Request:  POST /vote-request   {term, candidateId}
Vote Response: 200 OK               {term, voteGranted}
Heartbeat:     POST /heartbeat      {term, leaderId}
Status:        GET /status          {id, state, term, ...}
Cluster Info:  GET /cluster         {cluster[], leader, term}
```

## Experiments & Learning

### Experiment 1: Timing Configuration

```bash
# Edit distributed-node.js to adjust:
this.heartbeatIntervalMs = 2000;      # Heartbeat frequency
this.getRandomElectionTimeout();      # Election timeout range
this.requestTimeoutMs = 1000;         # Network request timeout
```

### Experiment 2: Network Failures

```bash
# Simulate network partitions by blocking ports
sudo iptables -A OUTPUT -p tcp --dport 3002 -j DROP  # Block Node 2
# Watch how cluster handles the partition
sudo iptables -D OUTPUT -p tcp --dport 3002 -j DROP  # Restore
```

### Experiment 3: Cluster Scaling

```bash
# Start additional nodes
node server.js 4 3004
node server.js 5 3005
# Observe how majority voting adapts
```

### Experiment 4: Leader Behavior

```bash
# Force step-down and observe re-election
curl -X POST http://localhost:3001/step-down
# Monitor re-election process
node monitor.js
```

## Real-World Parallels

This implementation demonstrates concepts used in:

- **Kubernetes etcd**: Cluster coordination and configuration storage
- **Apache Kafka**: Partition leader election for high availability
- **MongoDB Replica Sets**: Primary election for write operations
- **Consul**: Service discovery and health checking
- **Apache Zookeeper**: Distributed coordination service

## Key Insights for Distributed Systems

1. **Network Realities**: Real network delays require longer timeouts than simulations
2. **Split-Brain Prevention**: Majority voting prevents multiple leaders
3. **Service Discovery**: Nodes need mechanisms to find each other
4. **Health Monitoring**: Monitoring is crucial for distributed system operations
5. **Graceful Degradation**: Systems must handle partial failures elegantly
6. **State Consistency**: All nodes must eventually converge on the same view

This implementation provides hands-on experience with the challenges and solutions in real distributed systems, preparing you for working with production distributed architectures.
