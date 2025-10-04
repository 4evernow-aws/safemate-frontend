/**
 * Debug script to check all tokens for user account 0.0.6890393
 */

const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

async function debugUserTokens() {
    try {
        console.log('🔍 Debugging user tokens for account 0.0.6890393...');
        
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
            }
        };
        
        console.log('💰 Testing balance endpoint...');
        
        const command = new InvokeCommand({
            FunctionName: 'preprod-safemate-hedera-service',
            Payload: JSON.stringify(testPayload)
        });
        
        const response = await lambdaClient.send(command);
        const responsePayload = JSON.parse(new TextDecoder().decode(response.Payload));
        
        console.log('💰 Response status:', responsePayload.statusCode);
        console.log('💰 Response body:', JSON.stringify(responsePayload.body, null, 2));
        
        // Now test creating a folder to see what happens
        console.log('\n📁 Testing folder creation...');
        
        const createFolderPayload = {
            httpMethod: "POST",
            path: "/folders",
            pathParameters: {},
            body: JSON.stringify({ name: "Debug Test Folder" }),
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
        
        const createCommand = new InvokeCommand({
            FunctionName: 'preprod-safemate-hedera-service',
            Payload: JSON.stringify(createFolderPayload)
        });
        
        const createResponse = await lambdaClient.send(createCommand);
        const createResponsePayload = JSON.parse(new TextDecoder().decode(createResponse.Payload));
        
        console.log('📁 Create response status:', createResponsePayload.statusCode);
        console.log('📁 Create response body:', JSON.stringify(createResponsePayload.body, null, 2));
        
        // Now test listing folders again
        console.log('\n📁 Testing folder listing after creation...');
        
        const listCommand = new InvokeCommand({
            FunctionName: 'preprod-safemate-hedera-service',
            Payload: JSON.stringify(testPayload)
        });
        
        const listResponse = await lambdaClient.send(listCommand);
        const listResponsePayload = JSON.parse(new TextDecoder().decode(listResponse.Payload));
        
        console.log('📁 List response status:', listResponsePayload.statusCode);
        console.log('📁 List response body:', JSON.stringify(listResponsePayload.body, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugUserTokens();
