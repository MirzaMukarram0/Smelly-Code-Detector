const fs = require('fs');
const path = require('path');

// Import analyzers
const LongMethodAnalyzer = require('./analyzers/longMethod');
const GodClassAnalyzer = require('./analyzers/godClass');
const DuplicatedCodeAnalyzer = require('./analyzers/duplicatedCode');
const LargeParameterListAnalyzer = require('./analyzers/largeParameterList');
const MagicNumbersAnalyzer = require('./analyzers/magicNumbers');
const FeatureEnvyAnalyzer = require('./analyzers/featureEnvy');

class CodeSmellDetector {
  constructor(config) {
    this.config = config;
    this.analyzers = this.initializeAnalyzers();
  }

  initializeAnalyzers() {
    const analyzers = {};
    
    if (this.config.smells.LongMethod) {
      analyzers.LongMethod = new LongMethodAnalyzer(this.config.thresholds);
    }
    
    if (this.config.smells.GodClass) {
      analyzers.GodClass = new GodClassAnalyzer(this.config.thresholds);
    }
    
    if (this.config.smells.DuplicatedCode) {
      analyzers.DuplicatedCode = new DuplicatedCodeAnalyzer(this.config.thresholds);
    }
    
    if (this.config.smells.LargeParameterList) {
      analyzers.LargeParameterList = new LargeParameterListAnalyzer(this.config.thresholds);
    }
    
    if (this.config.smells.MagicNumbers) {
      analyzers.MagicNumbers = new MagicNumbersAnalyzer(this.config.thresholds);
    }
    
    if (this.config.smells.FeatureEnvy) {
      analyzers.FeatureEnvy = new FeatureEnvyAnalyzer(this.config.thresholds);
    }

    return analyzers;
  }

  async analyze(filePath) {
    try {
      // Read file content
      const content = fs.readFileSync(filePath, 'utf8');
      const fileExtension = path.extname(filePath);
      
      // Validate file type
      if (!['.py', '.java'].includes(fileExtension)) {
        throw new Error(`Unsupported file type: ${fileExtension}. Only .py and .java files are supported.`);
      }

      // Parse file into AST-like structure
      const parseResult = this.parseFile(content, fileExtension);
      
      // Run all active analyzers
      const detectedSmells = [];
      const activeSmells = [];

      for (const [smellType, analyzer] of Object.entries(this.analyzers)) {
        try {
          const smells = await analyzer.analyze(parseResult, content, filePath);
          if (smells.length > 0) {
            activeSmells.push(smellType);
            detectedSmells.push(...smells);
          }
        } catch (error) {
          console.warn(`Warning: ${smellType} analyzer failed:`, error.message);
        }
      }

      return {
        file: path.basename(filePath),
        filePath: filePath,
        language: fileExtension === '.py' ? 'Python' : 'Java',
        activeSmells: activeSmells,
        detected: detectedSmells,
        summary: {
          totalSmells: detectedSmells.length,
          uniqueSmellTypes: activeSmells.length,
          linesAnalyzed: content.split('\n').length
        }
      };

    } catch (error) {
      throw new Error(`Failed to analyze ${filePath}: ${error.message}`);
    }
  }

  parseFile(content, fileExtension) {
    const lines = content.split('\n');
    
    // Create a simple parsed representation
    const parsed = {
      content: content,
      lines: lines,
      language: fileExtension === '.py' ? 'python' : 'java',
      functions: this.extractFunctions(content, fileExtension),
      classes: this.extractClasses(content, fileExtension),
      imports: this.extractImports(content, fileExtension),
      variables: this.extractVariables(content, fileExtension)
    };

    return parsed;
  }

