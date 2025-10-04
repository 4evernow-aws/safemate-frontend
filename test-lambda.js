// Simple test Lambda function to verify basic functionality
exports.handler = async (event) => {
  console.log('Test Lambda event:', JSON.stringify(event, null, 2));
  
  const { httpMethod, path, body, headers } = event;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-cognito-token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };
  
  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'CORS preflight' })
    };
  }
  
  try {
    let result;
    
    switch (path) {
      case '/health':
        result = { 
          success: true, 
          message: 'Test Lambda is healthy', 
          version: 'V48.0-TEST',
          timestamp: new Date().toISOString(),
          event: {
            httpMethod,
            path,
            hasBody: !!body,
            hasHeaders: !!headers
          }
        };
        break;
        
      case '/test':
        result = { 
          success: true, 
          message: 'Test endpoint working',
          environment: {
            NODE_ENV: process.env.NODE_ENV || 'undefined',
            VERSION: process.env.VERSION || 'undefined',
            HEDERA_ACCOUNT_ID: process.env.HEDERA_ACCOUNT_ID || 'undefined'
          }
        };
        break;
        
      default:
        result = { 
          success: false, 
          error: 'Endpoint not found',
          availableEndpoints: ['/health', '/test']
        };
        break;
    }
    
    return {
      statusCode: result.success ? 200 : 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
    };
    
  } catch (error) {
    console.error('Test Lambda handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message,
        stack: error.stack
      })
    };
  }
};
