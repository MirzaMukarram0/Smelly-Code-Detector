const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Detector = require('../detector');
const yaml = require('js-yaml');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${originalName}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.py', '.java'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only .py and .java files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Load default configuration
let defaultConfig;
try {
  const configPath = path.join(__dirname, '..', '..', 'config.yaml');
  const configContent = fs.readFileSync(configPath, 'utf8');
  defaultConfig = yaml.load(configContent);
} catch (error) {
  console.warn('Could not load config.yaml, using defaults');
  defaultConfig = {
    smells: {
      LongMethod: true,
      GodClass: true,
      DuplicatedCode: true,
      LargeParameterList: true,
      MagicNumbers: true,
      FeatureEnvy: true
    },
    thresholds: {
      LongMethod: 40,
      LargeParameterList: 5,
      GodClassMethods: 10,
      GodClassFields: 15,
      DuplicatedCodeSimilarity: 0.8,
      FeatureEnvyThreshold: 3
    }
  };
}

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API endpoint to analyze uploaded file
app.post('/api/analyze-file', upload.single('codeFile'), async (req, res) => {
  try {
    console.log('📝 File upload request received');
    console.log('📂 Request body:', Object.keys(req.body));
    console.log('🔧 Detectors (detectors[]):', req.body['detectors[]']);
    console.log('🔧 Detectors (detectors):', req.body.detectors);
    console.log('🔧 Full body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    console.log(`📄 Processing file: ${originalName} at ${filePath}`);
    
    // Parse configuration from request - handle multiple formats
    let activeDetectors = req.body['detectors[]'] || req.body.detectors || [];
    
    // Handle single values vs arrays
    if (typeof activeDetectors === 'string') {
      activeDetectors = [activeDetectors];
    }
    
    // Also check for individual detector fields as fallback
    if (!activeDetectors || activeDetectors.length === 0) {
      activeDetectors = [];
      if (req.body.longMethod === 'true') activeDetectors.push('longMethod');
      if (req.body.godClass === 'true') activeDetectors.push('godClass');
      if (req.body.duplicatedCode === 'true') activeDetectors.push('duplicatedCode');
      if (req.body.largeParameterList === 'true') activeDetectors.push('largeParameterList');
      if (req.body.magicNumbers === 'true') activeDetectors.push('magicNumbers');
      if (req.body.featureEnvy === 'true') activeDetectors.push('featureEnvy');
    }
    
    console.log('🎯 Active detectors:', activeDetectors);
    
    const config = {
      smells: {
        LongMethod: activeDetectors.includes('longMethod'),
        GodClass: activeDetectors.includes('godClass'),
        DuplicatedCode: activeDetectors.includes('duplicatedCode'),
        LargeParameterList: activeDetectors.includes('largeParameterList'),
        MagicNumbers: activeDetectors.includes('magicNumbers'),
        FeatureEnvy: activeDetectors.includes('featureEnvy')
      },
      thresholds: {
        LongMethod: parseInt(req.body.threshold_longMethod) || defaultConfig.thresholds.LongMethod,
        LargeParameterList: parseInt(req.body.threshold_largeParameterList) || defaultConfig.thresholds.LargeParameterList,
        GodClassMethods: parseInt(req.body.threshold_godClass) || defaultConfig.thresholds.GodClassMethods,
        GodClassFields: parseInt(req.body.threshold_godClass) || defaultConfig.thresholds.GodClassFields,
        DuplicatedCodeSimilarity: parseFloat(req.body.threshold_duplicatedCode) || defaultConfig.thresholds.DuplicatedCodeSimilarity,
        FeatureEnvyThreshold: parseInt(req.body.threshold_featureEnvy) || defaultConfig.thresholds.FeatureEnvyThreshold
      }
    };

    console.log('⚙️ Analysis config:', config);

    // Analyze the file
    const detector = new Detector(config);
    console.log('🔍 Starting analysis...');
    const result = await detector.analyze(filePath);
    console.log('✅ Analysis complete:', result);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    // Add original filename to result
    result.originalFilename = originalName;
    
    res.json(result);
  } catch (error) {
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('❌ Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed',
      details: error.message 
    });
  }
});

// API endpoint to analyze pasted code
app.post('/api/analyze-code', async (req, res) => {
  try {
    const { code, language, filename } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    if (!['python', 'java'].includes(language)) {
      return res.status(400).json({ error: 'Language must be python or java' });
    }

    // Parse configuration from request
    let activeDetectors = req.body['detectors[]'] || req.body.detectors || [];
    
    // Handle single values vs arrays
    if (typeof activeDetectors === 'string') {
      activeDetectors = [activeDetectors];
    }
    
    // Also check for individual detector fields as fallback
    if (!activeDetectors || activeDetectors.length === 0) {
      activeDetectors = [];
      if (req.body.longMethod === 'true') activeDetectors.push('longMethod');
      if (req.body.godClass === 'true') activeDetectors.push('godClass');
      if (req.body.duplicatedCode === 'true') activeDetectors.push('duplicatedCode');
      if (req.body.largeParameterList === 'true') activeDetectors.push('largeParameterList');
      if (req.body.magicNumbers === 'true') activeDetectors.push('magicNumbers');
      if (req.body.featureEnvy === 'true') activeDetectors.push('featureEnvy');
    }
    
    const config = {
      smells: {
        LongMethod: activeDetectors.includes('longMethod'),
        GodClass: activeDetectors.includes('godClass'),
        DuplicatedCode: activeDetectors.includes('duplicatedCode'),
        LargeParameterList: activeDetectors.includes('largeParameterList'),
        MagicNumbers: activeDetectors.includes('magicNumbers'),
        FeatureEnvy: activeDetectors.includes('featureEnvy')
      },
      thresholds: {
        LongMethod: parseInt(req.body.threshold_longMethod) || defaultConfig.thresholds.LongMethod,
        LargeParameterList: parseInt(req.body.threshold_largeParameterList) || defaultConfig.thresholds.LargeParameterList,
        GodClassMethods: parseInt(req.body.threshold_godClass) || defaultConfig.thresholds.GodClassMethods,
        GodClassFields: parseInt(req.body.threshold_godClass) || defaultConfig.thresholds.GodClassFields,
        DuplicatedCodeSimilarity: parseFloat(req.body.threshold_duplicatedCode) || defaultConfig.thresholds.DuplicatedCodeSimilarity,
        FeatureEnvyThreshold: parseInt(req.body.threshold_featureEnvy) || defaultConfig.thresholds.FeatureEnvyThreshold
      }
    };

    // Create temporary file
    const timestamp = Date.now();
    const extension = language === 'python' ? '.py' : '.java';
    const tempFilename = `temp_${timestamp}${extension}`;
    const tempFilePath = path.join(__dirname, 'uploads', tempFilename);
    
    // Write code to temporary file
    fs.writeFileSync(tempFilePath, code);
    
    // Analyze the code
    const detector = new Detector(config);
    const result = await detector.analyze(tempFilePath);
    
    // Clean up temporary file
    fs.unlinkSync(tempFilePath);
    
    // Add original filename to result
    result.originalFilename = filename || `temp${extension}`;
    
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Code Smell Detector Web Interface running at http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${uploadsDir}`);
  console.log('💡 Supported file types: .py, .java');
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

module.exports = app;