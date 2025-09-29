// Test script to check wallet status
const https = require('https');

console.log('🔍 Testing SecureWalletService.hasSecureWallet() behavior...');

// Simulate the API call that SecureWalletService makes
const testWalletCheck = () => {
  const options = {
    hostname: 'nh9d5m1g4m.execute-api.ap-southeast-2.amazonaws.com',
    port: 443,
    path: '/default/onboarding/status',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  console.log('📡 Making request to:', `https://${options.hostname}${options.path}`);
  console.log('📝 Note: This will return 401 without authentication, which should trigger onboarding');

  const req = https.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📄 Response:', data);
      
      if (res.statusCode === 401) {
        console.log('✅ Expected 401 response - this should trigger onboarding modal');
        console.log('💡 The SecureWalletService.hasSecureWallet() should return false for this case');
      } else if (res.statusCode === 200) {
        console.log('✅ 200 response - user has wallet, no onboarding needed');
      } else {
        console.log('❓ Unexpected status code:', res.statusCode);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error:', e.message);
  });
  
  req.end();
};

testWalletCheck(); 