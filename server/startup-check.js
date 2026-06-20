/**
 * Pre-flight checks before starting the server
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n📋 PRE-FLIGHT STARTUP CHECKS\n');
console.log('=' .repeat(50));

let issues = 0;

// Check 1: .env file exists
if (fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('✅ .env file exists');
} else {
  console.log('❌ .env file NOT found');
  issues++;
}

// Check 2: JWT_SECRET is set
if (process.env.JWT_SECRET) {
  const secretLength = process.env.JWT_SECRET.length;
  if (secretLength > 20) {
    console.log(`✅ JWT_SECRET set (${secretLength} chars)`);
  } else {
    console.log(`⚠️  JWT_SECRET too short (${secretLength} chars, should be 30+)`);
    issues++;
  }
} else {
  console.log('❌ JWT_SECRET NOT set');
  issues++;
}

// Check 3: OPENAI_API_KEY is set
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.includes('sk-')) {
  console.log(`✅ OPENAI_API_KEY set (sk-...)`);
} else if (process.env.OPENAI_API_KEY) {
  console.log(`⚠️  OPENAI_API_KEY set but seems invalid: ${process.env.OPENAI_API_KEY.substring(0, 20)}...`);
  issues++;
} else {
  console.log('❌ OPENAI_API_KEY NOT set');
  issues++;
}

// Check 4: MongoDB URI
if (process.env.MONGODB_URI) {
  console.log(`✅ MONGODB_URI set: ${process.env.MONGODB_URI}`);
} else {
  console.log('❌ MONGODB_URI NOT set');
  issues++;
}

// Check 5: PORT
if (process.env.PORT) {
  console.log(`✅ PORT set to ${process.env.PORT}`);
} else {
  console.log('⚠️  PORT not set, defaulting to 5000');
}

// Check 6: CORS_ORIGIN
if (process.env.CORS_ORIGIN) {
  console.log(`✅ CORS_ORIGIN set to ${process.env.CORS_ORIGIN}`);
} else {
  console.log('⚠️  CORS_ORIGIN not set, defaulting to http://localhost:3000');
}

// Check 7: Models exist
const modelsPath = path.join(__dirname, 'models');
if (fs.existsSync(path.join(modelsPath, 'User.js')) && fs.existsSync(path.join(modelsPath, 'Interview.js'))) {
  console.log('✅ Models (User.js, Interview.js) found');
} else {
  console.log('❌ Models missing');
  issues++;
}

// Check 8: Routes exist
const routesPath = path.join(__dirname, 'routes');
if (fs.existsSync(path.join(routesPath, 'auth.js')) && fs.existsSync(path.join(routesPath, 'interview.js'))) {
  console.log('✅ Routes (auth.js, interview.js) found');
} else {
  console.log('❌ Routes missing');
  issues++;
}

console.log('=' .repeat(50));

if (issues === 0) {
  console.log(`\n🚀 ALL CHECKS PASSED - Ready to start!\n`);
  process.exit(0);
} else {
  console.log(`\n❌ ${issues} issue(s) found. Please fix before starting.\n`);
  process.exit(1);
}
