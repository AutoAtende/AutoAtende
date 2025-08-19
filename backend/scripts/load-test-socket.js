#!/usr/bin/env node

/**
 * Comprehensive Socket.io Load Testing Script
 * Tests the optimized Socket.io implementation under various load conditions
 */

const { io } = require('socket.io-client');
const { performance } = require('perf_hooks');

// Configuration
const CONFIG = {
  // Server configuration
  serverUrl: process.env.SOCKET_URL || 'http://localhost:3000',
  
  // Test configuration
  maxConnections: parseInt(process.env.MAX_CONNECTIONS) || 1000,
  rampUpTime: parseInt(process.env.RAMP_UP_TIME) || 60000, // 1 minute
  testDuration: parseInt(process.env.TEST_DURATION) || 300000, // 5 minutes
  
  // Event configuration
  eventsPerSecond: parseInt(process.env.EVENTS_PER_SECOND) || 100,
  messageSize: parseInt(process.env.MESSAGE_SIZE) || 1024, // 1KB
  
  // Authentication
  authToken: process.env.AUTH_TOKEN || 'test-token',
  companyId: parseInt(process.env.COMPANY_ID) || 1,
  
  // Test scenarios
  scenarios: {
    connectionTest: true,
    messageFlood: true,
    roomJoining: true,
    batchedEvents: true,
    disconnectionTest: true,
  },
};

// Metrics tracking
const metrics = {
  connections: {
    attempted: 0,
    successful: 0,
    failed: 0,
    disconnected: 0,
  },
  events: {
    sent: 0,
    received: 0,
    errors: 0,
  },
  timing: {
    connectionTimes: [],
    eventLatencies: [],
    roundTripTimes: [],
  },
  errors: [],
  memoryUsage: [],
};

// Active connections tracking
const activeConnections = new Map();
let testStartTime;
let testEndTime;

/**
 * Generate test authentication token
 */
function generateTestToken() {
  // In a real scenario, this would be a valid JWT token
  // For testing, we'll use the configured token
  return CONFIG.authToken;
}

/**
 * Generate test message payload
 */
function generateTestMessage(size = CONFIG.messageSize) {
  const data = {
    id: Math.random().toString(36).substring(2),
    timestamp: Date.now(),
    type: 'test_message',
    content: 'A'.repeat(Math.max(0, size - 100)), // Adjust for metadata
    metadata: {
      sender: 'load_test',
      sequence: metrics.events.sent + 1,
    },
  };
  
  return data;
}

/**
 * Create and configure a test socket connection
 */
function createTestSocket(connectionId) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    
    const socket = io(CONFIG.serverUrl, {
      transports: ['websocket'],
      timeout: 10000,
      query: {
        token: generateTestToken(),
      },
      extraHeaders: {
        'User-Agent': `LoadTest-${connectionId}`,
        'X-Test-Connection': connectionId,
      },
    });

    // Connection success
    socket.on('connect', () => {
      const connectionTime = performance.now() - startTime;
      metrics.connections.successful++;
      metrics.timing.connectionTimes.push(connectionTime);
      
      console.log(`✓ Connection ${connectionId} established in ${connectionTime.toFixed(2)}ms`);
      
      // Store connection info
      activeConnections.set(connectionId, {
        socket,
        connectedAt: Date.now(),
        messagesSent: 0,
        messagesReceived: 0,
        errors: 0,
      });
      
      resolve(socket);
    });

    // Connection failure
    socket.on('connect_error', (error) => {
      metrics.connections.failed++;
      metrics.errors.push({
        type: 'connection_error',
        connectionId,
        error: error.message,
        timestamp: Date.now(),
      });
      
      console.error(`✗ Connection ${connectionId} failed:`, error.message);
      reject(error);
    });

    // Disconnection
    socket.on('disconnect', (reason) => {
      metrics.connections.disconnected++;
      const connectionInfo = activeConnections.get(connectionId);
      
      if (connectionInfo) {
        const duration = Date.now() - connectionInfo.connectedAt;
        console.log(`◦ Connection ${connectionId} disconnected after ${duration}ms: ${reason}`);
        activeConnections.delete(connectionId);
      }
    });

    // Message received
    socket.on('test_response', (data) => {
      const connectionInfo = activeConnections.get(connectionId);
      if (connectionInfo) {
        connectionInfo.messagesReceived++;
        metrics.events.received++;
        
        // Calculate round-trip time if timestamp is present
        if (data.originalTimestamp) {
          const rtt = Date.now() - data.originalTimestamp;
          metrics.timing.roundTripTimes.push(rtt);
        }
      }
    });

    // Batched events
    socket.on('batched_events', (batchData) => {
      const connectionInfo = activeConnections.get(connectionId);
      if (connectionInfo && batchData.events) {
        connectionInfo.messagesReceived += batchData.events.length;
        metrics.events.received += batchData.events.length;
        
        console.log(`📦 Received batch with ${batchData.events.length} events`);
      }
    });

    // Error handling
    socket.on('error', (error) => {
      const connectionInfo = activeConnections.get(connectionId);
      if (connectionInfo) {
        connectionInfo.errors++;
      }
      
      metrics.events.errors++;
      metrics.errors.push({
        type: 'socket_error',
        connectionId,
        error: error.message,
        timestamp: Date.now(),
      });
    });

    // Timeout for connection
    setTimeout(() => {
      if (!socket.connected) {
        metrics.connections.failed++;
        reject(new Error('Connection timeout'));
      }
    }, 10000);
  });
}

