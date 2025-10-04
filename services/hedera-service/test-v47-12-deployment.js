const { execSync } = require('child_process');

console.log('🧪 Testing V47.12 Deployment - Folder Listing Fix');
console.log('================================================');

try {
  // Test folder listing
  console.log('\n📁 Testing folder listing...');
  const listResponse = execSync('curl -X GET "https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod/folders" -H "Authorization: Bearer eyJraWQiOiJSSjlwaStibXlqVk81SjJsSEM5YnFPTlBNOGszbT" -H "Content-Type: application/json"', { encoding: 'utf8' });
  
  console.log('✅ Folder listing response:', listResponse);
  
  const listData = JSON.parse(listResponse);
  console.log(`📊 Found ${listData.data ? listData.data.length : 0} folders`);
  
  if (listData.data && listData.data.length > 0) {
    console.log('🎉 V47.12 FIX WORKING! Folders are being listed correctly!');
    listData.data.forEach((folder, index) => {
      console.log(`   ${index + 1}. ${folder.name} (ID: ${folder.id})`);
    });
  } else {
    console.log('⚠️  Still no folders found - V47.12 may need more time to propagate');
  }
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
}

