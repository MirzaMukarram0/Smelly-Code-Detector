# Code Smell Detection Application

## Overview

This application detects common **code smells** in **Python** and **Java** source files using static analysis and AST parsing. It identifies six classic software engineering smells and generates detailed reports via a **CLI** or **web interface**.

## Features

✅ **Six Code Smell Detectors:**
1. **Long Method** - Detects methods exceeding a line limit
2. **God Class (Blob)** - Detects classes with too many methods/fields  
3. **Duplicated Code** - Finds near-identical code blocks
4. **Large Parameter List** - Detects functions with excessive arguments
5. **Magic Numbers** - Detects hardcoded numeric literals
6. **Feature Envy** - Detects methods that access more attributes of another class than their own

✅ **Multi-language Support:** Python (.py) and Java (.java) files  
✅ **Configurable Thresholds:** Runtime configuration via config file or CLI  
✅ **Multiple Output Formats:** JSON and Markdown reports  
✅ **Comprehensive Testing:** Unit tests for all detection logic  
✅ **CLI Interface:** Command-line tool with flexible options

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd code-smell-detector

# Install dependencies
npm install

# Make CLI executable (optional)
npm link
```

## Quick Start

### Basic Usage

```bash
# Analyze a single file
node src/index.js --file sample.py

# Analyze with custom output format
node src/index.js --file Example.java --output markdown

# Analyze only specific smells
node src/index.js --file mycode.py --only LongMethod,MagicNumbers

# Exclude certain smells
node src/index.js --file test.py --exclude DuplicatedCode

# Save report to file
node src/index.js --file sample.py --report analysis-report.json
```

### Directory Analysis

```bash
# Analyze all Python and Java files in a directory
node src/index.js --directory ./src --report directory-report.json
```

## Configuration

### Config File (config.yaml)

```yaml
smells:
  LongMethod: true
  GodClass: true
  DuplicatedCode: true
  LargeParameterList: true
  MagicNumbers: true
  FeatureEnvy: true

thresholds:
  LongMethod: 40
  LargeParameterList: 5
  GodClassMethods: 10
  GodClassFields: 15
  DuplicatedCodeSimilarity: 0.8
  FeatureEnvyThreshold: 3

output:
  format: "json"
  includeLineNumbers: true
  verboseMode: false
```

### CLI Options

```bash
Options:
  -f, --file <file>        file to analyze
  -d, --directory <dir>    directory to analyze recursively
  -c, --config <config>    configuration file path (default: "config.yaml")
  -o, --output <format>    output format (json|markdown) (default: "json")
  --only <smells>          comma-separated list of smells to detect only
  --exclude <smells>       comma-separated list of smells to exclude
  -v, --verbose            verbose output
  --report <file>          save report to file
  -h, --help               display help for command
```

## Detection Logic

### 1. Long Method
- **Threshold:** > 40 lines (configurable)
- **Detection:** Counts non-empty, non-comment lines in functions/methods
- **Example:** Functions exceeding the line limit

### 2. God Class (Blob)
- **Method Threshold:** > 10 methods (configurable)
- **Field Threshold:** > 15 fields (configurable)  
- **Detection:** Counts public/private methods and class fields
- **Example:** Classes with too many responsibilities

### 3. Duplicated Code
- **Similarity Threshold:** ≥ 80% (configurable)
- **Detection:** Compares normalized function content using Levenshtein distance
- **Example:** Functions or code blocks with high similarity

### 4. Large Parameter List
- **Threshold:** > 5 parameters (configurable)
- **Detection:** Counts function/method parameters
- **Example:** Functions with excessive argument lists

### 5. Magic Numbers
- **Detection:** Identifies hardcoded numeric literals
- **Exclusions:** Common numbers (0, 1, -1, 2, 10, 100, 1000), dates, times, versions, array indices, test values
- **Example:** Unexplained numeric constants in code

### 6. Feature Envy
- **Threshold:** ≥ 3 external references (configurable)
- **Detection:** Methods accessing more features of other classes than their own
- **Example:** Methods that should belong to a different class

## Output Examples

### JSON Report
```json
{
  "file": "Calculator.java",
  "language": "Java",
  "activeSmells": ["LongMethod", "MagicNumbers"],
  "detected": [
    {
      "type": "LongMethod",
      "lines": "45-96",
      "description": "Method 'calculateAll()' exceeds 40 lines (52 lines).",
      "severity": "medium",
      "methodName": "calculateAll",
      "actualLines": 52,
      "threshold": 40
    },
    {
      "type": "MagicNumbers", 
      "lines": "72",
      "description": "Magic numbers detected: 0.05, 100.",
      "severity": "low",
      "magicNumbers": ["0.05", "100"]
    }
  ],
  "summary": {
    "totalSmells": 2,
    "uniqueSmellTypes": 2,
    "linesAnalyzed": 120
  }
}
```

### Markdown Report
```markdown
# Code Smell Report: Calculator.java

**Active Smells:** LongMethod, MagicNumbers

- **Long Method** — Lines 45–96  
  Method 'calculateAll()' exceeds 40 lines (52 lines).

- **Magic Numbers** — Lines 72  
  Magic numbers detected: 0.05, 100.
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- detector.test.js
```

### Test Coverage
- ✅ Core detector functionality
- ✅ All six smell analyzers
- ✅ File parsing (Python & Java)
- ✅ Configuration handling
- ✅ CLI option processing
- ✅ Error handling

## Project Structure

```
code-smell-detector/
├── src/
│   ├── index.js              # CLI entry point
│   ├── detector.js           # Core detection engine
│   └── analyzers/
│       ├── longMethod.js     # Long method detection
│       ├── godClass.js       # God class detection
│       ├── duplicatedCode.js # Code duplication detection
│       ├── largeParameterList.js # Parameter list detection
│       ├── magicNumbers.js   # Magic number detection
│       └── featureEnvy.js    # Feature envy detection
├── tests/
│   ├── detector.test.js      # Core detector tests
│   ├── longMethod.test.js    # Long method analyzer tests
│   ├── godClass.test.js      # God class analyzer tests
│   └── magicNumbers.test.js  # Magic numbers analyzer tests
├── docs/
│   ├── README.md             # This file
│   └── smells.md             # Detailed smell documentation
├── config.yaml               # Default configuration
└── package.json              # Node.js dependencies
```

## Development

### Adding New Analyzers

1. Create analyzer in `src/analyzers/newAnalyzer.js`
2. Implement `analyze(parseResult, content, filePath)` method
3. Register in `detector.js` constructor
4. Add configuration options to `config.yaml`
5. Write unit tests in `tests/newAnalyzer.test.js`

### Extending Language Support

1. Update `parseFile()` method in `detector.js`
2. Add language-specific parsing logic
3. Update file extension validation
4. Test with sample files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.