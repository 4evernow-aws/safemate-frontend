/**
 * Debug token relationships to see why folders aren't being found
 */

const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

async function debugTokenRelationships() {
    try {
        console.log('🔍 Debugging token relationships for user 0.0.6890393...');
        
        const lambdaClient = new LambdaClient({ region: 'ap-southeast-2' });
        
        // Create a test payload that will trigger the listing function
        // and capture detailed logs
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
        
        console.log('📁 Testing folder listing with detailed logging...');
        console.log('📁 This should show us:');
        console.log('   1. How many token relationships the user has');
        console.log('   2. What tokens are found');
        console.log('   3. Whether any have symbol "FOLDERS"');
        console.log('   4. Whether the user owns any NFT serials');
        
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
                if (body.data.length === 0) {
                    console.log('\n❌ PROBLEM IDENTIFIED:');
                    console.log('❌ No folders found in listing');
                    console.log('❌ This means the queryUserFoldersFromBlockchain function is not finding:');
                    console.log('   1. A token with symbol "FOLDERS"');
                    console.log('   2. OR the user does not own any NFT serials for that token');
                    console.log('   3. OR there is an issue with the token relationship');
                    
                    console.log('\n🔧 NEXT STEPS:');
                    console.log('🔧 1. Check if token 0.0.6920175 actually has symbol "FOLDERS"');
                    console.log('🔧 2. Check if user 0.0.6890393 has a token relationship with 0.0.6920175');
                    console.log('🔧 3. Check if user owns any NFT serials for token 0.0.6920175');
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugTokenRelationships();
