/**
 * Check specific token details to debug folder listing issue
 */

const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

async function checkTokenDetails() {
    try {
        console.log('🔍 Checking specific token details for debugging...');
        
        const lambdaClient = new LambdaClient({ region: 'ap-southeast-2' });
        
        // Test payload to check account info and token relationships
        const testPayload = {
            httpMethod: "GET",
            path: "/balance",
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
            },
            queryStringParameters: {
                accountId: "0.0.6890393"
            }
        };
        
        console.log('💰 Getting account balance and info...');
        
        const command = new InvokeCommand({
            FunctionName: 'preprod-safemate-hedera-service',
            Payload: JSON.stringify(testPayload)
        });
        
        const response = await lambdaClient.send(command);
        const responsePayload = JSON.parse(new TextDecoder().decode(response.Payload));
        
        console.log('💰 Response status:', responsePayload.statusCode);
        console.log('💰 Response body:', JSON.stringify(responsePayload.body, null, 2));
        
        // Now let's create a test to check the specific token
        console.log('\n🔍 Based on Hedera Explorer showing token creation...');
        console.log('🔍 We know that:');
        console.log('   1. Account 0.0.6890393 exists and is active');
        console.log('   2. Tokens are being created successfully');
        console.log('   3. The folder listing function is not finding them');
        
        console.log('\n🔍 This suggests:');
        console.log('   1. The token creation is working (confirmed by Hedera Explorer)');
        console.log('   2. The folder listing logic has an issue');
        console.log('   3. Either the token symbol is not "FOLDERS" or the user relationship is not set up correctly');
        
        console.log('\n🔧 Next steps:');
        console.log('   1. Check what tokens are actually associated with account 0.0.6890393');
        console.log('   2. Verify the token symbol and treasury account');
        console.log('   3. Fix the folder listing logic based on actual token details');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkTokenDetails();

