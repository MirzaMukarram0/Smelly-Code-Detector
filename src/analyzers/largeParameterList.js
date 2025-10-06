class LargeParameterListAnalyzer {
  constructor(thresholds) {
    this.threshold = thresholds.LargeParameterList || 5;
  }

  async analyze(parseResult, content, filePath) {
    const smells = [];
    
    for (const func of parseResult.functions) {
      const paramCount = func.parameters.length;
      
      if (paramCount > this.threshold) {
        smells.push({
          type: 'LargeParameterList',
          lines: `${func.startLine}`,
          description: `Function '${func.name}()' has ${paramCount} parameters (threshold: ${this.threshold}).`,
          details: `Parameters: ${func.parameters.join(', ')}`,
          severity: this.calculateSeverity(paramCount),
          functionName: func.name,
          parameterCount: paramCount,
          parameters: func.parameters,
          threshold: this.threshold
        });
      }
    }
    
    return smells;
  }

  calculateSeverity(paramCount) {
    if (paramCount > this.threshold * 2) {
      return 'high';
    } else if (paramCount > this.threshold * 1.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

module.exports = LargeParameterListAnalyzer;