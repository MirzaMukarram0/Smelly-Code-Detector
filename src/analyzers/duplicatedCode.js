class DuplicatedCodeAnalyzer {
  constructor(thresholds) {
    this.similarityThreshold = thresholds.DuplicatedCodeSimilarity || 0.8;
    this.minLineCount = 5; // Minimum lines to consider for duplication
  }

  async analyze(parseResult, content, filePath) {
    const smells = [];
    const functions = parseResult.functions;
    
    // Compare all function pairs
    for (let i = 0; i < functions.length; i++) {
      for (let j = i + 1; j < functions.length; j++) {
        const func1 = functions[i];
        const func2 = functions[j];
        
        if (func1.lineCount >= this.minLineCount && func2.lineCount >= this.minLineCount) {
          const similarity = this.calculateSimilarity(func1.content, func2.content);
          
          if (similarity >= this.similarityThreshold) {
            smells.push({
              type: 'DuplicatedCode',
              lines: `${func1.startLine}-${func1.endLine}, ${func2.startLine}-${func2.endLine}`,
              description: `Functions '${func1.name}()' and '${func2.name}()' have ${Math.round(similarity * 100)}% similarity.`,
              details: `Code duplication detected between two functions`,
              severity: this.calculateSeverity(similarity),
              function1: func1.name,
              function2: func2.name,
              similarity: similarity,
              threshold: this.similarityThreshold
            });
          }
        }
      }
    }
    
    // Also check for duplicated code blocks within the same function
    const blockDuplicates = this.findDuplicatedBlocks(parseResult.lines);
    smells.push(...blockDuplicates);
    
    return smells;
  }

  calculateSimilarity(content1, content2) {
    // Normalize content for comparison
    const normalized1 = this.normalizeContent(content1);
    const normalized2 = this.normalizeContent(content2);
    
    // Use Levenshtein distance ratio
    const distance = this.levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);
    
    if (maxLength === 0) return 1;
    
    return 1 - (distance / maxLength);
  }

  normalizeContent(content) {
    return content
      .toLowerCase()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/#.*$/gm, '') // Remove Python comments
      .trim();
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  findDuplicatedBlocks(lines) {
    const smells = [];
    const blockSize = this.minLineCount;
    
    // Create sliding windows of code blocks
    for (let i = 0; i <= lines.length - blockSize; i++) {
      const block1 = lines.slice(i, i + blockSize);
      const normalizedBlock1 = this.normalizeContent(block1.join('\n'));
      
      // Skip empty or comment-only blocks
      if (normalizedBlock1.trim().length < 10) continue;
      
      for (let j = i + blockSize; j <= lines.length - blockSize; j++) {
        const block2 = lines.slice(j, j + blockSize);
        const normalizedBlock2 = this.normalizeContent(block2.join('\n'));
        
        if (normalizedBlock2.trim().length < 10) continue;
        
        const similarity = this.calculateSimilarity(normalizedBlock1, normalizedBlock2);
        
        if (similarity >= this.similarityThreshold) {
          smells.push({
            type: 'DuplicatedCode',
            lines: `${i + 1}-${i + blockSize}, ${j + 1}-${j + blockSize}`,
            description: `Code blocks have ${Math.round(similarity * 100)}% similarity.`,
            details: `Duplicated code blocks detected`,
            severity: this.calculateSeverity(similarity),
            similarity: similarity,
            blockSize: blockSize,
            threshold: this.similarityThreshold
          });
          
          // Skip overlapping blocks
          j += blockSize - 1;
        }
      }
    }
    
    return smells;
  }

  calculateSeverity(similarity) {
    if (similarity > 0.95) {
      return 'high';
    } else if (similarity > 0.9) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

module.exports = DuplicatedCodeAnalyzer;