/**
 * Send test messages from a connection
 */
function sendTestMessages(connectionId, messagesPerSecond = 1) {
  const connectionInfo = activeConnections.get(connectionId);
  if (!connectionInfo || !connectionInfo.socket.connected) {
    return;
  }

  const interval = 1000 / messagesPerSecond;
  
  const sendMessage = () => {
    if (!connectionInfo.socket.connected) {
      return;
    }

    const message = generateTestMessage();
    const sendTime = Date.now();
    
    connectionInfo.socket.emit('test_message', {
      ...message,
      originalTimestamp: sendTime,
    });
    
    connectionInfo.messagesSent++;
    metrics.events.sent++;
  };

  // Send initial message
  sendMessage();
  
  // Set up interval for continuous sending
  const messageInterval = setInterval(() => {
    if (connectionInfo.socket.connected && testStartTime && Date.now() - testStartTime < CONFIG.testDuration) {
      sendMessage();
    } else {
      clearInterval(messageInterval);
    }
  }, interval);
}

/**
 * Test room joining and leaving
 */
async function testRoomOperations(connectionId) {
  const connectionInfo = activeConnections.get(connectionId);
  if (!connectionInfo) return;

  const { socket } = connectionInfo;
  const rooms = [`test-room-${connectionId % 10}`, `company-${CONFIG.companyId}`, `user-${connectionId}`];

  try {
    // Join rooms
    for (const room of rooms) {
      socket.emit('joinRoom', { room });
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    }

    // Wait a bit, then leave rooms
    setTimeout(() => {
      for (const room of rooms) {
        socket.emit('leaveRoom', { room });
      }
    }, 30000); // Leave after 30 seconds

  } catch (error) {
    console.error(`Error in room operations for connection ${connectionId}:`, error);
  }
}

/**
 * Ramp up connections gradually
 */
