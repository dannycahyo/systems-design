const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Node states
const STATES = {
  FOLLOWER: 'FOLLOWER',
  CANDIDATE: 'CANDIDATE',
  LEADER: 'LEADER',
};

class DistributedNode {
  constructor(id, port, clusterFile = './cluster.json') {
    this.id = id;
    this.port = port;
    this.clusterFile = clusterFile;
    this.state = STATES.FOLLOWER;
    this.currentTerm = 0;
    this.votedFor = null;
    this.votes = 0;
    this.leaderId = null;
    this.peers = [];

    // Network timeouts (longer than simulation for real network delays)
    this.electionTimeout = null;
    this.heartbeatInterval = null;
    this.electionTimeoutMs = this.getRandomElectionTimeout();
    this.heartbeatIntervalMs = 2000; // 2 seconds heartbeat
    this.requestTimeoutMs = 1000; // 1 second request timeout

    // Express app
    this.app = express();
    this.app.use(express.json());
    this.setupRoutes();

    this.log(`Node ${this.id} initializing on port ${this.port}`);
  }

  getRandomElectionTimeout() {
    return Math.floor(Math.random() * 3000) + 5000; // 5-8 seconds
  }

  log(message) {
    const timestamp = new Date().toISOString().substr(11, 12);
    console.log(
      `[${timestamp}] Node ${this.id}:${this.port} (${this.state}, Term ${this.currentTerm}): ${message}`,
    );
  }

