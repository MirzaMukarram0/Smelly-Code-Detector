class LongMethodAnalyzer {
  constructor(thresholds) {
    this.threshold = thresholds.LongMethod || 40;
  }

  async analyze(parseResult, content, filePath) {
    const smells = [];
    
    for (const func of parseResult.functions) {
      if (func.lineCount > this.threshold) {
        smells.push({
          type: 'LongMethod',
          lines: `${func.startLine}-${func.endLine}`,
          description: `Method '${func.name}()' exceeds ${this.threshold} lines (${func.lineCount} lines).`,
          details: `Function has ${func.lineCount} lines, threshold is ${this.threshold}`,
          severity: this.calculateSeverity(func.lineCount),
          methodName: func.name,
          actualLines: func.lineCount,
          threshold: this.threshold
        });
      }
    }
    
    return smells;
  }

  calculateSeverity(lineCount) {
    if (lineCount > this.threshold * 2) {
      return 'high';
    } else if (lineCount > this.threshold * 1.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

module.exports = LongMethodAnalyzer;