async function rampUpConnections() {
  console.log(`🚀 Starting ramp-up: ${CONFIG.maxConnections} connections over ${CONFIG.rampUpTime}ms`);
  
  const connectionsPerInterval = Math.max(1, Math.floor(CONFIG.maxConnections / (CONFIG.rampUpTime / 1000)));
  const intervalDuration = 1000; // 1 second intervals
  
  let connectionId = 0;
  const rampUpInterval = setInterval(async () => {
    const batch = [];
    
    // Create batch of connections
    for (let i = 0; i < connectionsPerInterval && connectionId < CONFIG.maxConnections; i++) {
      connectionId++;
      metrics.connections.attempted++;
      
      batch.push(
        createTestSocket(connectionId)
          .then(socket => {
            // Start sending messages after connection
            if (CONFIG.scenarios.messageFlood) {
              setTimeout(() => {
                const messagesPerSecond = CONFIG.eventsPerSecond / CONFIG.maxConnections;
                sendTestMessages(connectionId, Math.max(0.1, messagesPerSecond));
              }, 1000);
            }
            
            // Test room operations
            if (CONFIG.scenarios.roomJoining) {
              setTimeout(() => testRoomOperations(connectionId), 2000);
            }
            
            return socket;
          })
          .catch(error => {
            console.error(`Failed to create connection ${connectionId}:`, error);
          })
      );
    }
    
    // Wait for batch to complete
    await Promise.allSettled(batch);
    
    console.log(`📊 Connections: ${metrics.connections.successful}/${CONFIG.maxConnections} successful`);
    
    // Check if ramp-up is complete
    if (connectionId >= CONFIG.maxConnections) {
      clearInterval(rampUpInterval);
      console.log(`✅ Ramp-up complete: ${metrics.connections.successful} connections established`);
      
      // Start main test phase
      startMainTestPhase();
    }
  }, intervalDuration);
}

/**
 * Start the main test phase
 */
function startMainTestPhase() {
  console.log(`🧪 Starting main test phase for ${CONFIG.testDuration}ms`);
  testStartTime = Date.now();
  
  // Collect metrics periodically
  const metricsInterval = setInterval(() => {
    collectMetrics();
    printMetrics();
  }, 10000); // Every 10 seconds
  
  // End test after duration
  setTimeout(() => {
    testEndTime = Date.now();
    clearInterval(metricsInterval);
    endTest();
  }, CONFIG.testDuration);
}

/**
 * Collect current metrics
 */
function collectMetrics() {
  const memUsage = process.memoryUsage();
  metrics.memoryUsage.push({
    timestamp: Date.now(),
    heapUsed: memUsage.heapUsed,
    heapTotal: memUsage.heapTotal,
    external: memUsage.external,
    rss: memUsage.rss,
  });
  
  // Keep only recent memory data
  if (metrics.memoryUsage.length > 100) {
    metrics.memoryUsage = metrics.memoryUsage.slice(-100);
  }
}

/**
 * Print current metrics
 */
function printMetrics() {
  const activeCount = activeConnections.size;
  const avgConnectionTime = metrics.timing.connectionTimes.length > 0 
    ? metrics.timing.connectionTimes.reduce((a, b) => a + b, 0) / metrics.timing.connectionTimes.length 
    : 0;
  const avgRoundTrip = metrics.timing.roundTripTimes.length > 0
    ? metrics.timing.roundTripTimes.reduce((a, b) => a + b, 0) / metrics.timing.roundTripTimes.length
    : 0;
  
  console.log(`
📈 Current Metrics:
   Active Connections: ${activeCount}
   Messages Sent: ${metrics.events.sent}
   Messages Received: ${metrics.events.received}
   Avg Connection Time: ${avgConnectionTime.toFixed(2)}ms
   Avg Round Trip: ${avgRoundTrip.toFixed(2)}ms
   Errors: ${metrics.errors.length}
  `);
}

/**
 * Test disconnections
 */
function testDisconnections() {
  if (!CONFIG.scenarios.disconnectionTest) return;
  
  console.log('🔌 Testing graceful disconnections...');
  
  const connectionsToDisconnect = Math.floor(activeConnections.size * 0.1); // 10%
  const connectionIds = Array.from(activeConnections.keys()).slice(0, connectionsToDisconnect);
  
  connectionIds.forEach(connectionId => {
    const connectionInfo = activeConnections.get(connectionId);
    if (connectionInfo && connectionInfo.socket.connected) {
      connectionInfo.socket.disconnect();
    }
  });
}

/**
 * End test and generate report
 */
function endTest() {
  console.log('🏁 Test completed. Disconnecting remaining connections...');
  
  // Disconnect all remaining connections
  for (const [connectionId, connectionInfo] of activeConnections.entries()) {
    if (connectionInfo.socket.connected) {
      connectionInfo.socket.disconnect();
    }
  }
  
  // Generate final report
  setTimeout(() => {
    generateReport();
  }, 5000); // Wait for disconnections to complete
}

