/**
 * Debug script to check folder collection tokens for user
 */

const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

async function debugFolderTokens() {
    try {
        console.log('🔍 Debugging folder collection tokens...');
        
        const lambdaClient = new LambdaClient({ region: 'ap-southeast-2' });
        
        // Test payload for folder listing (GET request)
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
        
        console.log('📁 Testing folder listing...');
        
        const command = new InvokeCommand({
            FunctionName: 'preprod-safemate-hedera-service',
            Payload: JSON.stringify(testPayload)
        });
        
        const response = await lambdaClient.send(command);
        const responsePayload = JSON.parse(new TextDecoder().decode(response.Payload));
        
        console.log('📁 Response status:', responsePayload.statusCode);
        console.log('📁 Response body:', JSON.stringify(responsePayload.body, null, 2));
        
        if (responsePayload.body) {
            const body = JSON.parse(responsePayload.body);
            console.log('📁 Folders found:', body.data ? body.data.length : 0);
            if (body.data && body.data.length > 0) {
                console.log('📁 Folder details:', body.data);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugFolderTokens();
