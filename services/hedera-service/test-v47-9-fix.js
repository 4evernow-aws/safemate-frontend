/**
 * Test V47.9 fix - comprehensive folder listing test
 */

const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

async function testV47_9Fix() {
    try {
        console.log('🔍 Testing V47.9 fix - comprehensive folder listing test...');
        
        const lambdaClient = new LambdaClient({ region: 'ap-southeast-2' });
        
        // Step 1: Create a new folder to test with
        console.log('\n📁 Step 1: Creating a new folder to test with...');
        
        const createFolderPayload = {
            httpMethod: "POST",
            path: "/folders",
            pathParameters: {},
            body: JSON.stringify({ name: "V47.9 Test Folder" }),
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
        
        if (createResponsePayload.body) {
            const createBody = JSON.parse(createResponsePayload.body);
            if (createBody.success && createBody.data) {
                console.log('✅ Folder created successfully!');
                console.log('📁 Folder ID:', createBody.data.folderId);
                console.log('📁 Token ID:', createBody.data.tokenId);
                console.log('📁 Serial Number:', createBody.data.serialNumber);
                
                // Step 2: Wait for blockchain propagation
                console.log('\n⏳ Step 2: Waiting for blockchain propagation (5 seconds)...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                // Step 3: Test folder listing with V47.9 fix
                console.log('\n📁 Step 3: Testing folder listing with V47.9 fix...');
                
                const listFolderPayload = {
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
                
                const listCommand = new InvokeCommand({
                    FunctionName: 'preprod-safemate-hedera-service',
                    Payload: JSON.stringify(listFolderPayload)
                });
                
                const listResponse = await lambdaClient.send(listCommand);
                const listResponsePayload = JSON.parse(new TextDecoder().decode(listResponse.Payload));
                
                console.log('📁 List response status:', listResponsePayload.statusCode);
                console.log('📁 List response body:', JSON.stringify(listResponsePayload.body, null, 2));
                
                if (listResponsePayload.body) {
                    const listBody = JSON.parse(listResponsePayload.body);
                    console.log('📁 Folders found:', listBody.data ? listBody.data.length : 0);
                    
                    if (listBody.data && listBody.data.length > 0) {
                        console.log('✅ SUCCESS: V47.9 fix is working!');
                        console.log('📁 Folder details:', listBody.data);
                    } else {
                        console.log('❌ V47.9 fix is not working - still no folders found');
                        console.log('🔧 This suggests the treasury account detection logic needs further debugging');
                    }
                }
            } else {
                console.log('❌ Folder creation failed');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testV47_9Fix();
