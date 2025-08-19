import { Server } from 'socket.io';
import { logger } from '../../utils/logger';
import { PerformanceMetrics } from '../utils/PerformanceMetrics';
import { ConnectionPool } from '../utils/ConnectionPool';
import { MemoryManager } from '../utils/MemoryManager';

interface MonitoringAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  resolved?: boolean;
}

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  checks: {
    connections: boolean;
    memory: boolean;
    latency: boolean;
    errors: boolean;
  };
  metrics: any;
}

/**
 * Comprehensive monitoring system for optimized Socket.io
 * Provides real-time health checks, alerts, and performance tracking
 */
export class SocketMonitor {
  private io: Server;
  private performanceMetrics: PerformanceMetrics;
  private connectionPool: ConnectionPool;
  private memoryManager: MemoryManager;
  private alerts: MonitoringAlert[] = [];
  private healthHistory: HealthCheck[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertInterval: NodeJS.Timeout | null = null;

  // Thresholds for alerts
  private readonly THRESHOLDS = {
    memory: {
      warning: 75, // % of threshold
      critical: 90,
    },
    latency: {
      warning: 500, // ms
      critical: 1000,
    },
    errorRate: {
      warning: 1, // %
      critical: 5,
    },
    connections: {
      warning: 80, // % of limit
      critical: 95,
    },
  };

  constructor(
    io: Server, 
    performanceMetrics: PerformanceMetrics,
    connectionPool: ConnectionPool,
    memoryManager: MemoryManager
  ) {
    this.io = io;
    this.performanceMetrics = performanceMetrics;
    this.connectionPool = connectionPool;
    this.memoryManager = memoryManager;
    
    this.startMonitoring();
  }

  /**
   * Start monitoring processes
   */
  private startMonitoring(): void {
    // Health checks every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);

    // Alert evaluation every 60 seconds
    this.alertInterval = setInterval(() => {
      this.evaluateAlerts();
    }, 60000);

    logger.info('Socket monitoring started');
  }

  /**
   * Perform comprehensive health check
   */
  private performHealthCheck(): void {
    try {
      const timestamp = Date.now();
      const metrics = this.gatherMetrics();
      
      const checks = {
        connections: this.checkConnectionHealth(metrics),
        memory: this.checkMemoryHealth(metrics),
        latency: this.checkLatencyHealth(metrics),
        errors: this.checkErrorHealth(metrics),
      };

      const healthyChecks = Object.values(checks).filter(Boolean).length;
      const totalChecks = Object.keys(checks).length;
      
      let status: HealthCheck['status'];
      if (healthyChecks === totalChecks) {
        status = 'healthy';
      } else if (healthyChecks >= totalChecks * 0.75) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      const healthCheck: HealthCheck = {
        status,
        timestamp,
        checks,
        metrics: this.sanitizeMetrics(metrics),
      };

      this.healthHistory.push(healthCheck);
      
      // Keep only last 100 health checks
      if (this.healthHistory.length > 100) {
        this.healthHistory = this.healthHistory.slice(-100);
      }

      // Log unhealthy status
      if (status !== 'healthy') {
        logger.warn(`Socket health check: ${status}`, {
          checks,
          failedChecks: Object.entries(checks)
            .filter(([_, passed]) => !passed)
            .map(([check]) => check),
        });
      }

    } catch (error) {
      logger.error('Error during health check:', error);
    }
  }

  /**
   * Gather all metrics for monitoring
   */
  private gatherMetrics() {
    return {
      performance: this.performanceMetrics.getAllMetrics(),
      connections: this.connectionPool.getMetrics(),
      memory: this.memoryManager.getMetrics(),
      system: process.memoryUsage(),
      uptime: process.uptime(),
    };
  }

  /**
   * Check connection health
   */
  private checkConnectionHealth(metrics: any): boolean {
    const capacity = this.connectionPool.getCapacityUsage();
    return capacity.percentage < this.THRESHOLDS.connections.critical;
  }

  /**
   * Check memory health
   */
  private checkMemoryHealth(metrics: any): boolean {
    const memoryUsage = metrics.memory.thresholdUsage;
    return memoryUsage < this.THRESHOLDS.memory.critical;
  }

  /**
   * Check latency health
   */
  private checkLatencyHealth(metrics: any): boolean {
    const p95Latency = metrics.performance.current.latency.p95;
    return p95Latency < this.THRESHOLDS.latency.critical;
  }

  /**
   * Check error rate health
   */
  private checkErrorHealth(metrics: any): boolean {
    const errorRate = metrics.performance.summary.errorRate;
    return errorRate < this.THRESHOLDS.errorRate.critical;
  }

  /**
   * Evaluate and generate alerts
   */
  private evaluateAlerts(): void {
    try {
      const metrics = this.gatherMetrics();
      const newAlerts: MonitoringAlert[] = [];

      // Memory alerts
      const memoryUsage = metrics.memory.thresholdUsage;
      if (memoryUsage > this.THRESHOLDS.memory.critical) {
        newAlerts.push(this.createAlert(
          'critical',
          'Critical memory usage detected',
          'memory_usage',
          memoryUsage,
          this.THRESHOLDS.memory.critical
        ));
      } else if (memoryUsage > this.THRESHOLDS.memory.warning) {
        newAlerts.push(this.createAlert(
          'warning',
          'High memory usage detected',
          'memory_usage',
          memoryUsage,
          this.THRESHOLDS.memory.warning
        ));
      }

      // Latency alerts
      const p95Latency = metrics.performance.current.latency.p95;
      if (p95Latency > this.THRESHOLDS.latency.critical) {
        newAlerts.push(this.createAlert(
          'critical',
          'Critical latency detected',
          'latency_p95',
          p95Latency,
          this.THRESHOLDS.latency.critical
        ));
      } else if (p95Latency > this.THRESHOLDS.latency.warning) {
        newAlerts.push(this.createAlert(
          'warning',
          'High latency detected',
          'latency_p95',
          p95Latency,
          this.THRESHOLDS.latency.warning
        ));
      }

      // Error rate alerts
      const errorRate = metrics.performance.summary.errorRate;
      if (errorRate > this.THRESHOLDS.errorRate.critical) {
        newAlerts.push(this.createAlert(
          'critical',
          'Critical error rate detected',
          'error_rate',
          errorRate,
          this.THRESHOLDS.errorRate.critical
        ));
      } else if (errorRate > this.THRESHOLDS.errorRate.warning) {
        newAlerts.push(this.createAlert(
          'warning',
          'High error rate detected',
          'error_rate',
          errorRate,
          this.THRESHOLDS.errorRate.warning
        ));
      }

      // Connection capacity alerts
      const capacity = this.connectionPool.getCapacityUsage();
      if (capacity.percentage > this.THRESHOLDS.connections.critical) {
        newAlerts.push(this.createAlert(
          'critical',
          'Connection capacity critical',
          'connection_capacity',
          capacity.percentage,
          this.THRESHOLDS.connections.critical
        ));
      } else if (capacity.percentage > this.THRESHOLDS.connections.warning) {
        newAlerts.push(this.createAlert(
          'warning',
          'Connection capacity high',
          'connection_capacity',
          capacity.percentage,
          this.THRESHOLDS.connections.warning
        ));
      }

      // Add new alerts and resolve old ones
      this.processAlerts(newAlerts);

    } catch (error) {
      logger.error('Error during alert evaluation:', error);
    }
  }

  /**
   * Create an alert
   */
  private createAlert(
    level: MonitoringAlert['level'],
    message: string,
    metric: string,
    value: number,
    threshold: number
  ): MonitoringAlert {
    return {
      id: `${metric}_${level}_${Date.now()}`,
      level,
      message,
      metric,
      value,
      threshold,
      timestamp: Date.now(),
    };
  }

  /**
   * Process new alerts and resolve outdated ones
   */
  private processAlerts(newAlerts: MonitoringAlert[]): void {
    const now = Date.now();
    const alertWindow = 5 * 60 * 1000; // 5 minutes

    // Add new alerts
    for (const alert of newAlerts) {
      // Check if similar alert already exists
      const existingAlert = this.alerts.find(a => 
        a.metric === alert.metric && 
        a.level === alert.level && 
        !a.resolved &&
        (now - a.timestamp) < alertWindow
      );

      if (!existingAlert) {
        this.alerts.push(alert);
        this.notifyAlert(alert);
      }
    }

    // Resolve old alerts
    const currentMetrics = new Set(newAlerts.map(a => `${a.metric}_${a.level}`));
    for (const alert of this.alerts) {
      if (!alert.resolved && 
          !currentMetrics.has(`${alert.metric}_${alert.level}`) &&
          (now - alert.timestamp) > alertWindow) {
        alert.resolved = true;
        this.notifyAlertResolution(alert);
      }
    }

    // Keep only recent alerts
    this.alerts = this.alerts.filter(a => (now - a.timestamp) < (24 * 60 * 60 * 1000)); // 24 hours
  }

  /**
   * Notify about new alert
   */
  private notifyAlert(alert: MonitoringAlert): void {
    logger.warn(`Socket alert [${alert.level.toUpperCase()}]: ${alert.message}`, {
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
      alertId: alert.id,
    });

    // You can add additional notification mechanisms here:
    // - Send to monitoring systems (Slack, PagerDuty, etc.)
    // - Emit to admin dashboard
    // - Send email notifications
  }

  /**
   * Notify about alert resolution
   */
  private notifyAlertResolution(alert: MonitoringAlert): void {
    logger.info(`Socket alert resolved: ${alert.message}`, {
      metric: alert.metric,
      alertId: alert.id,
      duration: Date.now() - alert.timestamp,
    });
  }

  /**
   * Get current monitoring status
   */
  getStatus() {
    const metrics = this.gatherMetrics();
    const activeAlerts = this.alerts.filter(a => !a.resolved);
    const recentHealth = this.healthHistory.slice(-10);
    
    return {
      timestamp: Date.now(),
      health: recentHealth[recentHealth.length - 1],
      alerts: {
        active: activeAlerts.length,
        critical: activeAlerts.filter(a => a.level === 'critical').length,
        warning: activeAlerts.filter(a => a.level === 'warning').length,
        recent: activeAlerts.slice(-10),
      },
      metrics: this.sanitizeMetrics(metrics),
      thresholds: this.THRESHOLDS,
    };
  }

  /**
   * Get detailed monitoring report
   */
  getDetailedReport() {
    const status = this.getStatus();
    
    return {
      ...status,
      healthHistory: this.healthHistory.slice(-50),
      allAlerts: this.alerts.slice(-100),
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.gatherMetrics();
    
    // Memory recommendations
    if (metrics.memory.thresholdUsage > 80) {
      recommendations.push('Consider increasing memory limits or optimizing memory usage');
    }
    
    // Connection recommendations
    const capacity = this.connectionPool.getCapacityUsage();
    if (capacity.percentage > 80) {
      recommendations.push('Connection pool nearing capacity - consider horizontal scaling');
    }
    
    // Latency recommendations
    if (metrics.performance.current.latency.p95 > 500) {
      recommendations.push('High latency detected - review event batching and network optimization');
    }
    
    // Error rate recommendations
    if (metrics.performance.summary.errorRate > 1) {
      recommendations.push('High error rate - review error logs and implement additional error handling');
    }
    
    return recommendations;
  }

  /**
   * Sanitize metrics for external consumption
   */
  private sanitizeMetrics(metrics: any) {
    // Remove sensitive data and limit size
    return {
      performance: {
        latency: metrics.performance.current.latency,
        connections: metrics.performance.summary.totalConnections,
        errors: metrics.performance.summary.totalErrors,
        uptime: metrics.performance.uptime,
      },
      memory: {
        usage: metrics.memory.thresholdUsage,
        trend: metrics.memory.trend,
        rooms: metrics.memory.rooms.total,
      },
      connections: {
        active: metrics.connections.total,
        peak: metrics.connections.peak,
        companies: metrics.connections.companies,
      },
    };
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(format: 'json' | 'prometheus' = 'json') {
    const status = this.getStatus();
    
    if (format === 'prometheus') {
      return this.exportPrometheusMetrics(status);
    }
    
    return JSON.stringify(status, null, 2);
  }

  /**
   * Export metrics in Prometheus format
   */
  private exportPrometheusMetrics(status: any): string {
    const lines: string[] = [];
    
    // Health status
    lines.push('# HELP socketio_health_status Overall health status (1=healthy, 0.5=degraded, 0=unhealthy)');
    lines.push('# TYPE socketio_health_status gauge');
    const healthValue = status.health?.status === 'healthy' ? 1 : status.health?.status === 'degraded' ? 0.5 : 0;
    lines.push(`socketio_health_status ${healthValue}`);
    
    // Active alerts
    lines.push('# HELP socketio_alerts_active Number of active alerts');
    lines.push('# TYPE socketio_alerts_active gauge');
    lines.push(`socketio_alerts_active ${status.alerts.active}`);
    
    // Memory usage
    lines.push('# HELP socketio_memory_usage_percent Memory usage as percentage of threshold');
    lines.push('# TYPE socketio_memory_usage_percent gauge');
    lines.push(`socketio_memory_usage_percent ${status.metrics.memory.usage}`);
    
    // Connection metrics
    lines.push('# HELP socketio_connections_active Number of active connections');
    lines.push('# TYPE socketio_connections_active gauge');
    lines.push(`socketio_connections_active ${status.metrics.connections.active}`);
    
    return lines.join('\n');
  }

  /**
   * Cleanup monitoring resources
   */
  cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
    }
    
    this.alerts = [];
    this.healthHistory = [];
    
    logger.info('Socket monitoring cleanup completed');
  }
}

export default SocketMonitor;