// routes/healthCheck.ts
import express from 'express';
import { getMaintenanceStatus } from '../controllers/HealthCheckController';

const healthCheckRoutes = express.Router();

healthCheckRoutes.get('/health-check', getMaintenanceStatus);

export default healthCheckRoutes;