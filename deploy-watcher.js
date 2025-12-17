#!/usr/bin/env node

import { spawn } from 'child_process';
import readline from 'readline';

// Configure readline to capture keypress events
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

console.log('🚀 Deployment watcher started!');
console.log('Type "deploy" or press "d" to deploy, "q" to quit\n');

let isDeploying = false;
let inputBuffer = '';

const triggerDeploy = () => {
  if (isDeploying) return;
  
  isDeploying = true;
  inputBuffer = '';
  console.log('\n📦 Starting deployment...\n');
  
  const deployProcess = spawn('npm', ['run', 'deploy'], {
    stdio: 'inherit',
    shell: true
  });

  deployProcess.on('close', (code) => {
    isDeploying = false;
    if (code === 0) {
      console.log('\n✅ Deployment completed successfully!');
      console.log('Type "deploy" or press "d" to deploy again, "q" to quit\n');
    } else {
      console.log(`\n❌ Deployment failed with exit code ${code}`);
      console.log('Type "deploy" or press "d" to try again, "q" to quit\n');
    }
  });

  deployProcess.on('error', (err) => {
    isDeploying = false;
    console.error(`\n❌ Error starting deployment: ${err.message}`);
    console.log('Type "deploy" or press "d" to try again, "q" to quit\n');
  });
};

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

  // Handle backspace
  if (key && (key.name === 'backspace' || key.name === 'delete')) {
    inputBuffer = inputBuffer.slice(0, -1);
    return;
  }

  // Handle Enter - clear buffer
  if (key && key.name === 'return') {
    inputBuffer = '';
    return;
  }

  // Add character to buffer if it's a printable character
  if (str && str.length > 0 && !key.ctrl && !key.meta) {
    inputBuffer += str.toLowerCase();
    
    // Keep buffer to max 10 characters to avoid memory issues
    if (inputBuffer.length > 10) {
      inputBuffer = inputBuffer.slice(-10);
    }
    
    // Check if "deploy" is typed
    if (inputBuffer.includes('deploy')) {
      triggerDeploy();
      return;
    }
  }

  // Handle 'd' keypress to deploy
  if (key && key.name === 'd' && !isDeploying) {
    triggerDeploy();
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Exiting...');
  process.exit();
});

