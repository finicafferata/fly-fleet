#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function visualComparison() {
  console.log('🎯 Starting comprehensive visual comparison...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const pages = {
    local: await context.newPage(),
    production: await context.newPage()
  };

  // Create comparison directory
  const comparisonDir = path.join(__dirname, '../visual-comparison');
  if (!fs.existsSync(comparisonDir)) {
    fs.mkdirSync(comparisonDir, { recursive: true });
  }

  const pagesToCompare = [
    { name: 'home', path: '/en' },
    { name: 'about', path: '/en/about' },
    { name: 'services', path: '/en/what-we-do' },
    { name: 'fleet', path: '/en/fleet-destinations' },
    { name: 'quote', path: '/en/quote' },
    { name: 'contact', path: '/en/contact' },
    { name: 'faqs', path: '/en/faqs' }
  ];

  try {
    for (const pageInfo of pagesToCompare) {
      console.log(`📸 Comparing ${pageInfo.name} page...`);
      
      // Local development
      await pages.local.goto(`http://localhost:3000${pageInfo.path}`);
      await pages.local.waitForLoadState('networkidle');
      await pages.local.screenshot({ 
        path: path.join(comparisonDir, `local-${pageInfo.name}.png`),
        fullPage: true 
      });

      // Production
      await pages.production.goto(`https://fly-fleet.up.railway.app${pageInfo.path}`);
      await pages.production.waitForLoadState('networkidle');
      await pages.production.screenshot({ 
        path: path.join(comparisonDir, `production-${pageInfo.name}.png`),
        fullPage: true 
      });

      // Take specific section screenshots for home page
      if (pageInfo.name === 'home') {
        // Hero section
        try {
          const localHero = await pages.local.locator('section.hero');
          await localHero.screenshot({ 
            path: path.join(comparisonDir, 'local-hero-section.png') 
          });

          const prodHero = await pages.production.locator('section.hero');
          await prodHero.screenshot({ 
            path: path.join(comparisonDir, 'production-hero-section.png') 
          });
        } catch (e) {
          console.log('⚠️  Hero section not found or not visible');
        }

        // Navigation
        try {
          const localNav = await pages.local.locator('header');
          await localNav.screenshot({ 
            path: path.join(comparisonDir, 'local-navigation.png') 
          });

          const prodNav = await pages.production.locator('header');
          await prodNav.screenshot({ 
            path: path.join(comparisonDir, 'production-navigation.png') 
          });
        } catch (e) {
          console.log('⚠️  Navigation not found or not visible');
        }

        // Services section
        try {
          const localServices = await pages.local.locator('section').nth(1);
          await localServices.screenshot({ 
            path: path.join(comparisonDir, 'local-services-section.png') 
          });

          const prodServices = await pages.production.locator('section').nth(1);
          await prodServices.screenshot({ 
            path: path.join(comparisonDir, 'production-services-section.png') 
          });
        } catch (e) {
          console.log('⚠️  Services section not found or not visible');
        }
      }
    }

    console.log('✅ Visual comparison completed!');
    console.log('📁 Screenshots saved to ./visual-comparison/');
    console.log('🔍 Compare the images side-by-side to identify differences');

  } catch (error) {
    console.error('❌ Error during visual comparison:', error);
  } finally {
    await browser.close();
  }
}

// Run the script
visualComparison().catch(console.error);
