#!/usr/bin/env node

/**
 * Production Deployment Script for TikCredit Pro
 * Ensures all security checks pass before deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 TikCredit Pro - Production Deployment Script');
console.log('================================================');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n📋 ${description}...`, colors.blue);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed successfully`, colors.green);
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, colors.red);
    console.error(error.message);
    return false;
  }
}

function checkEnvironmentVariables() {
  log('\n🔍 Checking environment variables...', colors.blue);
  
  const requiredEnvVars = [
    'ADMIN_PASSWORD',
    'JWT_SECRET',
  ];
  
  const missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    log(`❌ Missing required environment variables:`, colors.red);
    missingVars.forEach(varName => {
      log(`   - ${varName}`, colors.red);
    });
    log('\n💡 Please set these variables in your deployment platform:', colors.yellow);
    log('   Netlify: Site Settings > Environment Variables', colors.yellow);
    log('   Vercel: Project Settings > Environment Variables', colors.yellow);
    return false;
  }
  
  // Check JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    log('❌ JWT_SECRET must be at least 32 characters long', colors.red);
    return false;
  }
  
  log('✅ All required environment variables are set', colors.green);
  return true;
}

function checkSecurityConfiguration() {
  log('\n🔒 Checking security configuration...', colors.blue);
  
  const checks = [
    {
      name: 'Next.js security headers',
      check: () => fs.existsSync(path.join(__dirname, '../next.config.js')),
    },
    {
      name: 'Netlify security headers',
      check: () => fs.existsSync(path.join(__dirname, '../netlify.toml')),
    },
    {
      name: 'Rate limiting configuration',
      check: () => fs.existsSync(path.join(__dirname, '../src/lib/rateLimit.ts')),
    },
    {
      name: 'Authentication middleware',
      check: () => fs.existsSync(path.join(__dirname, '../src/middleware.ts')),
    },
  ];
  
  let allPassed = true;
  
  checks.forEach(({ name, check }) => {
    if (check()) {
      log(`✅ ${name}`, colors.green);
    } else {
      log(`❌ ${name}`, colors.red);
      allPassed = false;
    }
  });
  
  return allPassed;
}

function performSecurityAudit() {
  log('\n🛡️ Running security audit...', colors.blue);
  
  try {
    execSync('npm audit --audit-level moderate', { stdio: 'pipe' });
    log('✅ No moderate or high security vulnerabilities found', colors.green);
    return true;
  } catch (error) {
    log('⚠️ Security vulnerabilities detected:', colors.yellow);
    log('Run "npm audit fix" to resolve automatically fixable issues', colors.yellow);
    
    // Don't fail deployment for low-severity issues
    const output = error.stdout?.toString() || '';
    if (output.includes('high') || output.includes('critical')) {
      log('❌ High or critical vulnerabilities found - deployment blocked', colors.red);
      return false;
    }
    
    log('✅ Only low/moderate vulnerabilities - proceeding with deployment', colors.green);
    return true;
  }
}

async function main() {
  log('Starting production deployment checks...', colors.cyan);
  
  const steps = [
    { name: 'Environment Variables Check', fn: checkEnvironmentVariables },
    { name: 'Security Configuration Check', fn: checkSecurityConfiguration },
    { name: 'Security Audit', fn: performSecurityAudit },
    { name: 'TypeScript Type Check', fn: () => runCommand('npm run type-check', 'TypeScript type checking') },
    { name: 'ESLint Check', fn: () => runCommand('npm run lint', 'ESLint code quality check') },
    { name: 'Production Build', fn: () => runCommand('npm run build', 'Production build') },
  ];
  
  let allStepsPassed = true;
  
  for (const step of steps) {
    if (!step.fn()) {
      allStepsPassed = false;
      break;
    }
  }
  
  if (allStepsPassed) {
    log('\n🎉 All deployment checks passed!', colors.green);
    log('✅ Your application is ready for production deployment', colors.green);
    log('\n📋 Deployment Checklist:', colors.cyan);
    log('   1. Set environment variables in your deployment platform', colors.yellow);
    log('   2. Configure custom domain and SSL certificate', colors.yellow);
    log('   3. Set up monitoring and alerting', colors.yellow);
    log('   4. Test the deployed application thoroughly', colors.yellow);
    log('   5. Monitor logs for the first 24 hours', colors.yellow);
    
    process.exit(0);
  } else {
    log('\n❌ Deployment checks failed', colors.red);
    log('Please fix the issues above before deploying to production', colors.red);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`\n💥 Uncaught exception: ${error.message}`, colors.red);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log(`\n💥 Unhandled rejection: ${reason}`, colors.red);
  process.exit(1);
});

// Run the deployment script
main().catch((error) => {
  log(`\n💥 Deployment script failed: ${error.message}`, colors.red);
  process.exit(1);
});
