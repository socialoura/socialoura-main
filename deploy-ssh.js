const { Client } = require('ssh2');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const conn = new Client();

const config = {
  host: process.env.FTP_HOST,
  port: parseInt(process.env.FTP_PORT || '22'),
  username: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
};

const commands = [
  'cd ~',
  'pwd',
  'ls -la',
  'npm install --production',
  'npm start &',
  'echo "Application started!"',
];

console.log('🔐 Connecting to IONOS server via SSH...');
console.log(`📡 Host: ${config.host}`);
console.log(`👤 User: ${config.username}\n`);

conn.on('ready', () => {
  console.log('✅ SSH connection established!\n');
  
  let commandIndex = 0;
  
  function executeNextCommand() {
    if (commandIndex >= commands.length) {
      console.log('\n🎉 All commands executed!');
      conn.end();
      return;
    }
    
    const command = commands[commandIndex];
    console.log(`🔨 Running: ${command}`);
    
    conn.exec(command, (err, stream) => {
      if (err) {
        console.error('❌ Error:', err);
        conn.end();
        return;
      }
      
      stream.on('close', (code, signal) => {
        console.log(`✅ Command completed (exit code: ${code})\n`);
        commandIndex++;
        executeNextCommand();
      }).on('data', (data) => {
        console.log('   ' + data.toString().trim());
      }).stderr.on('data', (data) => {
        console.error('   ⚠️  ' + data.toString().trim());
      });
    });
  }
  
  executeNextCommand();
  
}).on('error', (err) => {
  console.error('❌ SSH connection error:', err.message);
}).connect(config);
