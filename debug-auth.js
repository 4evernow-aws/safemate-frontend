// Simple authentication debug script
console.log('🔍 SafeMate Authentication Debug Tool');
console.log('=====================================');

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  console.log('🌐 Browser environment detected');
  
  // Check localStorage
  console.log('\n📦 Local Storage:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}: ${value ? value.substring(0, 100) + '...' : 'null'}`);
  }
  
  // Check sessionStorage
  console.log('\n💾 Session Storage:');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    console.log(`${key}: ${value ? value.substring(0, 100) + '...' : 'null'}`);
  }
  
  // Check for Amplify auth
  if (window.Amplify) {
    console.log('\n⚡ Amplify detected');
  }
  
  // Check for AWS SDK
  if (window.AWS) {
    console.log('\n☁️ AWS SDK detected');
  }
  
} else {
  console.log('🖥️ Node.js environment detected');
}

console.log('\n🔧 To clear authentication:');
console.log('1. Open browser developer tools (F12)');
console.log('2. Go to Application/Storage tab');
console.log('3. Clear Local Storage and Session Storage');
console.log('4. Refresh the page');
console.log('5. Try logging in again with your credentials');

console.log('\n📧 Your login credentials should be:');
console.log('Email: simon.woods@tne.com.au');
console.log('Password: (your Cognito password)');

console.log('\n🌐 SafeMate is running at: http://localhost:5173/');
