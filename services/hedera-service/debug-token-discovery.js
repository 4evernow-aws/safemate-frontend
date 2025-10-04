const https = require('https');

// Debug script to discover the actual folder collection token ID
async function debugTokenDiscovery() {
    console.log('🔍 Debugging token discovery for V47.11...');
    
    // First, let's check the user's account info to see what tokens they have
    const accountOptions = {
        hostname: 'uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com',
        port: 443,
        path: '/preprod/balance?accountId=0.0.6890393',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer eyJraWQiOiJSSjlwaStibXlqVk81SjJsSEM5YnFPTlBNOGszbTk4VjFjRDFpa0Q5QlhFPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI5OTNlNzQ1OC0yMDAxLTcwODMtNWZjMy02MWY3NjljMTQ1OWMiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTIuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTJfYTJydHA2NEpXIiwiY29nbml0bzp1c2VybmFtZSI6Ijk5M2U3NDU4LTIwMDEtNzA4My01ZmMzLTYxZjc2OWMxNDU5YyIsImdpdmVuX25hbWUiOiJTaW1vbiIsIm9yaWdpbl9qdGkiOiJlNDU0YzA1ZS0wNzNkLTRkNjctODg2MC1hN2FlYzMzYmZlYTEiLCJhdWQiOiI0dWNjZzZ1anVwcGhob3Z0MXV0djNpNjdhNyIsImN1c3RvbTphY2NvdW50X3R5cGUiOiJQZXJzb25hbCIsImV2ZW50X2lkIjoiNDg4NGRjNjgtZTAwYS00M2JlLThlYmMtOGYyZjQzNTUyMTVkIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NTkxNTE1MTEsImV4cCI6MTc1OTIzNzkxMSwiaWF0IjoxNzU5MTUxNTExLCJmYW1pbHlfbmFtZSI6Ildvb2RzIiwianRpIjoiYzViN2RkOWMtOTAwNi00MDlhLWI2ZTYtNDRjMmIzYzRmY2M1IiwiZW1haWwiOiJzaW1vbi53b29kc0B0bmUuY29tLmF1In0.isV1YZew2wQ9X9uPhwQWX1APxdKjwBUu5nsR-3WfG6ACmwCNibaNkIIJh-T1AfSLx8VZBKRdk9ozAypjJ8LUTYb4hTYtgT_X_kDvgWVW_Oskscoat8mDTYgioAt-2iAT-5uXRkmbyppiPjAHQp6JW3VitVs98XJevhIBat6x8D7x53F4TcXNsha254HjtToTocEXXebN3MhlbDsku4xFPxD_VNfwKjzMTyp_VdXIK8sYlXaDP8NYu01JN7t8tvVnQHkrO2nS02yERbiO_MI1a8AZmEAOHPTUxD3CX_FJapPyJPpR5HPt0juS9m8JwryZuwQOQQxsRv4G5hCCqseYSw',
            'Content-Type': 'application/json'
        }
    };

    console.log('📁 Step 1: Checking account balance and token relationships...');
    
    const accountResult = await new Promise((resolve, reject) => {
        const req = https.request(accountOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('📁 Account Balance Response:');
                console.log('📁 Status Code:', res.statusCode);
                console.log('📁 Response Body:', data);
                resolve({ statusCode: res.statusCode, body: data });
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Account request error:', error.message);
            reject(error);
        });
        
        req.end();
    });

    // Now let's try to create a folder to see what token ID gets created
    console.log('\n📁 Step 2: Attempting to create a test folder to see token creation...');
    
    const createPayload = {
        name: 'V47.11 Debug Test Folder',
        description: 'Testing V47.11 token creation and discovery'
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
                console.log('📁 Folder Creation Response:');
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

    // Wait a moment for blockchain propagation
    console.log('\n⏳ Waiting 3 seconds for blockchain propagation...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Now check folder listing again
    console.log('\n📁 Step 3: Checking folder listing after creation...');
    
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
                console.log('📁 Folder Listing Response:');
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
    console.log('📁 Account Status:', accountResult.statusCode);
    console.log('📁 Create Status:', createResult.statusCode);
    console.log('📁 List Status:', listResult.statusCode);
    
    if (createResult.statusCode === 201) {
        try {
            const createData = JSON.parse(createResult.body);
            console.log('✅ Folder creation successful');
            console.log('📁 Created folder data:', JSON.stringify(createData, null, 2));
            
            // Extract token ID from creation response
            if (createData.data && createData.data.tokenId) {
                console.log('🎯 FOUND TOKEN ID:', createData.data.tokenId);
                console.log('🔍 This is the actual folder collection token ID that V47.11 should be checking!');
            }
        } catch (error) {
            console.log('❌ Error parsing create response:', error.message);
        }
    } else {
        console.log('❌ Folder creation failed');
    }
    
    if (listResult.statusCode === 200) {
        try {
            const listData = JSON.parse(listResult.body);
            if (listData.success && listData.data && listData.data.length > 0) {
                console.log('✅ Folder listing successful - found', listData.data.length, 'folders');
                console.log('📁 Folders:', JSON.stringify(listData.data, null, 2));
            } else {
                console.log('❌ Folder listing returned empty - V47.11 logic issue confirmed');
            }
        } catch (error) {
            console.log('❌ Error parsing list response:', error.message);
        }
    } else {
        console.log('❌ Folder listing failed');
    }
}

// Run the debug
debugTokenDiscovery().catch(console.error);

