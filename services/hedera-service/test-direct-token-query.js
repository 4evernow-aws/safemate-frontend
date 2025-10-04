/**
 * Test direct token query to check token details
 */

const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

async function testDirectTokenQuery() {
    try {
        console.log('🔍 Testing direct token query for debugging...');
        
        const lambdaClient = new LambdaClient({ region: 'ap-southeast-2' });
        
        // Create a test payload that will trigger the folder listing function
        // and capture the detailed logs from the V47.11 fix
        const testPayload = {
            httpMethod: "GET",
            path: "/folders",
            pathParameters: {},
            body: null,
            headers: {
                "Authorization": "Bearer test-token",
                "Content-Type": "application/json"
            },
            requestContext: {
                authorizer: {
                    claims: {
                        sub: "993e7458-2001-7083-5fc3-61f769c1459c"
                    }
                }
            }
        };
        
        console.log('📁 Testing folder listing with V47.11 fix...');
        console.log('📁 This should show detailed logs about:');
        console.log('   1. Token relationships found');
        console.log('   2. Treasury account detection');
        console.log('   3. Token info for 0.0.6920175');
        console.log('   4. NFT serial queries');
        
        const command = new InvokeCommand({
            FunctionName: 'preprod-safemate-hedera-service',
            Payload: JSON.stringify(testPayload)
        });
        
        const response = await lambdaClient.send(command);
        const responsePayload = JSON.parse(new TextDecoder().decode(response.Payload));
        
        console.log('\n📁 Lambda Response:');
        console.log('📁 Status Code:', responsePayload.statusCode);
        console.log('📁 Response Body:', responsePayload.body);
        
        if (responsePayload.body) {
            const body = JSON.parse(responsePayload.body);
            console.log('\n📁 Parsed Response:');
            console.log('📁 Success:', body.success);
            console.log('📁 Data:', body.data);
            console.log('📁 Error:', body.error);
            
            if (body.data && Array.isArray(body.data)) {
                console.log('📁 Folders found:', body.data.length);
                if (body.data.length > 0) {
                    console.log('✅ SUCCESS: V47.11 fix is working!');
                    console.log('📁 Folder details:', body.data);
                } else {
                    console.log('❌ V47.11 fix is not working - still no folders found');
                    console.log('🔧 The issue is in the folder listing logic');
                }
            }
        }
        
        console.log('\n🔍 Since Hedera Explorer shows token creation:');
        console.log('🔍 The problem is definitely in the folder listing function');
        console.log('🔍 We need to check the Lambda logs for detailed debugging info');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testDirectTokenQuery();
