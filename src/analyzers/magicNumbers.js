class MagicNumbersAnalyzer {
  constructor(thresholds) {
    this.allowedNumbers = new Set([0, 1, -1, 2, 10, 100, 1000]); // Common acceptable numbers
    this.allowedDecimals = new Set(['0.0', '1.0', '-1.0', '2.0']); // Common acceptable decimals
  }

  async analyze(parseResult, content, filePath) {
    const smells = [];
    const lines = parseResult.lines;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Skip comments and strings
      if (this.isCommentOrString(line)) {
        continue;
      }
      
      const magicNumbers = this.findMagicNumbers(line);
      
      if (magicNumbers.length > 0) {
        smells.push({
          type: 'MagicNumbers',
          lines: `${lineNumber}`,
          description: `Magic numbers detected: ${magicNumbers.join(', ')}.`,
          details: `Consider defining these as named constants`,
          severity: this.calculateSeverity(magicNumbers.length),
          magicNumbers: magicNumbers,
          lineContent: line.trim()
        });
      }
    }
    
    return smells;
  }

  findMagicNumbers(line) {
    const magicNumbers = [];
    
    // Regular expression to find numeric literals
    // Matches integers and floating point numbers
    const numberRegex = /\b(-?\d+\.?\d*)\b/g;
    let match;
    
    while ((match = numberRegex.exec(line)) !== null) {
      const numberStr = match[1];
      const number = parseFloat(numberStr);
      
      // Skip if it's an allowed number
      if (this.allowedNumbers.has(number) || this.allowedDecimals.has(numberStr)) {
        continue;
      }
      
      // Skip if it's part of a date, time, or version number
      if (this.isDateTimeOrVersion(line, match.index)) {
        continue;
      }
      
      // Skip if it's an array index or similar
      if (this.isArrayIndexOrSimilar(line, match.index)) {
        continue;
      }
      
      // Skip if it's in a test assertion or similar context
      if (this.isTestContext(line)) {
        continue;
      }
      
      magicNumbers.push(numberStr);
    }
    
    return [...new Set(magicNumbers)]; // Remove duplicates
  }

  isCommentOrString(line) {
    const trimmed = line.trim();
    
    // Python comments
    if (trimmed.startsWith('#')) return true;
    
    // Java/C-style comments
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return true;
    
    // Check for inline comments but allow detection in code before comments
    const pythonCommentIndex = line.indexOf('#');
    const javaCommentIndex = line.indexOf('//');
    
    // If line has code before comment, only check the code part
    let codeOnly = line;
    if (pythonCommentIndex > 0) {
      codeOnly = line.substring(0, pythonCommentIndex);
    } else if (javaCommentIndex > 0) {
      codeOnly = line.substring(0, javaCommentIndex);
    } else if (pythonCommentIndex === 0 || javaCommentIndex === 0) {
      return true; // Line starts with comment
    }
    
    // Check if the remaining code is mostly within strings
    const stringRegex = /(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g;
    const strings = codeOnly.match(stringRegex) || [];
    const stringLength = strings.join('').length;
    const totalLength = codeOnly.length;
    
    return stringLength > totalLength * 0.7;
  }

  isDateTimeOrVersion(line, index) {
    // Check context around the number for date/time/version patterns
    const context = line.substring(Math.max(0, index - 10), index + 20);
    
    const patterns = [
      /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/, // Date patterns
      /\d{1,2}:\d{2}(:\d{2})?/, // Time patterns
      /v?\d+\.\d+(\.\d+)?/, // Version patterns
      /\d+ms|\d+s|\d+min|\d+h/, // Duration patterns
    ];
    
    return patterns.some(pattern => pattern.test(context));
  }

  isArrayIndexOrSimilar(line, index) {
    // Check if the number is used as an array index or similar
    const before = line.substring(Math.max(0, index - 5), index);
    const after = line.substring(index, Math.min(line.length, index + 10));
    
    // Array/list indexing patterns
    if (before.includes('[') || after.includes(']')) return true;
    
    // Loop counter patterns
    if (/\b(for|while)\s*\(/.test(line) && /[<>=]/.test(after)) return true;
    
    // Range function calls
    if (before.includes('range(') || before.includes('range ')) return true;
    
    return false;
  }

  isTestContext(line) {
    const testKeywords = [
      'assert', 'expect', 'test', 'should', 'assertEquals', 
      'assertEqual', 'assertTrue', 'assertFalse', 'mock'
    ];
    
    const lowerLine = line.toLowerCase();
    return testKeywords.some(keyword => lowerLine.includes(keyword));
  }

  calculateSeverity(magicNumberCount) {
    if (magicNumberCount > 5) {
      return 'high';
    } else if (magicNumberCount > 2) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

module.exports = MagicNumbersAnalyzer;