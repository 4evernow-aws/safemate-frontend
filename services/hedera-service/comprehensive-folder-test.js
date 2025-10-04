/**
 * Comprehensive test: Create folder, wait, then list folders
 */

const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

async function comprehensiveFolderTest() {
    try {
        console.log('🔍 Comprehensive folder test after V47.8 deployment...');
        
        const lambdaClient = new LambdaClient({ region: 'ap-southeast-2' });
        
        // Step 1: Create a new folder
        console.log('\n📁 Step 1: Creating new folder...');
        
        const createFolderPayload = {
            httpMethod: "POST",
            path: "/folders",
            pathParameters: {},
            body: JSON.stringify({ name: "V47.8 Test Folder" }),
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
                
                // Step 3: List folders
                console.log('\n📁 Step 3: Listing folders...');
                
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
                        console.log('✅ SUCCESS: Folders are visible in listing!');
                        console.log('📁 Folder details:', listBody.data);
                    } else {
                        console.log('⚠️ No folders found in listing - investigating...');
                        
                        // Step 4: Check if there's a timing issue
                        console.log('\n⏳ Step 4: Waiting longer for blockchain propagation (10 seconds)...');
                        await new Promise(resolve => setTimeout(resolve, 10000));
                        
                        // Try listing again
                        const listResponse2 = await lambdaClient.send(listCommand);
                        const listResponsePayload2 = JSON.parse(new TextDecoder().decode(listResponse2.Payload));
                        
                        console.log('📁 Second list response:', JSON.stringify(listResponsePayload2.body, null, 2));
                        
                        if (listResponsePayload2.body) {
                            const listBody2 = JSON.parse(listResponsePayload2.body);
                            if (listBody2.data && listBody2.data.length > 0) {
                                console.log('✅ SUCCESS: Folders visible after longer wait!');
                            } else {
                                console.log('❌ Still no folders found - there may be an issue with the listing function');
                            }
                        }
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

comprehensiveFolderTest();
