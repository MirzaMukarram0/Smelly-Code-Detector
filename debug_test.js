const fs = require('fs');
const path = require('path');
const Detector = require('./src/detector');

// Test configuration
const config = {
  smells: {
    LongMethod: true,
    GodClass: true,
    DuplicatedCode: true,
    LargeParameterList: true,
    MagicNumbers: true,
    FeatureEnvy: true
  },
  thresholds: {
    LongMethod: 20,
    LargeParameterList: 5,
    GodClassMethods: 10,
    GodClassFields: 15,
    DuplicatedCodeSimilarity: 0.8,
    FeatureEnvyThreshold: 3
  }
};

async function testAnalysis() {
  try {
    const detector = new Detector(config);
    const filePath = '../comprehensive_test.py';  // Test the comprehensive file
    
    console.log('📄 Testing file:', filePath);
    console.log('⚙️ Config:', JSON.stringify(config, null, 2));
    
    // Read and parse the file
    const content = fs.readFileSync(filePath, 'utf8');
    const parseResult = detector.parseFile(content, '.py');
    
    console.log('\n🔍 Parse Results:');
    console.log('- Functions found:', parseResult.functions.length);
    parseResult.functions.forEach(func => {
      console.log(`  - ${func.name}: ${func.lineCount} lines (${func.startLine}-${func.endLine}), ${func.parameters.length} params`);
    });
    
    console.log('- Classes found:', parseResult.classes.length);
    parseResult.classes.forEach(cls => {
      console.log(`  - ${cls.name}: ${cls.lineCount} lines, ${cls.methods.length} methods, ${cls.fields.length} fields`);
    });
    
    // Run full analysis
    console.log('\n🧪 Running analysis...');
    const result = await detector.analyze(filePath);
    console.log('📊 Analysis result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAnalysis();