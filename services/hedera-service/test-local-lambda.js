// Test the Lambda function locally to see V47.11 logic
const { handler } = require('./index.js');

async function testLocalLambda() {
    console.log('🔍 Testing Lambda function locally with V47.11...');
    
    const testEvent = {
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

    try {
        console.log('📁 Invoking Lambda function locally...');
        const result = await handler(testEvent);
        
        console.log('📁 Lambda Response:');
        console.log('📁 Status Code:', result.statusCode);
        console.log('📁 Response Body:', result.body);
        
        if (result.statusCode === 200) {
            try {
                const response = JSON.parse(result.body);
                console.log('✅ Lambda execution successful');
                console.log('📁 Success:', response.success);
                console.log('📁 Data length:', response.data ? response.data.length : 0);
                
                if (response.data && response.data.length > 0) {
                    console.log('✅ V47.11 SUCCESS: Folders found!');
                    console.log('📁 Folders:', response.data);
                } else {
                    console.log('❌ V47.11 ISSUE: No folders found');
                    console.log('🔍 This means the V47.11 folder listing logic is not working');
                }
            } catch (error) {
                console.log('❌ Error parsing Lambda response:', error.message);
            }
        } else {
            console.log('❌ Lambda execution failed');
        }
        
    } catch (error) {
        console.log('❌ Lambda invocation error:', error.message);
        console.log('❌ Error stack:', error.stack);
    }
}

// Run the test
testLocalLambda().catch(console.error);

