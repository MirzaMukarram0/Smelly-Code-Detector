#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const CodeSmellDetector = require('./detector');

const program = new Command();

program
  .name('code-smell-detector')
  .description('Detects common code smells in Python and Java source files')
  .version('1.0.0');

program
  .option('-f, --file <file>', 'file to analyze')
  .option('-d, --directory <dir>', 'directory to analyze recursively')
  .option('-c, --config <config>', 'configuration file path', 'config.yaml')
  .option('-o, --output <format>', 'output format (json|markdown)', 'json')
  .option('--only <smells>', 'comma-separated list of smells to detect only')
  .option('--exclude <smells>', 'comma-separated list of smells to exclude')
  .option('-v, --verbose', 'verbose output')
  .option('--report <file>', 'save report to file');

async function loadConfig(configPath) {
  try {
    const configFile = fs.readFileSync(configPath, 'utf8');
    return yaml.load(configFile);
  } catch (error) {
    console.warn(`Warning: Could not load config file ${configPath}. Using defaults.`);
    return getDefaultConfig();
  }
}

function getDefaultConfig() {
  return {
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
    },
    output: {
      format: 'json',
      includeLineNumbers: true,
      verboseMode: false
    }
  };
}

function applyCliOverrides(config, options) {
  // Apply CLI overrides to config
  if (options.only) {
    const onlySmells = options.only.split(',').map(s => s.trim());
    Object.keys(config.smells).forEach(smell => {
      config.smells[smell] = onlySmells.includes(smell);
    });
  }

  if (options.exclude) {
    const excludeSmells = options.exclude.split(',').map(s => s.trim());
    excludeSmells.forEach(smell => {
      config.smells[smell] = false;
    });
  }

  if (options.output) {
    config.output.format = options.output;
  }

  if (options.verbose) {
    config.output.verboseMode = true;
  }

  return config;
}

function formatOutput(results, format, verbose = false) {
  if (format === 'markdown') {
    return formatMarkdownReport(results, verbose);
  }
  return JSON.stringify(results, null, 2);
}

function formatMarkdownReport(results, verbose = false) {
  let report = `# Code Smell Report: ${results.file}\n\n`;
  
  if (results.activeSmells.length === 0) {
    report += '✅ **No code smells detected!**\n';
    return report;
  }

  report += `**Active Smells:** ${results.activeSmells.join(', ')}\n\n`;
  
  results.detected.forEach(smell => {
    report += `- **${smell.type}** — Lines ${smell.lines}\n`;
    report += `  ${smell.description}\n\n`;
    
    if (verbose && smell.details) {
      report += `  *Details:* ${smell.details}\n\n`;
    }
  });

  return report;
}

async function analyzeFile(filePath, config) {
  try {
    const detector = new CodeSmellDetector(config);
    return await detector.analyze(filePath);
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

async function analyzeDirectory(dirPath, config) {
  const results = [];
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    
    if (file.isDirectory()) {
      const subResults = await analyzeDirectory(fullPath, config);
      results.push(...subResults);
    } else if (file.name.endsWith('.py') || file.name.endsWith('.java')) {
      const result = await analyzeFile(fullPath, config);
      if (result) {
        results.push(result);
      }
    }
  }
  
  return results;
}

async function main() {
  program.parse();
  const options = program.opts();

  if (!options.file && !options.directory) {
    console.error('Error: Please specify a file (-f) or directory (-d) to analyze');
    process.exit(1);
  }

  try {
    // Load configuration
    const config = await loadConfig(options.config);
    const finalConfig = applyCliOverrides(config, options);

    let results;

    if (options.file) {
      // Analyze single file
      if (!fs.existsSync(options.file)) {
        console.error(`Error: File ${options.file} does not exist`);
        process.exit(1);
      }

      results = await analyzeFile(options.file, finalConfig);
      if (!results) {
        process.exit(1);
      }

      // Format and output results
      const output = formatOutput(results, finalConfig.output.format, finalConfig.output.verboseMode);
      
      if (options.report) {
        fs.writeFileSync(options.report, output);
        console.log(`Report saved to ${options.report}`);
      } else {
        console.log(output);
      }
    } else if (options.directory) {
      // Analyze directory
      if (!fs.existsSync(options.directory)) {
        console.error(`Error: Directory ${options.directory} does not exist`);
        process.exit(1);
      }

      results = await analyzeDirectory(options.directory, finalConfig);
      
      // Create summary report
      const summary = {
        directory: options.directory,
        totalFiles: results.length,
        filesWithSmells: results.filter(r => r.detected.length > 0).length,
        results: results
      };

      const output = JSON.stringify(summary, null, 2);
      
      if (options.report) {
        fs.writeFileSync(options.report, output);
        console.log(`Report saved to ${options.report}`);
      } else {
        console.log(output);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { loadConfig, formatOutput, analyzeFile };