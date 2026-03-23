import fs from 'fs';
import path from 'path';

console.log('=== Direct .env File Read ===\n');

// Read .env file directly
const envPath = path.resolve('./.env');
console.log('Reading .env file from:', envPath);

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('File contents:');
  
  const lines = envContent.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('EMAIL_USER') || line.includes('EMAIL_PASS')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
  
  // Parse EMAIL_USER and EMAIL_PASS
  const emailUserMatch = envContent.match(/EMAIL_USER=(.+)/);
  const emailPassMatch = envContent.match(/EMAIL_PASS=(.+)/);
  
  if (emailUserMatch) {
    console.log('\nParsed EMAIL_USER:', emailUserMatch[1]);
  }
  
  if (emailPassMatch) {
    console.log('Parsed EMAIL_PASS:', emailPassMatch[1] ? 'FOUND (hidden for security)' : 'NOT FOUND');
  }
  
} catch (error) {
  console.log('Error reading .env file:', error.message);
}

console.log('\n=== End Direct Read ===');