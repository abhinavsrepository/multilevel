#!/usr/bin/env node

/**
 * Team API Endpoints Testing Script
 * Tests all team admin endpoints to ensure they're working correctly
 */

const axios = require('axios');
const { User } = require('../src/models');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

// Color output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}`),
};

const endpoints = [
  {
    name: 'Tree View (Binary)',
    url: '/team/admin/tree-view',
    method: 'GET',
    expectedFields: ['success', 'data', 'stats'],
    dataFields: ['userId', 'username', 'personalBv', 'teamBv', 'leftChild', 'rightChild'],
  },
  {
    name: 'Level Tree View (Unilevel)',
    url: '/team/admin/level-tree-view',
    method: 'GET',
    params: { maxLevels: 3 },
    expectedFields: ['success', 'data'],
    dataFields: ['tree', 'rootUser', 'levelUnlockStatus', 'globalKPIs'],
  },
  {
    name: 'Direct Referrals',
    url: '/team/admin/direct-referral',
    method: 'GET',
    params: { page: 1, limit: 10 },
    expectedFields: ['success', 'data', 'pagination', 'stats'],
    dataIsArray: true,
  },
  {
    name: 'Total Downline',
    url: '/team/admin/total-downline',
    method: 'GET',
    params: { page: 1, limit: 10 },
    expectedFields: ['success', 'data', 'pagination'],
    dataIsArray: true,
  },
  {
    name: 'Level Downline',
    url: '/team/admin/level-downline',
    method: 'GET',
    params: { maxLevel: 5 },
    expectedFields: ['success', 'data'],
    dataIsArray: true,
  },
  {
    name: 'Downline Business',
    url: '/team/admin/downline-business',
    method: 'GET',
    params: { page: 1, limit: 10 },
    expectedFields: ['success', 'data', 'pagination', 'stats'],
    dataIsArray: true,
  },
  {
    name: 'Team Stats',
    url: '/team/admin/stats',
    method: 'GET',
    expectedFields: ['success', 'data'],
    dataFields: ['totalMembers', 'activeMembers', 'directReferrals', 'totalDownline', 'totalBv'],
  },
];

async function getAdminToken() {
  if (ADMIN_TOKEN) return ADMIN_TOKEN;

  try {
    // Try to get first admin user
    const admin = await User.findOne({
      where: { role: 'ADMIN' },
      attributes: ['id', 'username', 'email'],
    });

    if (!admin) {
      log.warn('No admin user found in database. Please set ADMIN_TOKEN environment variable.');
      return null;
    }

    log.info(`Found admin user: ${admin.username} (ID: ${admin.id})`);
    log.warn('Please obtain a valid JWT token for this admin and set ADMIN_TOKEN environment variable');
    return null;
  } catch (error) {
    log.error(`Database error: ${error.message}`);
    return null;
  }
}

async function testEndpoint(endpoint) {
  try {
    const token = await getAdminToken();
    if (!token) {
      log.warn(`Skipping ${endpoint.name} - No auth token available`);
      return { success: false, skipped: true };
    }

    const config = {
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.url}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: endpoint.params || {},
    };

    log.info(`Testing: ${endpoint.name}`);
    log.info(`  URL: ${config.method} ${config.url}`);
    if (endpoint.params) {
      log.info(`  Params: ${JSON.stringify(endpoint.params)}`);
    }

    const response = await axios(config);
    const data = response.data;

    // Check HTTP status
    if (response.status !== 200) {
      log.error(`  HTTP Status: ${response.status} (Expected 200)`);
      return { success: false, error: `HTTP ${response.status}` };
    }

    // Check response structure
    const missingFields = endpoint.expectedFields.filter(field => !(field in data));
    if (missingFields.length > 0) {
      log.error(`  Missing fields: ${missingFields.join(', ')}`);
      return { success: false, error: `Missing fields: ${missingFields.join(', ')}` };
    }

    // Check success flag
    if (!data.success) {
      log.error(`  Response success=false: ${data.message || 'No message'}`);
      return { success: false, error: data.message };
    }

    // Check data structure
    if (endpoint.dataIsArray) {
      if (!Array.isArray(data.data)) {
        log.error(`  Data is not an array (got ${typeof data.data})`);
        return { success: false, error: 'Data is not an array' };
      }
      log.success(`  Response OK - ${data.data.length} items returned`);
    } else if (endpoint.dataFields) {
      const dataObj = endpoint.dataFields[0] === 'tree' ? data.data.tree : data.data;
      const missingDataFields = endpoint.dataFields.filter(field => !(field in dataObj));
      if (missingDataFields.length > 0) {
        log.warn(`  Missing data fields: ${missingDataFields.join(', ')}`);
      }
      log.success(`  Response OK`);
    } else {
      log.success(`  Response OK`);
    }

    // Show pagination info if available
    if (data.pagination) {
      log.info(`  Pagination: Page ${data.pagination.page}/${data.pagination.pages}, Total ${data.pagination.total}`);
    }

    // Show stats if available
    if (data.stats) {
      log.info(`  Stats: ${JSON.stringify(data.stats, null, 2).substring(0, 200)}...`);
    }

    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      log.error(`  HTTP Error: ${error.response.status} ${error.response.statusText}`);
      log.error(`  Message: ${error.response.data?.message || 'No message'}`);
      return { success: false, error: `HTTP ${error.response.status}: ${error.response.data?.message}` };
    } else if (error.request) {
      log.error(`  Network Error: No response received`);
      log.error(`  Details: ${error.message}`);
      return { success: false, error: 'Network error' };
    } else {
      log.error(`  Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

async function runTests() {
  log.section('Team API Endpoints Validation');

  log.info(`Base URL: ${BASE_URL}`);
  log.info(`Admin Token: ${ADMIN_TOKEN ? '✓ Provided' : '✗ Not provided'}`);

  const results = [];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push({ endpoint: endpoint.name, ...result });
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
  }

  // Summary
  log.section('Test Summary');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;

  log.info(`Total Tests: ${results.length}`);
  log.success(`Passed: ${passed}`);
  if (failed > 0) log.error(`Failed: ${failed}`);
  if (skipped > 0) log.warn(`Skipped: ${skipped}`);

  if (failed > 0) {
    log.section('Failed Tests');
    results.filter(r => !r.success && !r.skipped).forEach(r => {
      log.error(`${r.endpoint}: ${r.error}`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint };
