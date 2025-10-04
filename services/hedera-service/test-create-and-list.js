const https = require('https');

// Test folder creation and listing with V47.11
async function testCreateAndList() {
    console.log('🔍 Testing folder creation and listing with V47.11...');
    
    // First, create a folder
    console.log('📁 Step 1: Creating a test folder...');
    
    const createPayload = {
        name: 'V47.11 Test Folder',
        description: 'Testing V47.11 folder creation and listing'
    };

    const createOptions = {
        hostname: 'uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com',
        port: 443,
        path: '/preprod/folders',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
        }
    };

    // Create folder
    const createResult = await new Promise((resolve, reject) => {
        const req = https.request(createOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('📁 Create Folder Response:');
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
    console.log('⏳ Waiting 3 seconds for blockchain propagation...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Then list folders
    console.log('📁 Step 2: Listing folders with V47.11...');
    
    const listOptions = {
        hostname: 'uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com',
        port: 443,
        path: '/preprod/folders',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer test-token',
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
                console.log('📁 List Folders Response:');
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

    // Analyze results
    console.log('\n🔍 Analysis:');
    console.log('📁 Create Status:', createResult.statusCode);
    console.log('📁 List Status:', listResult.statusCode);
    
    if (createResult.statusCode === 201) {
        console.log('✅ Folder creation successful');
    } else {
        console.log('❌ Folder creation failed');
    }
    
    if (listResult.statusCode === 200) {
        try {
            const listData = JSON.parse(listResult.body);
            if (listData.success && listData.data && listData.data.length > 0) {
                console.log('✅ Folder listing successful - found', listData.data.length, 'folders');
                console.log('📁 Folders:', listData.data);
            } else {
                console.log('❌ Folder listing returned empty - V47.11 logic issue');
            }
        } catch (error) {
            console.log('❌ Error parsing list response:', error.message);
        }
    } else {
        console.log('❌ Folder listing failed');
    }
}

// Run the test
testCreateAndList().catch(console.error);

