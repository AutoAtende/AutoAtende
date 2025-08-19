import { logger } from '../../utils/logger';

interface EventMetrics {
  count: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  errors: number;
  lastExecuted: number;
}

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  peakConnections: number;
  connectionDuration: {
    total: number;
    average: number;
    min: number;
    max: number;
  };
  connectionsPerSecond: number;
  disconnectionsPerSecond: number;
}

interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  socketRooms: number;
  lastGC?: number;
}

interface LatencyMetrics {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  average: number;
  min: number;
  max: number;
}

interface PerformanceSnapshot {
  timestamp: number;
  memory: MemoryMetrics;
  connections: ConnectionMetrics;
  events: Map<string, EventMetrics>;
  latency: LatencyMetrics;
  errors: number;
  warnings: number;
}

/**
 * Comprehensive performance metrics collector for Socket.io
 * Tracks latency, memory, connections, and event performance
 */
export class PerformanceMetrics {
  private eventMetrics: Map<string, EventMetrics> = new Map();
  private latencyHistory: number[] = [];
  private connectionHistory: number[] = [];
  private memoryHistory: MemoryMetrics[] = [];
  private snapshots: PerformanceSnapshot[] = [];
  
  // Counters
  private totalConnections = 0;
  private activeConnections = 0;
  private peakConnections = 0;
  private totalErrors = 0;
  private totalWarnings = 0;
  private connectionsThisSecond = 0;
  private disconnectionsThisSecond = 0;
  
  // Timing
  private startTime = Date.now();
  private lastSecond = Math.floor(Date.now() / 1000);
  
  // Configuration
  private readonly MAX_HISTORY_SIZE = 1000;
  private readonly MAX_SNAPSHOTS = 288; // 24 hours at 5-minute intervals
  private readonly LATENCY_PERCENTILES = [50, 90, 95, 99];

  constructor() {
    this.startPerformanceTracking();
  }

  /**
   * Record event execution time
   */
  recordEvent(eventName: string, duration: number, success: boolean = true): void {
    const now = Date.now();
    
    if (!this.eventMetrics.has(eventName)) {
      this.eventMetrics.set(eventName, {
        count: 0,
        totalDuration: 0,
        averageDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        errors: 0,
        lastExecuted: now,
      });
    }

    const metrics = this.eventMetrics.get(eventName)!;
    
    metrics.count++;
    metrics.totalDuration += duration;
    metrics.averageDuration = metrics.totalDuration / metrics.count;
    metrics.minDuration = Math.min(metrics.minDuration, duration);
    metrics.maxDuration = Math.max(metrics.maxDuration, duration);
    metrics.lastExecuted = now;
    
    if (!success) {
      metrics.errors++;
      this.totalErrors++;
    }

    // Track latency for percentile calculations
    this.latencyHistory.push(duration);
    if (this.latencyHistory.length > this.MAX_HISTORY_SIZE) {
      this.latencyHistory.shift();
    }
  }

  /**
   * Record connection event
   */
  incrementConnections(): void {
    this.totalConnections++;
    this.activeConnections++;
    this.peakConnections = Math.max(this.peakConnections, this.activeConnections);
    
    // Track connections per second
    const currentSecond = Math.floor(Date.now() / 1000);
    if (currentSecond !== this.lastSecond) {
      this.connectionsThisSecond = 0;
      this.disconnectionsThisSecond = 0;
      this.lastSecond = currentSecond;
    }
    this.connectionsThisSecond++;
  }

  /**
   * Record disconnection event
   */
  decrementConnections(): void {
    this.activeConnections = Math.max(0, this.activeConnections - 1);
    
    // Track disconnections per second
    const currentSecond = Math.floor(Date.now() / 1000);
    if (currentSecond !== this.lastSecond) {
      this.connectionsThisSecond = 0;
      this.disconnectionsThisSecond = 0;
      this.lastSecond = currentSecond;
    }
    this.disconnectionsThisSecond++;
  }

  /**
   * Record error event
   */
  incrementErrors(): void {
    this.totalErrors++;
  }

