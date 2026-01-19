const SftpClient = require('ssh2-sftp-client');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sftp = new SftpClient();

const config = {
  host: process.env.FTP_HOST,
  port: parseInt(process.env.FTP_PORT || '22'),
  username: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
};

const filesToUpload = [
  { local: '.next', remote: '.next' },
  { local: 'public', remote: 'public' },
  { local: 'src', remote: 'src' },
  { local: 'package.json', remote: 'package.json' },
  { local: 'package-lock.json', remote: 'package-lock.json' },
  { local: 'next.config.mjs', remote: 'next.config.mjs' },
  { local: 'tsconfig.json', remote: 'tsconfig.json' },
  { local: '.env.production', remote: '.env' },
];

async function uploadDirectory(localPath, remotePath) {
  console.log(`📁 Uploading directory: ${localPath} -> ${remotePath}`);
  
  try {
    // Create remote directory if it doesn't exist
    await sftp.mkdir(remotePath, true);
    
    // Upload directory recursively
    await sftp.uploadDir(localPath, remotePath);
    
    console.log(`✅ Uploaded: ${localPath}`);
  } catch (err) {
    console.error(`❌ Error uploading ${localPath}:`, err.message);
  }
}

async function uploadFile(localPath, remotePath) {
  console.log(`📄 Uploading file: ${localPath} -> ${remotePath}`);
  
  try {
    await sftp.put(localPath, remotePath);
    console.log(`✅ Uploaded: ${localPath}`);
  } catch (err) {
    console.error(`❌ Error uploading ${localPath}:`, err.message);
  }
}

async function deploy() {
  console.log('🚀 Starting deployment to IONOS...\n');
  console.log(`📡 Connecting to: ${config.host}`);
  console.log(`👤 User: ${config.username}\n`);

  try {
    // Connect to SFTP
    await sftp.connect(config);
    console.log('✅ Connected to IONOS server!\n');

    // Upload files and directories
    for (const item of filesToUpload) {
      const localPath = path.join(__dirname, item.local);
      
      // Check if path exists
      if (!fs.existsSync(localPath)) {
        console.log(`⚠️  Skipping ${item.local} (not found)`);
        continue;
      }

      // Check if it's a directory or file
      const stats = fs.statSync(localPath);
      
      if (stats.isDirectory()) {
        await uploadDirectory(localPath, item.remote);
      } else {
        await uploadFile(localPath, item.remote);
      }
    }

    console.log('\n🎉 Deployment complete!');
    console.log('\n📝 Next steps:');
    console.log('1. SSH into your server: ssh ' + config.username + '@' + config.host);
    console.log('2. Run: npm install --production');
    console.log('3. Run: npm start');
    console.log('\nOr run: node deploy-ssh.js (if you create that script)\n');

  } catch (err) {
    console.error('❌ Deployment failed:', err.message);
    process.exit(1);
  } finally {
    await sftp.end();
  }
}

// Check if required environment variables are set
if (!config.host || !config.username || !config.password) {
  console.error('❌ Missing FTP credentials in .env.local file!');
  console.error('Required: FTP_HOST, FTP_USER, FTP_PASSWORD');
  process.exit(1);
}

deploy();
