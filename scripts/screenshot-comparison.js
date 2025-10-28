#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function takeScreenshots() {
  console.log('🎯 Starting screenshot comparison...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const pages = {
    local: await context.newPage(),
    production: await context.newPage()
  };

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, '../screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    console.log('📸 Taking local development screenshots...');
    
    // Local development screenshots
    await pages.local.goto('http://localhost:3000/en');
    await pages.local.waitForLoadState('networkidle');
    await pages.local.screenshot({ 
      path: path.join(screenshotsDir, 'local-homepage.png'),
      fullPage: true 
    });

    // Hero section
    const heroSection = await pages.local.locator('section.hero');
    await heroSection.screenshot({ 
      path: path.join(screenshotsDir, 'local-hero.png') 
    });

    // Navigation
    const navSection = await pages.local.locator('header');
    await navSection.screenshot({ 
      path: path.join(screenshotsDir, 'local-navigation.png') 
    });

    console.log('📸 Taking production screenshots...');
    
    // Production screenshots
    await pages.production.goto('https://fly-fleet.up.railway.app/en');
    await pages.production.waitForLoadState('networkidle');
    await pages.production.screenshot({ 
      path: path.join(screenshotsDir, 'production-homepage.png'),
      fullPage: true 
    });

    // Hero section
    const prodHeroSection = await pages.production.locator('section.hero');
    await prodHeroSection.screenshot({ 
      path: path.join(screenshotsDir, 'production-hero.png') 
    });

    // Navigation
    const prodNavSection = await pages.production.locator('header');
    await prodNavSection.screenshot({ 
      path: path.join(screenshotsDir, 'production-navigation.png') 
    });

    console.log('✅ Screenshots saved to ./screenshots/');
    console.log('📁 Files created:');
    console.log('  - local-homepage.png');
    console.log('  - local-hero.png');
    console.log('  - local-navigation.png');
    console.log('  - production-homepage.png');
    console.log('  - production-hero.png');
    console.log('  - production-navigation.png');

  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Run the script
takeScreenshots().catch(console.error);
