/**
 * SafeMate v2.0 - Diagnostic Lambda Function V48.1
 * 
 * Debug user ID extraction and folder listing
 * 
 * Version: V48.1-Diagnostic
 * Last Updated: 2025-10-02
 * 
 * @author SafeMate Development Team
 */

exports.handler = async (event) => {
    console.log('=== DIAGNOSTIC LAMBDA V48.1 START ===');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Handle different routes
        const path = event.path || event.requestContext?.path || '/';
        const method = event.httpMethod || event.requestContext?.httpMethod || 'GET';
        
        console.log(`Processing ${method} ${path}`);
        
        if (path === '/health' || path === '/preprod/health') {
            // Health check endpoint
            const result = {
                success: true,
                message: 'SafeMate v2 API is healthy',
                version: 'V48.1-Diagnostic',
                timestamp: new Date().toISOString(),
                environment: {
                    NODE_ENV: process.env.NODE_ENV,
                    AWS_REGION: process.env.AWS_REGION,
                    HEDERA_NETWORK: process.env.HEDERA_NETWORK,
                    HEDERA_ACCOUNT_ID: process.env.HEDERA_ACCOUNT_ID,
                    FOLDER_COLLECTION_TOKEN: process.env.FOLDER_COLLECTION_TOKEN,
                    SAFEMATE_FOLDERS_TABLE: process.env.SAFEMATE_FOLDERS_TABLE
                }
            };
            
            console.log('Health check result:', JSON.stringify(result, null, 2));
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token',
                    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS'
                },
                body: JSON.stringify(result)
            };
        } else if (path === '/folders' || path === '/preprod/folders') {
            // Debug folder listing
            console.log('=== FOLDER LISTING DEBUG ===');
            
            // Try to extract user ID from different possible locations
            let userId = null;
            let userIdSource = 'none';
            
            // Method 1: From authorizer claims
            try {
                if (event.requestContext?.authorizer?.claims?.sub) {
                    userId = event.requestContext.authorizer.claims.sub;
                    userIdSource = 'authorizer.claims.sub';
                }
            } catch (e) {
                console.log('Method 1 failed:', e.message);
            }
            
            // Method 2: From authorizer directly
            if (!userId) {
                try {
                    if (event.requestContext?.authorizer?.sub) {
                        userId = event.requestContext.authorizer.sub;
                        userIdSource = 'authorizer.sub';
                    }
                } catch (e) {
                    console.log('Method 2 failed:', e.message);
                }
            }
            
            // Method 3: From headers
            if (!userId) {
                try {
                    const authHeader = event.headers?.authorization || event.headers?.Authorization;
                    if (authHeader) {
                        // Extract user ID from JWT token (simplified)
                        const token = authHeader.replace('Bearer ', '');
                        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                        userId = payload.sub;
                        userIdSource = 'jwt-token';
                    }
                } catch (e) {
                    console.log('Method 3 failed:', e.message);
                }
            }
            
            console.log(`User ID extraction result: ${userId} (source: ${userIdSource})`);
            
            const result = {
                success: true,
                message: 'Folder listing debug',
                debug: {
                    userId: userId,
                    userIdSource: userIdSource,
                    eventStructure: {
                        hasRequestContext: !!event.requestContext,
                        hasAuthorizer: !!event.requestContext?.authorizer,
                        hasClaims: !!event.requestContext?.authorizer?.claims,
                        hasSub: !!event.requestContext?.authorizer?.claims?.sub,
                        headers: Object.keys(event.headers || {}),
                        path: path,
                        method: method
                    }
                },
                data: [] // Empty for now
            };
            
            console.log('Folder listing debug result:', JSON.stringify(result, null, 2));
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token',
                    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS'
                },
                body: JSON.stringify(result)
            };
        } else {
            // Default diagnostic response
            const result = {
                success: true,
                message: 'Diagnostic Lambda V48.1 is working',
                timestamp: new Date().toISOString(),
                path: path,
                method: method,
                event: event,
                environment: {
                    NODE_ENV: process.env.NODE_ENV,
                    AWS_REGION: process.env.AWS_REGION,
                    HEDERA_NETWORK: process.env.HEDERA_NETWORK,
                    HEDERA_ACCOUNT_ID: process.env.HEDERA_ACCOUNT_ID,
                    FOLDER_COLLECTION_TOKEN: process.env.FOLDER_COLLECTION_TOKEN,
                    SAFEMATE_FOLDERS_TABLE: process.env.SAFEMATE_FOLDERS_TABLE
                }
            };
            
            console.log('Diagnostic result:', JSON.stringify(result, null, 2));
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token',
                    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS'
                },
                body: JSON.stringify(result)
            };
        }
        
    } catch (error) {
        console.error('Diagnostic Lambda V48.1 Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-cognito-token',
                'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS'
            },
            body: JSON.stringify({ success: false, error: error.message, stack: error.stack })
        };
    } finally {
        console.log('=== DIAGNOSTIC LAMBDA V48.1 END ===');
    }
};
