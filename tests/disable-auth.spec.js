import { test, expect } from '@playwright/test';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Helper function to start server with specific env
function startServer(env = {}) {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', ['server/index.js'], {
      cwd: projectRoot,
      env: { ...process.env, ...env },
      stdio: 'pipe'
    });

    let output = '';
    
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('Claude Code UI server running')) {
        resolve(serverProcess);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    serverProcess.on('error', reject);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('Server start timeout'));
    }, 10000);
  });
}

test.describe('Authentication Disabled', () => {
  let serverProcess = null;
  
  test.afterEach(async () => {
    if (serverProcess) {
      serverProcess.kill();
      serverProcess = null;
    }
  });

  test('should bypass login when CLAUDECODEUI_DISABLE_AUTH=true', async ({ page }) => {
    console.log('🧪 Testing disabled authentication...');
    
    // Start server with disabled auth
    serverProcess = await startServer({ CLAUDECODEUI_DISABLE_AUTH: 'true' });
    
    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Should see main UI, not login form
    const mainHeading = page.locator('h2:has-text("Choose Your Project")');
    const loginForm = page.locator('form:has(input[type="password"])');
    const setupForm = page.locator('h1:has-text("Welcome to Claude Code UI")');
    
    // Main UI should be visible
    await expect(mainHeading).toBeVisible();
    
    // Login/setup forms should NOT be visible
    await expect(loginForm).not.toBeVisible();
    await expect(setupForm).not.toBeVisible();
    
    // Should be able to access protected API endpoints
    const projectsResponse = await page.request.get('/api/projects');
    expect(projectsResponse.status()).toBe(200);
    
    console.log('✅ Authentication successfully bypassed!');
  });

  test('should show setup form when CLAUDECODEUI_DISABLE_AUTH=false', async ({ page }) => {
    console.log('🧪 Testing enabled authentication...');
    
    // Start server with enabled auth
    serverProcess = await startServer({ CLAUDECODEUI_DISABLE_AUTH: 'false' });
    
    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Should see setup form, not main UI
    const setupHeading = page.locator('h1:has-text("Welcome to Claude Code UI")');
    const mainHeading = page.locator('h2:has-text("Choose Your Project")');
    
    // Setup form should be visible
    await expect(setupHeading).toBeVisible();
    
    // Main UI should NOT be visible
    await expect(mainHeading).not.toBeVisible();
    
    // Should NOT be able to access protected API endpoints without auth
    const projectsResponse = await page.request.get('/api/projects');
    expect(projectsResponse.status()).toBe(401);
    
    console.log('✅ Authentication correctly required!');
  });
});