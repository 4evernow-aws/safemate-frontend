/**
 * Debug token info to see what symbol our folder collection has
 */

const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

async function debugTokenInfo() {
    try {
        console.log('🔍 Debugging token info for folder collection...');
        
        const lambdaClient = new LambdaClient({ region: 'ap-southeast-2' });
        
        // Test payload to get account info
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
        
        console.log('💰 Getting account info...');
        
        const command = new InvokeCommand({
            FunctionName: 'preprod-safemate-hedera-service',
            Payload: JSON.stringify(testPayload)
        });
        
        const response = await lambdaClient.send(command);
        const responsePayload = JSON.parse(new TextDecoder().decode(response.Payload));
        
        console.log('💰 Response status:', responsePayload.statusCode);
        console.log('💰 Response body:', JSON.stringify(responsePayload.body, null, 2));
        
        // Now let's create a test to check what tokens the user has
        console.log('\n🔍 Creating a test to check user tokens...');
        
        // We know from our folder creation that the token ID is 0.0.6920175
        // Let's check what symbol it has
        
        console.log('📁 Expected folder collection token ID: 0.0.6920175');
        console.log('📁 This should have symbol "FOLDERS" according to the listing function');
        console.log('📁 But the listing function is not finding any folders');
        console.log('📁 This suggests either:');
        console.log('   1. The token symbol is not "FOLDERS"');
        console.log('   2. The user does not own any NFT serials');
        console.log('   3. The token relationship is not set up correctly');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugTokenInfo();
