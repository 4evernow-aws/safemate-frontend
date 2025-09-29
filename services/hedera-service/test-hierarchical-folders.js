/**
 * Test script for V47 Hierarchical Folder Structure
 * Tests the new single collection approach with hierarchical metadata
 */

const testEvent = {
  httpMethod: 'GET',
  path: '/folders',
  pathParameters: null,
  body: null,
  requestContext: {
    authorizer: {
      claims: {
        sub: 'test-user-123'
      }
    }
  },
  headers: {
    origin: 'https://preprod-safemate-static-hosting.s3-website-ap-southeast-2.amazonaws.com'
  }
};

const testCreateFolderEvent = {
  httpMethod: 'POST',
  path: '/folders',
  pathParameters: null,
  body: JSON.stringify({
    name: 'Test Hierarchical Folder',
    parentFolderId: null
  }),
  requestContext: {
    authorizer: {
      claims: {
        sub: 'test-user-123'
      }
    }
  },
  headers: {
    origin: 'https://preprod-safemate-static-hosting.s3-website-ap-southeast-2.amazonaws.com'
  }
};

console.log('🧪 Testing V47 Hierarchical Folder Structure');
console.log('📋 Test Event for folder listing:', JSON.stringify(testEvent, null, 2));
console.log('📋 Test Event for folder creation:', JSON.stringify(testCreateFolderEvent, null, 2));

// Test the Lambda function
async function testLambdaFunction() {
  try {
    console.log('🔧 Testing Lambda function with hierarchical folder structure...');
    
    // Import the handler
    const { handler } = require('./v42-force-deploy/index.js');
    
    // Test folder listing
    console.log('\n📋 Testing folder listing...');
    const listResult = await handler(testEvent);
    console.log('✅ Folder listing result:', JSON.stringify(listResult, null, 2));
    
    // Test folder creation
    console.log('\n📋 Testing folder creation...');
    const createResult = await handler(testCreateFolderEvent);
    console.log('✅ Folder creation result:', JSON.stringify(createResult, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testLambdaFunction();