  /**
   * Record warning event
   */
  incrementWarnings(): void {
    this.totalWarnings++;
  }

  /**
   * Calculate latency percentiles
   */
  private calculateLatencyPercentiles(): LatencyMetrics {
    if (this.latencyHistory.length === 0) {
      return {
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0,
        average: 0,
        min: 0,
        max: 0,
      };
    }

    const sorted = [...this.latencyHistory].sort((a, b) => a - b);
    const length = sorted.length;
    
    const getPercentile = (p: number) => {
      const index = Math.ceil((p / 100) * length) - 1;
      return sorted[Math.max(0, index)];
    };

    const sum = sorted.reduce((acc, val) => acc + val, 0);
    
    return {
      p50: getPercentile(50),
      p90: getPercentile(90),
      p95: getPercentile(95),
      p99: getPercentile(99),
      average: sum / length,
      min: sorted[0],
      max: sorted[length - 1],
    };
  }

  /**
   * Get current memory metrics
   */
  private getCurrentMemoryMetrics(): MemoryMetrics {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      socketRooms: 0, // This would be updated by MemoryManager
    };
  }

  /**
   * Get current connection metrics
   */
  private getCurrentConnectionMetrics(): ConnectionMetrics {
    const now = Date.now();
    const uptime = now - this.startTime;
    
    // Calculate connection duration stats from history
    const durations = this.connectionHistory.length > 0 ? this.connectionHistory : [0];
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const avgDuration = totalDuration / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    return {
      totalConnections: this.totalConnections,
      activeConnections: this.activeConnections,
      peakConnections: this.peakConnections,
      connectionDuration: {
        total: totalDuration,
        average: avgDuration,
        min: minDuration,
        max: maxDuration,
      },
      connectionsPerSecond: this.connectionsThisSecond,
      disconnectionsPerSecond: this.disconnectionsThisSecond,
    };
  }

  /**
   * Record connection duration
   */
  recordConnectionDuration(duration: number): void {
    this.connectionHistory.push(duration);
    if (this.connectionHistory.length > this.MAX_HISTORY_SIZE) {
      this.connectionHistory.shift();
    }
  }

  /**
   * Take a performance snapshot
   */
  takeSnapshot(): PerformanceSnapshot {
    const snapshot: PerformanceSnapshot = {
      timestamp: Date.now(),
      memory: this.getCurrentMemoryMetrics(),
      connections: this.getCurrentConnectionMetrics(),
      events: new Map(this.eventMetrics),
      latency: this.calculateLatencyPercentiles(),
      errors: this.totalErrors,
      warnings: this.totalWarnings,
    };

    this.snapshots.push(snapshot);
    
    // Keep only recent snapshots
    if (this.snapshots.length > this.MAX_SNAPSHOTS) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  /**
   * Get comprehensive metrics
   */
  getAllMetrics() {
    const currentSnapshot = this.takeSnapshot();
    const uptime = Date.now() - this.startTime;
    
    // Calculate rates
    const errorRate = this.totalConnections > 0 ? (this.totalErrors / this.totalConnections) * 100 : 0;
    const uptimeSeconds = uptime / 1000;
    const avgConnectionsPerSecond = uptimeSeconds > 0 ? this.totalConnections / uptimeSeconds : 0;

    // Get top events by frequency and latency
    const topEventsByFrequency = Array.from(this.eventMetrics.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    const topEventsByLatency = Array.from(this.eventMetrics.entries())
      .sort((a, b) => b[1].averageDuration - a[1].averageDuration)
      .slice(0, 10);

    const slowestEvents = Array.from(this.eventMetrics.entries())
      .filter(([_, metrics]) => metrics.averageDuration > 100) // Events taking more than 100ms
      .sort((a, b) => b[1].averageDuration - a[1].averageDuration);

    return {
      timestamp: Date.now(),
      uptime,
      current: currentSnapshot,
      summary: {
        totalConnections: this.totalConnections,
        activeConnections: this.activeConnections,
        peakConnections: this.peakConnections,
        totalErrors: this.totalErrors,
        errorRate,
        avgConnectionsPerSecond,
        totalEvents: Array.from(this.eventMetrics.values()).reduce((sum, m) => sum + m.count, 0),
      },
      performance: {
        latency: this.calculateLatencyPercentiles(),
        topEventsByFrequency: topEventsByFrequency.map(([name, metrics]) => ({ name, ...metrics })),
        topEventsByLatency: topEventsByLatency.map(([name, metrics]) => ({ name, ...metrics })),
        slowestEvents: slowestEvents.map(([name, metrics]) => ({ name, ...metrics })),
      },
      trends: this.calculateTrends(),
      alerts: this.generateAlerts(),
    };
  }

  /**
   * Get basic metrics for lightweight monitoring
   */
  getBasicMetrics() {
    return {
      timestamp: Date.now(),
      activeConnections: this.activeConnections,
      totalConnections: this.totalConnections,
      errors: this.totalErrors,
      warnings: this.totalWarnings,
      uptime: Date.now() - this.startTime,
      latency: {
        average: this.latencyHistory.length > 0 
          ? this.latencyHistory.reduce((sum, l) => sum + l, 0) / this.latencyHistory.length 
          : 0,
        p95: this.calculateLatencyPercentiles().p95,
      },
    };
  }

  /**
   * Calculate performance trends
   */
  private calculateTrends() {
    if (this.snapshots.length < 2) {
      return {
        connections: 'stable',
        memory: 'stable',
        latency: 'stable',
        errors: 'stable',
      };
    }

    const recent = this.snapshots.slice(-5); // Last 5 snapshots
    const oldest = recent[0];
    const newest = recent[recent.length - 1];

    const connectionTrend = this.calculateTrend(
      oldest.connections.activeConnections,
      newest.connections.activeConnections
    );

    const memoryTrend = this.calculateTrend(
      oldest.memory.heapUsed,
      newest.memory.heapUsed
    );

    const latencyTrend = this.calculateTrend(
      oldest.latency.average,
      newest.latency.average
    );

    const errorTrend = this.calculateTrend(
      oldest.errors,
      newest.errors
    );

    return {
      connections: connectionTrend,
      memory: memoryTrend,
      latency: latencyTrend,
      errors: errorTrend,
    };
  }

  /**
   * Calculate trend direction
   */
  private calculateTrend(oldValue: number, newValue: number): 'increasing' | 'decreasing' | 'stable' {
    const changePercent = oldValue !== 0 ? ((newValue - oldValue) / oldValue) * 100 : 0;
    
    if (changePercent > 5) return 'increasing';
    if (changePercent < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Generate performance alerts
   */
  private generateAlerts(): Array<{ level: 'warning' | 'critical'; message: string; metric: string; value: number }> {
    const alerts: Array<{ level: 'warning' | 'critical'; message: string; metric: string; value: number }> = [];
    const latency = this.calculateLatencyPercentiles();
    
    // High latency alerts
    if (latency.p95 > 1000) {
      alerts.push({
        level: 'critical',
        message: 'P95 latency exceeds 1 second',
        metric: 'latency_p95',
        value: latency.p95,
      });
    } else if (latency.p95 > 500) {
      alerts.push({
        level: 'warning',
        message: 'P95 latency exceeds 500ms',
        metric: 'latency_p95',
        value: latency.p95,
      });
    }

    // High error rate alerts
    const errorRate = this.totalConnections > 0 ? (this.totalErrors / this.totalConnections) * 100 : 0;
    if (errorRate > 5) {
      alerts.push({
        level: 'critical',
        message: 'Error rate exceeds 5%',
        metric: 'error_rate',
        value: errorRate,
      });
    } else if (errorRate > 1) {
      alerts.push({
        level: 'warning',
        message: 'Error rate exceeds 1%',
        metric: 'error_rate',
        value: errorRate,
      });
    }

    // Memory usage alerts
    const memUsage = process.memoryUsage();
    const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      alerts.push({
        level: 'critical',
        message: 'Memory usage exceeds 90%',
        metric: 'memory_usage',
        value: memoryUsagePercent,
      });
    } else if (memoryUsagePercent > 80) {
      alerts.push({
        level: 'warning',
        message: 'Memory usage exceeds 80%',
        metric: 'memory_usage',
        value: memoryUsagePercent,
      });
    }

    return alerts;
  }

  /**
   * Start background performance tracking
   */
  private startPerformanceTracking(): void {
    // Take snapshots every 5 minutes
    setInterval(() => {
      this.takeSnapshot();
    }, 5 * 60 * 1000);

    // Reset per-second counters
    setInterval(() => {
      this.connectionsThisSecond = 0;
      this.disconnectionsThisSecond = 0;
    }, 1000);

    // Log performance summary every hour
    setInterval(() => {
      const metrics = this.getBasicMetrics();
      logger.info('Hourly performance summary', metrics);
    }, 60 * 60 * 1000);
  }

  /**
   * Collect metrics (for external monitoring)
   */
  collectMetrics(): void {
    const metrics = this.getBasicMetrics();
    
    // You can send these metrics to external monitoring systems
    // like Prometheus, DataDog, CloudWatch, etc.
    logger.debug('Performance metrics collected', metrics);
  }

  /**
   * Get event metrics for specific event
   */
  getEventMetrics(eventName: string): EventMetrics | null {
    return this.eventMetrics.get(eventName) || null;
  }

  /**
   * Get historical snapshots
   */
  getHistoricalSnapshots(limit?: number): PerformanceSnapshot[] {
    return limit ? this.snapshots.slice(-limit) : [...this.snapshots];
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.eventMetrics.clear();
    this.latencyHistory = [];
    this.connectionHistory = [];
    this.memoryHistory = [];
    this.snapshots = [];
    
    this.totalConnections = 0;
    this.activeConnections = 0;
    this.peakConnections = 0;
    this.totalErrors = 0;
    this.totalWarnings = 0;
    this.connectionsThisSecond = 0;
    this.disconnectionsThisSecond = 0;
    
    this.startTime = Date.now();
    this.lastSecond = Math.floor(Date.now() / 1000);
    
    logger.info('Performance metrics reset');
  }

  /**
   * Export metrics for external systems
   */
  exportMetrics(format: 'json' | 'prometheus' = 'json') {
    if (format === 'prometheus') {
      return this.exportPrometheusMetrics();
    }
    
    return JSON.stringify(this.getAllMetrics(), null, 2);
  }

  /**
   * Export metrics in Prometheus format
   */
  private exportPrometheusMetrics(): string {
    const metrics = this.getAllMetrics();
    const lines: string[] = [];
    
    // Connection metrics
    lines.push(`# HELP socketio_connections_total Total number of connections`);
    lines.push(`# TYPE socketio_connections_total counter`);
    lines.push(`socketio_connections_total ${metrics.summary.totalConnections}`);
    
    lines.push(`# HELP socketio_connections_active Active connections`);
    lines.push(`# TYPE socketio_connections_active gauge`);
    lines.push(`socketio_connections_active ${metrics.summary.activeConnections}`);
    
    // Latency metrics
    lines.push(`# HELP socketio_latency_seconds Request latency`);
    lines.push(`# TYPE socketio_latency_seconds histogram`);
    lines.push(`socketio_latency_seconds{quantile="0.5"} ${metrics.performance.latency.p50 / 1000}`);
    lines.push(`socketio_latency_seconds{quantile="0.9"} ${metrics.performance.latency.p90 / 1000}`);
    lines.push(`socketio_latency_seconds{quantile="0.95"} ${metrics.performance.latency.p95 / 1000}`);
    lines.push(`socketio_latency_seconds{quantile="0.99"} ${metrics.performance.latency.p99 / 1000}`);
    
    // Error metrics
    lines.push(`# HELP socketio_errors_total Total number of errors`);
    lines.push(`# TYPE socketio_errors_total counter`);
    lines.push(`socketio_errors_total ${metrics.summary.totalErrors}`);
    
    return lines.join('\n');
  }
}