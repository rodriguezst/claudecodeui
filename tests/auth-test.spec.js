import { test, expect } from '@playwright/test';

test('Models API authentication fix', async ({ page }) => {
  console.log('🧪 Testing models API authentication...');
  
  // Navigate to the application
  await page.goto('http://localhost:3000');
  
  // Check if we need to authenticate
  const loginForm = page.locator('input[name="username"]');
  const isLoginVisible = await loginForm.isVisible().catch(() => false);
  
  if (isLoginVisible) {
    console.log('📝 Authentication required, creating test user...');
    
    // Check if we can register
    const registerLink = page.locator('text=Register');
    const hasRegister = await registerLink.isVisible().catch(() => false);
    
    if (hasRegister) {
      await registerLink.click();
    }
    
    // Fill in credentials
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    
    // Wait for authentication to complete
    await page.waitForTimeout(2000);
  }
  
  // Test the models API endpoint directly
  console.log('🔍 Testing /api/models endpoint...');
  
  // Make request to models API - this should now include auth headers
  const modelsResponse = await page.request.get('/api/models');
  console.log('📊 Models API status:', modelsResponse.status());
  
  if (modelsResponse.status() === 200) {
    const data = await modelsResponse.json();
    console.log('✅ Successfully authenticated! Models count:', data.models?.length || 0);
    expect(modelsResponse.status()).toBe(200);
    expect(data.models).toBeDefined();
    expect(data.models.length).toBeGreaterThan(0);
  } else {
    console.log('❌ Authentication failed with status:', modelsResponse.status());
    console.log('Response:', await modelsResponse.text());
  }
});