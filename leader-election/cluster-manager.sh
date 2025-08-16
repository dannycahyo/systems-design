#!/bin/bash

# Distributed Leader Election Demo Scripts
# These scripts help you easily start and manage a cluster of nodes

echo "🚀 Distributed Leader Election Cluster Management"
echo "================================================="

case "$1" in
  "start")
    echo "Starting 3-node cluster..."
    echo ""
    
    # Start node 1 in background
    echo "📦 Starting Node 1 on port 3001..."
    node server.js 1 3001 > logs/node1.log 2>&1 &
    NODE1_PID=$!
    echo "Node 1 PID: $NODE1_PID"
    
    # Start node 2 in background  
    echo "📦 Starting Node 2 on port 3002..."
    node server.js 2 3002 > logs/node2.log 2>&1 &
    NODE2_PID=$!
    echo "Node 2 PID: $NODE2_PID"
    
    # Start node 3 in background
    echo "📦 Starting Node 3 on port 3003..."
    node server.js 3 3003 > logs/node3.log 2>&1 &
    NODE3_PID=$!
    echo "Node 3 PID: $NODE3_PID"
    
    # Save PIDs for later cleanup
    echo "$NODE1_PID" > .pids/node1.pid
    echo "$NODE2_PID" > .pids/node2.pid  
    echo "$NODE3_PID" > .pids/node3.pid
    
    echo ""
    echo "✅ Cluster started! Nodes are running in background."
    echo ""
    echo "📊 Monitor cluster status:"
    echo "   curl http://localhost:3001/cluster"
    echo "   curl http://localhost:3002/cluster" 
    echo "   curl http://localhost:3003/cluster"
    echo ""
    echo "🔍 Check individual node status:"
    echo "   curl http://localhost:3001/status"
    echo "   curl http://localhost:3002/status"
    echo "   curl http://localhost:3003/status"
    echo ""
    echo "🛑 Kill leader manually:"
    echo "   curl -X POST http://localhost:300X/step-down"
    echo ""
    echo "💀 Stop cluster:"
    echo "   ./cluster-manager.sh stop"
    ;;
    
  "stop")
    echo "Stopping cluster..."
    
    # Kill nodes using saved PIDs
    for i in 1 2 3; do
      if [ -f ".pids/node$i.pid" ]; then
        PID=$(cat .pids/node$i.pid)
        if kill -0 $PID 2>/dev/null; then
          echo "🛑 Stopping Node $i (PID: $PID)"
          kill $PID
        else
          echo "⚠️  Node $i (PID: $PID) not running"
        fi
        rm -f .pids/node$i.pid
      fi
    done
    
    # Clean up cluster file
    rm -f cluster.json
    echo "✅ Cluster stopped and cleaned up."
    ;;
    
  "status")
    echo "Checking cluster status..."
    echo ""
    
    for port in 3001 3002 3003; do
      echo "Node on port $port:"
      curl -s http://localhost:$port/status 2>/dev/null | jq . || echo "  ❌ Not responding"
      echo ""
    done
    ;;
    
  "logs")
    echo "Recent logs from all nodes:"
    echo "=========================="
    
    for i in 1 2 3; do
      echo ""
      echo "📄 Node $i logs (last 10 lines):"
      if [ -f "logs/node$i.log" ]; then
        tail -10 logs/node$i.log
      else
        echo "  No log file found"
      fi
    done
    ;;
    
  "kill-leader")
    echo "Finding and stopping current leader..."
    
    for port in 3001 3002 3003; do
      STATUS=$(curl -s http://localhost:$port/status 2>/dev/null)
      if echo "$STATUS" | grep -q '"state":"LEADER"'; then
        NODE_ID=$(echo "$STATUS" | jq -r '.id')
        echo "💀 Found leader: Node $NODE_ID on port $port"
        echo "Sending step-down request..."
        curl -X POST http://localhost:$port/step-down
        echo ""
        echo "✅ Leader stepped down. Watch for new election!"
        exit 0
      fi
    done
    
    echo "❌ No leader found in the cluster"
    ;;
    
  "demo")
    echo "🎭 Running interactive demo..."
    echo ""
    echo "This will:"
    echo "1. Start a 3-node cluster"
    echo "2. Show you how to monitor it"
    echo "3. Demonstrate leader failure and re-election"
    echo ""
    read -p "Press Enter to continue..."
    
    # Create necessary directories
    mkdir -p logs .pids
    
    # Start cluster
    ./cluster-manager.sh start
    
    echo "⏳ Waiting for cluster to stabilize..."
    sleep 8
    
    echo ""
    echo "📊 Current cluster status:"
    curl -s http://localhost:3001/cluster | jq .
    
    echo ""
    echo "🎯 Now let's kill the leader and watch re-election..."
    read -p "Press Enter to kill the leader..."
    
    ./cluster-manager.sh kill-leader
    
    echo ""
    echo "⏳ Waiting for re-election..."
    sleep 6
    
    echo ""
    echo "📊 Cluster status after re-election:"
    curl -s http://localhost:3001/cluster | jq .
    
    echo ""
    echo "🎉 Demo complete! The cluster automatically elected a new leader."
    echo ""
    read -p "Press Enter to stop the cluster..."
    
    ./cluster-manager.sh stop
    ;;
    
  *)
    echo "Usage: $0 {start|stop|status|logs|kill-leader|demo}"
    echo ""
    echo "Commands:"
    echo "  start       - Start 3-node cluster in background"
    echo "  stop        - Stop all nodes and cleanup"
    echo "  status      - Check status of all nodes"
    echo "  logs        - Show recent logs from all nodes"
    echo "  kill-leader - Find and stop current leader"
    echo "  demo        - Run interactive demonstration"
    echo ""
    echo "Manual node management:"
    echo "  node server.js <node-id> <port>   - Start single node"
    echo "  node server.js 1 3001             - Start node 1 on port 3001"
    echo "  node server.js 2 3002             - Start node 2 on port 3002"
    echo "  node server.js 3 3003             - Start node 3 on port 3003"
    ;;
esac
