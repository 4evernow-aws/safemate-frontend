const https = require('https');

// Test to discover what tokens exist for the user
async function testTokenDiscovery() {
    console.log('🔍 Testing token discovery for user...');
    
    const testPayload = {
        httpMethod: 'GET',
        path: '/balance',
        headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
        },
        requestContext: {
            authorizer: {
                claims: {
                    sub: '993e7458-2001-7083-5fc3-61f769c1459c'
                }
            }
        },
        queryStringParameters: {
            accountId: '0.0.6890393'
        }
    };

    const options = {
        hostname: 'uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com',
        port: 443,
        path: '/preprod/balance?accountId=0.0.6890393',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('📁 Balance Response:');
                console.log('📁 Status Code:', res.statusCode);
                console.log('📁 Response Body:', data);
                
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        console.log('✅ Balance retrieved successfully');
                        console.log('📁 Account:', response.accountId);
                        console.log('📁 Balance:', response.balance, 'HBAR');
                    } catch (error) {
                        console.log('❌ Error parsing balance response:', error.message);
                    }
                } else {
                    console.log('❌ Balance request failed');
                }
                
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Request error:', error.message);
            reject(error);
        });
        
        req.end();
    });
}

// Run the test
testTokenDiscovery().catch(console.error);