/**
 * Generate comprehensive test report
 */
function generateReport() {
  const testDuration = testEndTime - testStartTime;
  const avgConnectionTime = metrics.timing.connectionTimes.length > 0 
    ? metrics.timing.connectionTimes.reduce((a, b) => a + b, 0) / metrics.timing.connectionTimes.length 
    : 0;
  const avgRoundTrip = metrics.timing.roundTripTimes.length > 0
    ? metrics.timing.roundTripTimes.reduce((a, b) => a + b, 0) / metrics.timing.roundTripTimes.length
    : 0;
  
  // Calculate percentiles
  const connectionTimesSorted = [...metrics.timing.connectionTimes].sort((a, b) => a - b);
  const roundTripTimesSorted = [...metrics.timing.roundTripTimes].sort((a, b) => a - b);
  
  const getPercentile = (arr, p) => {
    if (arr.length === 0) return 0;
    const index = Math.ceil((p / 100) * arr.length) - 1;
    return arr[Math.max(0, index)];
  };
  
  const report = {
    testConfiguration: CONFIG,
    testDuration: testDuration,
    connections: {
      attempted: metrics.connections.attempted,
      successful: metrics.connections.successful,
      failed: metrics.connections.failed,
      disconnected: metrics.connections.disconnected,
      successRate: (metrics.connections.successful / metrics.connections.attempted * 100).toFixed(2) + '%',
    },
    events: {
      sent: metrics.events.sent,
      received: metrics.events.received,
      errors: metrics.events.errors,
      deliveryRate: metrics.events.sent > 0 ? (metrics.events.received / metrics.events.sent * 100).toFixed(2) + '%' : '0%',
      throughput: {
        sentPerSecond: (metrics.events.sent / (testDuration / 1000)).toFixed(2),
        receivedPerSecond: (metrics.events.received / (testDuration / 1000)).toFixed(2),
      },
    },
    performance: {
      connectionTime: {
        average: avgConnectionTime.toFixed(2) + 'ms',
        p50: getPercentile(connectionTimesSorted, 50).toFixed(2) + 'ms',
        p90: getPercentile(connectionTimesSorted, 90).toFixed(2) + 'ms',
        p95: getPercentile(connectionTimesSorted, 95).toFixed(2) + 'ms',
        p99: getPercentile(connectionTimesSorted, 99).toFixed(2) + 'ms',
      },
      roundTripTime: {
        average: avgRoundTrip.toFixed(2) + 'ms',
        p50: getPercentile(roundTripTimesSorted, 50).toFixed(2) + 'ms',
        p90: getPercentile(roundTripTimesSorted, 90).toFixed(2) + 'ms',
        p95: getPercentile(roundTripTimesSorted, 95).toFixed(2) + 'ms',
        p99: getPercentile(roundTripTimesSorted, 99).toFixed(2) + 'ms',
      },
    },
    errors: {
      total: metrics.errors.length,
      byType: metrics.errors.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {}),
    },
    memory: {
      peak: metrics.memoryUsage.length > 0 
        ? Math.max(...metrics.memoryUsage.map(m => m.heapUsed))
        : 0,
      average: metrics.memoryUsage.length > 0
        ? metrics.memoryUsage.reduce((sum, m) => sum + m.heapUsed, 0) / metrics.memoryUsage.length
        : 0,
    },
  };
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 SOCKET.IO LOAD TEST REPORT');
  console.log('='.repeat(80));
  console.log(JSON.stringify(report, null, 2));
  
  // Save report to file
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `load-test-report-${timestamp}.json`;
  
  fs.writeFileSync(filename, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${filename}`);
  
  // Exit
  process.exit(0);
}

/**
 * Handle process signals
 */
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  testEndTime = Date.now();
  endTest();
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test terminated');
  testEndTime = Date.now();
  endTest();
});

// Start the load test
console.log('🔥 Starting Socket.io Load Test');
console.log('Configuration:', JSON.stringify(CONFIG, null, 2));
console.log('-'.repeat(80));

rampUpConnections();