  setupRoutes() {
    // Status endpoint
    this.app.get('/status', (req, res) => {
      res.json({
        id: this.id,
        port: this.port,
        state: this.state,
        term: this.currentTerm,
        votedFor: this.votedFor,
        leaderId: this.leaderId,
        peers: this.peers.map((p) => ({ id: p.id, port: p.port })),
        uptime: process.uptime(),
      });
    });

    // Cluster status endpoint
    this.app.get('/cluster', async (req, res) => {
      try {
        const clusterStatus = await this.getClusterStatus();
        res.json(clusterStatus);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Vote request endpoint
    this.app.post('/vote-request', (req, res) => {
      const { term, candidateId } = req.body;
      const response = this.handleVoteRequest(term, candidateId);
      res.json(response);
    });

    // Heartbeat endpoint
    this.app.post('/heartbeat', (req, res) => {
      const { term, leaderId } = req.body;
      this.handleHeartbeat(term, leaderId);
      res.json({ received: true });
    });

    // Manual leadership step down (for testing)
    this.app.post('/step-down', (req, res) => {
      if (this.state === STATES.LEADER) {
        this.log('Stepping down as leader (manual request)');
        this.stepDown();
        res.json({ message: 'Stepped down successfully' });
      } else {
        res.status(400).json({ error: 'Not currently leader' });
      }
    });
  }

  async start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        this.log(`Server started on port ${this.port}`);
        this.registerWithCluster();
        this.discoverPeers();
        this.startElectionTimer();
        resolve();
      });
    });
  }

  async stop() {
    this.log('Shutting down...');
    this.clearElectionTimer();
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Unregister from cluster
    this.unregisterFromCluster();

    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          this.log('Server stopped');
          resolve();
        });
      });
    }
  }

  registerWithCluster() {
    let cluster = [];

    // Load existing cluster file
    if (fs.existsSync(this.clusterFile)) {
      try {
        cluster = JSON.parse(
          fs.readFileSync(this.clusterFile, 'utf8'),
        );
      } catch (error) {
        this.log('Error reading cluster file, starting fresh');
        cluster = [];
      }
    }

    // Add this node if not already present
    const existingNode = cluster.find((node) => node.id === this.id);
    if (!existingNode) {
      cluster.push({
        id: this.id,
        port: this.port,
        joinedAt: new Date().toISOString(),
      });

      fs.writeFileSync(
        this.clusterFile,
        JSON.stringify(cluster, null, 2),
      );
      this.log('Registered with cluster');
    } else {
      // Update port in case it changed
      existingNode.port = this.port;
      existingNode.lastSeen = new Date().toISOString();
      fs.writeFileSync(
        this.clusterFile,
        JSON.stringify(cluster, null, 2),
      );
      this.log('Updated registration in cluster');
    }
  }

  unregisterFromCluster() {
    if (fs.existsSync(this.clusterFile)) {
      try {
        let cluster = JSON.parse(
          fs.readFileSync(this.clusterFile, 'utf8'),
        );
        cluster = cluster.filter((node) => node.id !== this.id);
        fs.writeFileSync(
          this.clusterFile,
          JSON.stringify(cluster, null, 2),
        );
        this.log('Unregistered from cluster');
      } catch (error) {
        this.log('Error unregistering from cluster');
      }
    }
  }

  discoverPeers() {
    if (!fs.existsSync(this.clusterFile)) {
      return;
    }

    try {
      const cluster = JSON.parse(
        fs.readFileSync(this.clusterFile, 'utf8'),
      );
      this.peers = cluster
        .filter((node) => node.id !== this.id)
        .map((node) => ({
          id: node.id,
          port: node.port,
          url: `http://localhost:${node.port}`,
        }));

      this.log(
        `Discovered ${this.peers.length} peers: ${this.peers
          .map((p) => `${p.id}:${p.port}`)
          .join(', ')}`,
      );
    } catch (error) {
      this.log('Error discovering peers');
    }
  }

  startElectionTimer() {
    this.clearElectionTimer();
    this.electionTimeoutMs = this.getRandomElectionTimeout();

    this.electionTimeout = setTimeout(() => {
      if (this.state !== STATES.LEADER) {
        this.log(
          `Election timeout reached (${this.electionTimeoutMs}ms), starting election`,
        );
        this.startElection();
      }
    }, this.electionTimeoutMs);
  }

  clearElectionTimer() {
    if (this.electionTimeout) {
      clearTimeout(this.electionTimeout);
      this.electionTimeout = null;
    }
  }

  async startElection() {
    this.state = STATES.CANDIDATE;
    this.currentTerm++;
    this.votedFor = this.id;
    this.votes = 1; // Vote for self
    this.leaderId = null;

    this.log(
      `🗳️ Started election for term ${this.currentTerm}, voted for self`,
    );

    // Reset election timer
    this.startElectionTimer();

    // Rediscover peers in case cluster changed
    this.discoverPeers();

    // Request votes from all peers
    await this.requestVotes();
  }

  async requestVotes() {
    const votePromises = this.peers.map(async (peer) => {
      try {
        this.log(`Requesting vote from Node ${peer.id}:${peer.port}`);

        const response = await axios.post(
          `${peer.url}/vote-request`,
          {
            term: this.currentTerm,
            candidateId: this.id,
          },
          {
            timeout: this.requestTimeoutMs,
          },
        );

        if (response.data.voteGranted) {
          this.votes++;
          this.log(
            `✅ Received vote from Node ${peer.id} (${this.votes}/${
              this.peers.length + 1
            } total)`,
          );

          // Check if we have majority
          const majorityNeeded =
            Math.floor((this.peers.length + 1) / 2) + 1;
          if (
            this.votes >= majorityNeeded &&
            this.state === STATES.CANDIDATE
          ) {
            this.becomeLeader();
          }
        } else {
          this.log(`❌ Vote denied by Node ${peer.id}`);
        }
      } catch (error) {
        this.log(
          `❌ Failed to request vote from Node ${peer.id}: ${error.message}`,
        );
      }
    });

    await Promise.allSettled(votePromises);
  }

  handleVoteRequest(term, candidateId) {
    // If message term is higher, update our term and become follower
    if (term > this.currentTerm) {
      this.currentTerm = term;
      this.votedFor = null;
      this.state = STATES.FOLLOWER;
      this.leaderId = null;
      this.log(`Received higher term ${term}, becoming follower`);
    }

    // Grant vote if we haven't voted in this term and term is valid
    const grantVote =
      term >= this.currentTerm &&
      (this.votedFor === null || this.votedFor === candidateId);

    if (grantVote) {
      this.votedFor = candidateId;
      this.log(
        `✅ Granting vote to Node ${candidateId} for term ${term}`,
      );
      this.startElectionTimer(); // Reset election timer
    } else {
      this.log(
        `❌ Denying vote to Node ${candidateId} for term ${term} (already voted for ${this.votedFor})`,
      );
    }

    return {
      term: this.currentTerm,
      voteGranted: grantVote,
    };
  }

  becomeLeader() {
    this.state = STATES.LEADER;
    this.leaderId = this.id;
    this.clearElectionTimer();

    this.log(`👑 BECAME LEADER for term ${this.currentTerm}!`);

    // Start sending heartbeats
    this.sendHeartbeats();
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeats();
    }, this.heartbeatIntervalMs);
  }

  async sendHeartbeats() {
    if (this.state !== STATES.LEADER) {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      return;
    }

    // Rediscover peers in case cluster changed
    this.discoverPeers();

    const heartbeatPromises = this.peers.map(async (peer) => {
      try {
        await axios.post(
          `${peer.url}/heartbeat`,
          {
            term: this.currentTerm,
            leaderId: this.id,
          },
          {
            timeout: this.requestTimeoutMs,
          },
        );
      } catch (error) {
        this.log(
          `❌ Failed to send heartbeat to Node ${peer.id}: ${error.message}`,
        );
      }
    });

    await Promise.allSettled(heartbeatPromises);
  }

  handleHeartbeat(term, leaderId) {
    // If heartbeat term is higher, update our term
    if (term > this.currentTerm) {
      this.currentTerm = term;
      this.votedFor = null;
    }

    // If term is valid, accept leadership
    if (term >= this.currentTerm) {
      if (this.leaderId !== leaderId) {
        this.log(
          `👑 Acknowledging Node ${leaderId} as leader for term ${term}`,
        );
      }

      this.state = STATES.FOLLOWER;
      this.leaderId = leaderId;
      this.startElectionTimer(); // Reset election timer
    }
  }

  stepDown() {
    if (this.state === STATES.LEADER) {
      this.state = STATES.FOLLOWER;
      this.clearElectionTimer();
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      this.startElectionTimer();
      this.log('Stepped down from leadership');
    }
  }

  async getClusterStatus() {
    const cluster = [];

    // Add current node
    cluster.push({
      id: this.id,
      port: this.port,
      state: this.state,
      term: this.currentTerm,
      leaderId: this.leaderId,
      online: true,
    });

    // Check peer status
    for (const peer of this.peers) {
      try {
        const response = await axios.get(`${peer.url}/status`, {
          timeout: 1000,
        });
        cluster.push({
          ...response.data,
          online: true,
        });
      } catch (error) {
        cluster.push({
          id: peer.id,
          port: peer.port,
          state: 'OFFLINE',
          online: false,
          error: error.message,
        });
      }
    }

    return {
      cluster,
      leader: cluster.find((node) => node.state === STATES.LEADER),
      term: Math.max(
        ...cluster.filter((n) => n.online).map((n) => n.term || 0),
      ),
    };
  }
}

module.exports = { DistributedNode, STATES };
