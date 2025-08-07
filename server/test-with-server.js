#!/usr/bin/env node

/**
 * Test runner that starts the server and runs integration tests
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

let serverProcess;

async function startServer() {
  console.log('🚀 Starting server...');
  
  serverProcess = spawn('npm', ['start'], {
    stdio: 'pipe',
    detached: false
  });

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Server running on port')) {
      console.log('✅ Server started successfully');
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('Server error:', data.toString());
  });

  // Wait for server to start
  await setTimeout(3000);
}

async function runTests() {
  console.log('🧪 Running integration tests...');
  
  const testProcess = spawn('npm', ['test', '--', 'tests/api-integration.test.ts'], {
    stdio: 'inherit'
  });

  return new Promise((resolve, reject) => {
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Tests completed successfully');
        resolve(code);
      } else {
        console.log('❌ Tests failed');
        reject(new Error(`Tests failed with code ${code}`));
      }
    });
  });
}

async function stopServer() {
  if (serverProcess) {
    console.log('🛑 Stopping server...');
    serverProcess.kill('SIGTERM');
    await setTimeout(1000);
    if (!serverProcess.killed) {
      serverProcess.kill('SIGKILL');
    }
  }
}

async function main() {
  try {
    await startServer();
    await runTests();
  } catch (error) {
    console.error('Test run failed:', error.message);
    process.exit(1);
  } finally {
    await stopServer();
  }
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, cleaning up...');
  await stopServer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, cleaning up...');
  await stopServer();
  process.exit(0);
});

main().catch(console.error);
