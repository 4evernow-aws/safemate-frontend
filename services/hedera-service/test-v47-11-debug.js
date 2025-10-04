const https = require('https');

// Test V47.11 deployment with comprehensive debugging
async function testV47_11Deployment() {
    console.log('🔍 Testing V47.11 deployment with comprehensive debugging...');
    
    const testPayload = {
        httpMethod: 'GET',
        path: '/folders',
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
        }
    };

    const options = {
        hostname: 'uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com',
        port: 443,
        path: '/preprod/folders',
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
                console.log('📁 V47.11 Folder Listing Test:');
                console.log('📁 Status Code:', res.statusCode);
                console.log('📁 Response Body:', data);
                
                try {
                    const response = JSON.parse(data);
                    console.log('📁 Parsed Response:', response);
                    
                    if (response.success && response.data && response.data.length > 0) {
                        console.log('✅ V47.11 SUCCESS: Folders found!');
                        console.log('📁 Folders:', response.data);
                    } else {
                        console.log('❌ V47.11 ISSUE: No folders found');
                        console.log('🔍 This means the V47.11 folder listing logic is not working');
                        console.log('🔍 Need to check Lambda logs for detailed debugging');
                    }
                } catch (error) {
                    console.log('❌ Error parsing response:', error.message);
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
testV47_11Deployment().catch(console.error);

