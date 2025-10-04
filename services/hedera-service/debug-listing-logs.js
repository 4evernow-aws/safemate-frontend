/**
 * Debug folder listing with detailed logging
 */

const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

async function debugFolderListing() {
    try {
        console.log('🔍 Debugging folder listing function...');
        
        const lambdaClient = new LambdaClient({ region: 'ap-southeast-2' });
        
        // Test payload for folder listing
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
        
        console.log('📁 Invoking folder listing function...');
        console.log('📁 Payload:', JSON.stringify(testPayload, null, 2));
        
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
                    console.log('📁 Folder details:', body.data);
                } else {
                    console.log('⚠️ No folders found - this suggests an issue with the listing function');
                }
            }
        }
        
        // Check if there are any logs
        console.log('\n🔍 Checking for recent logs...');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugFolderListing();
