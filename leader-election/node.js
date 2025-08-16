const EventEmitter = require('events');

// Node states
const STATES = {
  FOLLOWER: 'FOLLOWER',
  CANDIDATE: 'CANDIDATE',
  LEADER: 'LEADER',
};

class Node extends EventEmitter {
  constructor(id, peers = []) {
    super();
    this.id = id;
    this.peers = peers;
    this.state = STATES.FOLLOWER;
    this.currentTerm = 0;
    this.votedFor = null;
    this.votes = 0;
    this.leaderId = null;

    // Timeouts
    this.electionTimeout = null;
    this.heartbeatInterval = null;
    this.electionTimeoutMs = this.getRandomElectionTimeout();
    this.heartbeatIntervalMs = 150; // 150ms heartbeat

    this.log(`Node ${this.id} initialized as ${this.state}`);
    this.startElectionTimer();
  }

  // Get random election timeout between 150-300ms to prevent split votes
  getRandomElectionTimeout() {
    return Math.floor(Math.random() * 150) + 150;
  }

  log(message) {
    const timestamp = new Date().toISOString().substr(11, 12);
    console.log(
      `[${timestamp}] Node ${this.id} (${this.state}, Term ${this.currentTerm}): ${message}`,
    );
  }

  // Start election timer - if no heartbeat received, become candidate
  startElectionTimer() {
    this.clearElectionTimer();
    this.electionTimeoutMs = this.getRandomElectionTimeout();

    this.electionTimeout = setTimeout(() => {
      if (this.state !== STATES.LEADER) {
        this.log(`Election timeout reached, starting election`);
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

  // Start leader election process
  startElection() {
    this.state = STATES.CANDIDATE;
    this.currentTerm++;
    this.votedFor = this.id;
    this.votes = 1; // Vote for self
    this.leaderId = null;

    this.log(
      `Started election for term ${this.currentTerm}, voted for self`,
    );

    // Reset election timer
    this.startElectionTimer();

    // Request votes from all peers
    this.requestVotes();
  }

  requestVotes() {
    const voteRequest = {
      type: 'VOTE_REQUEST',
      term: this.currentTerm,
      candidateId: this.id,
      from: this.id,
    };

    this.peers.forEach((peer) => {
      this.log(`Requesting vote from Node ${peer.id}`);
      // Simulate async network delay
      setTimeout(() => {
        peer.handleMessage(voteRequest);
      }, Math.random() * 10);
    });
  }

  // Handle incoming messages
  handleMessage(message) {
    switch (message.type) {
      case 'VOTE_REQUEST':
        this.handleVoteRequest(message);
        break;
      case 'VOTE_RESPONSE':
        this.handleVoteResponse(message);
        break;
      case 'HEARTBEAT':
        this.handleHeartbeat(message);
        break;
    }
  }

  handleVoteRequest(message) {
    const { term, candidateId } = message;

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
        `Granting vote to Node ${candidateId} for term ${term}`,
      );
      this.startElectionTimer(); // Reset election timer
    } else {
      this.log(
        `Denying vote to Node ${candidateId} for term ${term} (already voted for ${this.votedFor})`,
      );
    }

    // Send vote response
    const response = {
      type: 'VOTE_RESPONSE',
      term: this.currentTerm,
      voteGranted: grantVote,
      from: this.id,
      to: candidateId,
    };

    // Find the candidate and send response
    const candidate = this.peers.find(
      (peer) => peer.id === candidateId,
    );
    if (candidate) {
      setTimeout(() => {
        candidate.handleMessage(response);
      }, Math.random() * 10);
    }
  }

  handleVoteResponse(message) {
    const { term, voteGranted, from } = message;

    // Only process if we're still a candidate and term matches
    if (
      this.state !== STATES.CANDIDATE ||
      term !== this.currentTerm
    ) {
      return;
    }

    if (voteGranted) {
      this.votes++;
      this.log(
        `Received vote from Node ${from} (${this.votes}/${
          this.peers.length + 1
        } total)`,
      );

      // Check if we have majority
      const majorityNeeded =
        Math.floor((this.peers.length + 1) / 2) + 1;
      if (this.votes >= majorityNeeded) {
        this.becomeLeader();
      }
    } else {
      this.log(`Vote denied by Node ${from}`);
    }
  }

  becomeLeader() {
    this.state = STATES.LEADER;
    this.leaderId = this.id;
    this.clearElectionTimer();

    this.log(`🎉 BECAME LEADER for term ${this.currentTerm}!`);

    // Start sending heartbeats
    this.sendHeartbeats();
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeats();
    }, this.heartbeatIntervalMs);
  }

  sendHeartbeats() {
    if (this.state !== STATES.LEADER) {
      return;
    }

    const heartbeat = {
      type: 'HEARTBEAT',
      term: this.currentTerm,
      leaderId: this.id,
      from: this.id,
    };

    this.peers.forEach((peer) => {
      setTimeout(() => {
        peer.handleMessage(heartbeat);
      }, Math.random() * 10);
    });
  }

  handleHeartbeat(message) {
    const { term, leaderId } = message;

    // If heartbeat term is higher, update our term
    if (term > this.currentTerm) {
      this.currentTerm = term;
      this.votedFor = null;
    }

    // If term is valid, accept leadership
    if (term >= this.currentTerm) {
      if (this.leaderId !== leaderId) {
        this.log(
          `Acknowledging Node ${leaderId} as leader for term ${term}`,
        );
      }

      this.state = STATES.FOLLOWER;
      this.leaderId = leaderId;
      this.startElectionTimer(); // Reset election timer
    }
  }

  // Simulate node failure (stop sending heartbeats)
  simulateFailure() {
    this.log(`💀 SIMULATING FAILURE - stopping all activities`);
    this.clearElectionTimer();
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.state = 'FAILED';
  }

  // Get current status
  getStatus() {
    return {
      id: this.id,
      state: this.state,
      term: this.currentTerm,
      votedFor: this.votedFor,
      leaderId: this.leaderId,
    };
  }
}

module.exports = { Node, STATES };
