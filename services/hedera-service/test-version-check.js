const https = require('https');

// Test to check what version of the Lambda is actually running
async function testVersionCheck() {
    console.log('🔍 Testing Lambda version to verify V47.11 is actually deployed...');
    
    // Create a test folder to see the response format
    const createPayload = {
        name: 'Version Check Test',
        description: 'Testing to see what version is running'
    };

    const createOptions = {
        hostname: 'uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com',
        port: 443,
        path: '/preprod/folders',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer eyJraWQiOiJSSjlwaStibXlqVk81SjJsSEM5YnFPTlBNOGszbTk4VjFjRDFpa0Q5QlhFPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI5OTNlNzQ1OC0yMDAxLTcwODMtNWZjMy02MWY3NjljMTQ1OWMiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTIuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTJfYTJydHA2NEpXIiwiY29nbml0bzp1c2VybmFtZSI6Ijk5M2U3NDU4LTIwMDEtNzA4My01ZmMzLTYxZjc2OWMxNDU5YyIsImdpdmVuX25hbWUiOiJTaW1vbiIsIm9yaWdpbl9qdGkiOiJlNDU0YzA1ZS0wNzNkLTRkNjctODg2MC1hN2FlYzMzYmZlYTEiLCJhdWQiOiI0dWNjZzZ1anVwcGhob3Z0MXV0djNpNjdhNyIsImN1c3RvbTphY2NvdW50X3R5cGUiOiJQZXJzb25hbCIsImV2ZW50X2lkIjoiNDg4NGRjNjgtZTAwYS00M2JlLThlYmMtOGYyZjQzNTUyMTVkIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NTkxNTE1MTEsImV4cCI6MTc1OTIzNzkxMSwiaWF0IjoxNzU5MTUxNTExLCJmYW1pbHlfbmFtZSI6Ildvb2RzIiwianRpIjoiYzViN2RkOWMtOTAwNi00MDlhLWI2ZTYtNDRjMmIzYzRmY2M1IiwiZW1haWwiOiJzaW1vbi53b29kc0B0bmUuY29tLmF1In0.isV1YZew2wQ9X9uPhwQWX1APxdKjwBUu5nsR-3WfG6ACmwCNibaNkIIJh-T1AfSLx8VZBKRdk9ozAypjJ8LUTYb4hTYtgT_X_kDvgWVW_Oskscoat8mDTYgioAt-2iAT-5uXRkmbyppiPjAHQp6JW3VitVs98XJevhIBat6x8D7x53F4TcXNsha254HjtToTocEXXebN3MhlbDsku4xFPxD_VNfwKjzMTyp_VdXIK8sYlXaDP8NYu01JN7t8tvVnQHkrO2nS02yERbiO_MI1a8AZmEAOHPTUxD3CX_FJapPyJPpR5HPt0juS9m8JwryZuwQOQQxsRv4G5hCCqseYSw',
            'Content-Type': 'application/json'
        }
    };

    const createResult = await new Promise((resolve, reject) => {
        const req = https.request(createOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('📁 Create Response:');
                console.log('📁 Status Code:', res.statusCode);
                console.log('📁 Response Body:', data);
                resolve({ statusCode: res.statusCode, body: data });
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Create request error:', error.message);
            reject(error);
        });
        
        req.write(JSON.stringify(createPayload));
        req.end();
    });

    // Wait for propagation
    console.log('\n⏳ Waiting 2 seconds for blockchain propagation...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Now test folder listing
    console.log('\n📁 Testing folder listing...');
    
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

    const listResult = await new Promise((resolve, reject) => {
        const req = https.request(listOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('📁 List Response:');
                console.log('📁 Status Code:', res.statusCode);
                console.log('📁 Response Body:', data);
                resolve({ statusCode: res.statusCode, body: data });
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ List request error:', error.message);
            reject(error);
        });
        
        req.end();
    });

    // Analysis
    console.log('\n🔍 Analysis:');
    
    if (createResult.statusCode === 201) {
        try {
            const createData = JSON.parse(createResult.body);
            console.log('✅ Folder creation successful');
            console.log('📁 Token ID:', createData.data.tokenId);
            console.log('📁 Serial Number:', createData.data.serialNumber);
            console.log('📁 Folder ID:', createData.data.folderId);
        } catch (error) {
            console.log('❌ Error parsing create response:', error.message);
        }
    }
    
    if (listResult.statusCode === 200) {
        try {
            const listData = JSON.parse(listResult.body);
            console.log('📁 List Success:', listData.success);
            console.log('📁 List Data Length:', listData.data ? listData.data.length : 0);
            
            if (listData.data && listData.data.length > 0) {
                console.log('🎉 V47.11 IS WORKING! Folders found:', listData.data.length);
                console.log('📁 Folders:', JSON.stringify(listData.data, null, 2));
            } else {
                console.log('❌ V47.11 NOT WORKING - Still no folders found');
                console.log('🔍 This confirms the V47.11 logic has an issue');
            }
        } catch (error) {
            console.log('❌ Error parsing list response:', error.message);
        }
    }
}

// Run the test
testVersionCheck().catch(console.error);

