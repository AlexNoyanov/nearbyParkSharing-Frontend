#!/usr/bin/env node

import { spawn } from 'child_process';
import readline from 'readline';

// Configure readline to capture keypress events
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

console.log('🚀 Deployment watcher started!');
console.log('Press "d" to deploy, "q" to quit\n');

let isDeploying = false;

process.stdin.on('keypress', (str, key) => {
  // Handle Ctrl+C
  if (key && key.ctrl && key.name === 'c') {
    console.log('\n👋 Exiting...');
    process.exit();
  }

  // Handle 'q' to quit
  if (key && key.name === 'q') {
    console.log('\n👋 Exiting...');
    process.exit();
  }

  // Handle 'd' to deploy
  if (key && key.name === 'd' && !isDeploying) {
    isDeploying = true;
    console.log('\n📦 Starting deployment...\n');
    
    const deployProcess = spawn('npm', ['run', 'deploy'], {
      stdio: 'inherit',
      shell: true
    });

    deployProcess.on('close', (code) => {
      isDeploying = false;
      if (code === 0) {
        console.log('\n✅ Deployment completed successfully!');
        console.log('Press "d" to deploy again, "q" to quit\n');
      } else {
        console.log(`\n❌ Deployment failed with exit code ${code}`);
        console.log('Press "d" to try again, "q" to quit\n');
      }
    });

    deployProcess.on('error', (err) => {
      isDeploying = false;
      console.error(`\n❌ Error starting deployment: ${err.message}`);
      console.log('Press "d" to try again, "q" to quit\n');
    });
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Exiting...');
  process.exit();
});

