'use strict';

const os = require('os');
const prisma = require('../config/database');
const packageJson = require('../../package.json');

async function getStatus() {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error';
  }

  return {
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      api: 'ok',
    },
    uptime: process.uptime(),
  };
}

function getInfo() {
  return {
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    cpus: os.cpus().length,
    memoryUsage: process.memoryUsage(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
  };
}

function getVersion() {
  return {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
  };
}

module.exports = {
  getStatus,
  getInfo,
  getVersion,
};
