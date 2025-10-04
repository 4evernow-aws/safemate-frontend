/**
 * Check metadata size for folder creation
 */

// Current metadata from the test
const currentMetadata = {
    "n": "V47.8 Test Folder",
    "t": "f",
    "o": "0.0.6890393",
    "p": "0",
    "l": 0,
    "s": 1
};

// Check size
const metadataBytes = Buffer.from(JSON.stringify(currentMetadata));
console.log('🔍 Current metadata analysis:');
console.log('📊 Metadata object:', currentMetadata);
console.log('📏 Metadata size:', metadataBytes.length, 'bytes');
console.log('⚠️ Size limit:', 100, 'bytes');
console.log('✅ Under limit?', metadataBytes.length <= 100 ? 'YES' : 'NO');

if (metadataBytes.length > 100) {
    console.log('❌ PROBLEM: Metadata exceeds 100-byte limit!');
    console.log('🔧 This could cause folder listing issues');
} else {
    console.log('✅ Metadata size is acceptable');
}

// Test optimized metadata
const optimizedMetadata = {
    "n": "V47.8 Test",  // Shorter name
    "t": "f",           // Type
    "o": "6890393",     // Owner (shortened)
    "p": "0",           // Parent
    "l": 0,             // Level
    "s": 1              // Serial
};

const optimizedBytes = Buffer.from(JSON.stringify(optimizedMetadata));
console.log('\n🔧 Optimized metadata analysis:');
console.log('📊 Optimized metadata:', optimizedMetadata);
console.log('📏 Optimized size:', optimizedBytes.length, 'bytes');
console.log('💾 Space saved:', metadataBytes.length - optimizedBytes.length, 'bytes');

// Test ultra-compact metadata
const ultraCompactMetadata = {
    "n": "Test",        // Very short name
    "t": "f",           // Type
    "o": "6890393",     // Owner
    "p": "0",           // Parent
    "l": 0,             // Level
    "s": 1              // Serial
};

const ultraCompactBytes = Buffer.from(JSON.stringify(ultraCompactMetadata));
console.log('\n🚀 Ultra-compact metadata analysis:');
console.log('📊 Ultra-compact metadata:', ultraCompactMetadata);
console.log('📏 Ultra-compact size:', ultraCompactBytes.length, 'bytes');
console.log('💾 Total space saved:', metadataBytes.length - ultraCompactBytes.length, 'bytes');
