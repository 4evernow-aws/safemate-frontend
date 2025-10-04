const https = require('https');

// Test current status of folder listing with V47.11
async function testCurrentStatus() {
    console.log('🔍 Testing current status of V47.11 folder listing...');
    
    // Test folder listing
    const listOptions = {
        hostname: 'uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com',
        port: 443,
        path: '/preprod/folders',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer eyJraWQiOiJSSjlwaStibXlqVk81SjJsSEM5YnFPTlBNOGszbTk4VjFjRDFpa0Q5QlhFPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI5OTNlNzQ1OC0yMDAxLTcwODMtNWZjMy02MWY3NjljMTQ1OWMiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTIuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTJfYTJydHA2NEpXIiwiY29nbml0bzp1c2VybmFtZSI6Ijk5M2U3NDU4LTIwMDEtNzA4My01ZmMzLTYxZjc2OWMxNDU5YyIsImdpdmVuX25hbWUiOiJTaW1vbiIsIm9yaWdpbl9qdGkiOiJlNDU0YzA1ZS0wNzNkLTRkNjctODg2MC1hN2FlYzMzYmZlYTEiLCJhdWQiOiI0dWNjZzZ1anVwcGhob3Z0MXV0djNpNjdhNyIsImN1c3RvbTphY2NvdW50X3R5cGUiOiJQZXJzb25hbCIsImV2ZW50X2lkIjoiNDg4NGRjNjgtZTAwYS00M2JlLThlYmMtOGYyZjQzNTUyMTVkIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NTkxNTE1MTEsImV4cCI6MTc1OTIzNzkxMSwiaWF0IjoxNzU5MTUxNTExLCJmYW1pbHlfbmFtZSI6Ildvb2RzIiwianRpIjoiYzViN2RkOWMtOTAwNi00MDlhLWI2ZTYtNDRjMmIzYzRmY2M1IiwiZW1haWwiOiJzaW1vbi53b29kc0B0bmUuY29tLmF1In0.isV1YZew2wQ9X9uPhwQWX1APxdKjwBUu5nsR-3WfG6ACmwCNibaNkIIJh-T1AfSLx8VZBKRdk9ozAypjJ8LUTYb4hTYtgT_X_kDvgWVW_Oskscoat8mDTYgioAt-2iAT-5uXRkmbyppiPjAHQp6JW3VitVs98XJevhIBat6x8D7x53F4TcXNsha254HjtToTocEXXebN3MhlbDsku4xFPxD_VNfwKjzMTyp_VdXIK8sYlXaDP8NYu01JN7t8tvVnQHkrO2nS02yERbiO_MI1a8AZmEAOHPTUxD3CX_FJapPyJPpR5HPt0juS9m8JwryZuwQOQQxsRv4G5hCCqseYSw',
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(listOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('📁 Current Folder Listing Status:');
                console.log('📁 Status Code:', res.statusCode);
                console.log('📁 Response Body:', data);
                
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        console.log('✅ V47.11 Folder Listing Response:');
                        console.log('📁 Success:', response.success);
                        console.log('📁 Data length:', response.data ? response.data.length : 0);
                        
                        if (response.data && response.data.length > 0) {
                            console.log('🎉 V47.11 SUCCESS: Folders found!');
                            console.log('📁 Folders:', JSON.stringify(response.data, null, 2));
                        } else {
                            console.log('❌ V47.11 ISSUE: Still no folders found');
                            console.log('🔍 This suggests the V47.11 fix may not be working as expected');
                        }
                    } catch (error) {
                        console.log('❌ Error parsing response:', error.message);
                    }
                } else {
                    console.log('❌ Folder listing request failed');
                }
                
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Request error:', error.message);
            reject(error);
        });
        
        req.end();
    });
}

// Run the test
testCurrentStatus().catch(console.error);