  extractFunctions(content, fileExtension) {
    const functions = [];
    const lines = content.split('\n');
    
    if (fileExtension === '.py') {
      // Python function extraction - handle multi-line signatures
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check for function definition start
        if (line.startsWith('def ')) {
          const functionNameMatch = line.match(/^def\s+(\w+)\s*\(/);
          
          if (functionNameMatch) {
            const functionName = functionNameMatch[1];
            
            // Find the end of the function signature (looking for the closing parenthesis and colon)
            let signatureEnd = i;
            let fullSignature = line;
            
            // If the line doesn't end with '):' or ') -> Type:' then it's a multi-line signature  
            if (!line.match(/\)\s*(?:->\s*\w+\s*)?:\s*$/)) {
              for (let j = i + 1; j < lines.length; j++) {
                const nextLine = lines[j].trim();
                fullSignature += ' ' + nextLine;
                if (nextLine.match(/\)\s*(?:->\s*\w+\s*)?:\s*$/)) {
                  signatureEnd = j;
                  break;
                }
                // Safety check - if we see a line that doesn't look like a continuation, break
                if (nextLine.startsWith('"""') || nextLine.startsWith('#') || 
                    (nextLine === '' && j > i + 3)) {  // Allow few empty lines in signature
                  break;
                }
              }
            }
            
            // Extract parameters from the full signature
            const paramMatch = fullSignature.match(/def\s+\w+\s*\((.*?)\)\s*(?:->\s*\w+\s*)?:/);
            const parameters = paramMatch ? this.parseParameters(paramMatch[1], 'python') : [];
            
            const startLine = i + 1;
            const endLine = this.findFunctionEnd(lines, i, 'python');
            
            functions.push({
              name: functionName,
              parameters: parameters,
              startLine: startLine,
              endLine: endLine,
              lineCount: endLine - startLine + 1,
              content: lines.slice(i, endLine).join('\n')
            });
          }
        }
      }
    } else if (fileExtension === '.java') {
      // Java method extraction
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const methodMatch = line.match(/(public|private|protected)?\s*(static)?\s*\w+\s+(\w+)\s*\((.*?)\)\s*\{?/);
        
        if (methodMatch && !line.includes('class ')) {
          const methodName = methodMatch[3];
          const parameters = this.parseParameters(methodMatch[4], 'java');
          const startLine = i + 1;
          const endLine = this.findFunctionEnd(lines, i, 'java');
          
          functions.push({
            name: methodName,
            parameters: parameters,
            startLine: startLine,
            endLine: endLine,
            lineCount: endLine - startLine + 1,
            content: lines.slice(i, endLine).join('\n')
          });
        }
      }
    }
    
    return functions;
  }

  extractClasses(content, fileExtension) {
    const classes = [];
    const lines = content.split('\n');
    
    if (fileExtension === '.py') {
      // Python class extraction
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const classMatch = line.match(/^class\s+(\w+)(?:\(.*?\))?:/);
        
        if (classMatch) {
          const className = classMatch[1];
          const startLine = i + 1;
          const endLine = this.findClassEnd(lines, i, 'python');
          const classContent = lines.slice(i, endLine).join('\n');
          
          classes.push({
            name: className,
            startLine: startLine,
            endLine: endLine,
            lineCount: endLine - startLine + 1,
            content: classContent,
            methods: this.extractMethodsFromClass(classContent, 'python'),
            fields: this.extractFieldsFromClass(classContent, 'python')
          });
        }
      }
    } else if (fileExtension === '.java') {
      // Java class extraction
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const classMatch = line.match(/(public|private|protected)?\s*class\s+(\w+)/);
        
        if (classMatch) {
          const className = classMatch[2];
          const startLine = i + 1;
          const endLine = this.findClassEnd(lines, i, 'java');
          const classContent = lines.slice(i, endLine).join('\n');
          
          classes.push({
            name: className,
            startLine: startLine,
            endLine: endLine,
            lineCount: endLine - startLine + 1,
            content: classContent,
            methods: this.extractMethodsFromClass(classContent, 'java'),
            fields: this.extractFieldsFromClass(classContent, 'java')
          });
        }
      }
    }
    
    return classes;
  }

  extractImports(content, fileExtension) {
    const imports = [];
    const lines = content.split('\n');
    
    if (fileExtension === '.py') {
      for (const line of lines) {
        const importMatch = line.trim().match(/^(import|from)\s+(.+)/);
        if (importMatch) {
          imports.push(importMatch[2].split(',').map(imp => imp.trim()));
        }
      }
    } else if (fileExtension === '.java') {
      for (const line of lines) {
        const importMatch = line.trim().match(/^import\s+(.+);/);
        if (importMatch) {
          imports.push(importMatch[1]);
        }
      }
    }
    
    return imports.flat();
  }

  extractVariables(content, fileExtension) {
    const variables = [];
    const lines = content.split('\n');
    
    // Simple variable extraction (can be enhanced)
    if (fileExtension === '.py') {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const varMatch = line.match(/^(\w+)\s*=/);
        if (varMatch && !line.includes('def ') && !line.includes('class ')) {
          variables.push({
            name: varMatch[1],
            line: i + 1
          });
        }
      }
    } else if (fileExtension === '.java') {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const varMatch = line.match(/^\w+\s+(\w+)\s*[=;]/);
        if (varMatch) {
          variables.push({
            name: varMatch[1],
            line: i + 1
          });
        }
      }
    }
    
    return variables;
  }

  parseParameters(paramString, language) {
    if (!paramString.trim()) return [];
    
    return paramString.split(',').map(param => param.trim()).filter(p => p.length > 0);
  }

  findFunctionEnd(lines, startIndex, language) {
    if (language === 'python') {
      const baseIndent = this.getIndentation(lines[startIndex]);
      for (let i = startIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') continue;
        
        const currentIndent = this.getIndentation(line);
        if (currentIndent <= baseIndent && line.trim() !== '') {
          return i;
        }
      }
      return lines.length;
    } else if (language === 'java') {
      let braceCount = 0;
      let foundFirstBrace = false;
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        for (const char of line) {
          if (char === '{') {
            braceCount++;
            foundFirstBrace = true;
          } else if (char === '}') {
            braceCount--;
            if (foundFirstBrace && braceCount === 0) {
              return i + 1;
            }
          }
        }
      }
      return lines.length;
    }
    
    return lines.length;
  }

  findClassEnd(lines, startIndex, language) {
    return this.findFunctionEnd(lines, startIndex, language);
  }

  extractMethodsFromClass(classContent, language) {
    // Simplified method extraction from class content
    const methods = [];
    const lines = classContent.split('\n');
    
    if (language === 'python') {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('def ')) {
          const methodMatch = line.match(/def\s+(\w+)/);
          if (methodMatch) {
            methods.push(methodMatch[1]);
          }
        }
      }
    } else if (language === 'java') {
      for (const line of lines) {
        const methodMatch = line.trim().match(/(public|private|protected)?\s*(static)?\s*\w+\s+(\w+)\s*\(/);
        if (methodMatch && !line.includes('class ')) {
          methods.push(methodMatch[3]);
        }
      }
    }
    
    return methods;
  }

  extractFieldsFromClass(classContent, language) {
    const fields = [];
    const lines = classContent.split('\n');
    
    if (language === 'python') {
      for (const line of lines) {
        const fieldMatch = line.trim().match(/self\.(\w+)\s*=/);
        if (fieldMatch) {
          fields.push(fieldMatch[1]);
        }
      }
    } else if (language === 'java') {
      for (const line of lines) {
        const fieldMatch = line.trim().match(/(private|public|protected)?\s*\w+\s+(\w+)\s*[=;]/);
        if (fieldMatch && !line.includes('(') && !line.includes('class ')) {
          fields.push(fieldMatch[2]);
        }
      }
    }
    
    return [...new Set(fields)]; // Remove duplicates
  }

  getIndentation(line) {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }
}

module.exports = CodeSmellDetector;