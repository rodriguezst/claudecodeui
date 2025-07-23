import { test, expect } from '@playwright/test';

let authToken = '';

test.describe('Claude Code UI API Tests', () => {
  test.beforeAll(async ({ request }) => {
    // Register a test user and get auth token
    const response = await request.post('/api/auth/register', {
      data: {
        username: 'testuser2',
        password: 'testpass123'
      }
    });
    
    if (response.status() === 403) {
      // User already exists, try login instead
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          username: 'testuser',
          password: 'testpass123'
        }
      });
      const loginData = await loginResponse.json();
      authToken = loginData.token;
    } else {
      const data = await response.json();
      authToken = data.token;
    }
    
    console.log('Auth token obtained:', authToken ? 'SUCCESS' : 'FAILED');
  });

  test('API models endpoint should work with authentication', async ({ request }) => {
    const response = await request.get('/api/models', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('models');
    expect(Array.isArray(data.models)).toBeTruthy();
    expect(data.models.length).toBeGreaterThan(0);
    
    // Check for expected models
    const modelIds = data.models.map(m => m.id);
    expect(modelIds).toContain('sonnet');
    expect(modelIds).toContain('custom');
  });

  test('API models endpoint should return 401 without authentication', async ({ request }) => {
    const response = await request.get('/api/models');
    
    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Access denied');
  });

  test('MCP CLI list endpoint should work with authentication', async ({ request }) => {
    const response = await request.get('/api/mcp/cli/list', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('output');
    expect(data).toHaveProperty('servers');
    expect(Array.isArray(data.servers)).toBeTruthy();
  });

  test('MCP CLI list endpoint should return 401 without authentication', async ({ request }) => {
    const response = await request.get('/api/mcp/cli/list');
    
    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Access denied');
  });

  test('Config endpoint should work with authentication', async ({ request }) => {
    const response = await request.get('/api/config', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('serverPort');
    expect(data).toHaveProperty('wsUrl');
    expect(data).toHaveProperty('anthropicBaseUrl');
  });
});