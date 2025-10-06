class GodClassAnalyzer {
  constructor(thresholds) {
    this.methodThreshold = thresholds.GodClassMethods || 10;
    this.fieldThreshold = thresholds.GodClassFields || 15;
  }

  async analyze(parseResult, content, filePath) {
    const smells = [];
    
    for (const cls of parseResult.classes) {
      const methodCount = cls.methods.length;
      const fieldCount = cls.fields.length;
      
      let violations = [];
      
      if (methodCount > this.methodThreshold) {
        violations.push(`${methodCount} methods (threshold: ${this.methodThreshold})`);
      }
      
      if (fieldCount > this.fieldThreshold) {
        violations.push(`${fieldCount} fields (threshold: ${this.fieldThreshold})`);
      }
      
      if (violations.length > 0) {
        smells.push({
          type: 'GodClass',
          lines: `${cls.startLine}-${cls.endLine}`,
          description: `Class '${cls.name}' has too many responsibilities: ${violations.join(', ')}.`,
          details: `Class complexity: ${methodCount} methods, ${fieldCount} fields`,
          severity: this.calculateSeverity(methodCount, fieldCount),
          className: cls.name,
          methodCount: methodCount,
          fieldCount: fieldCount,
          methodThreshold: this.methodThreshold,
          fieldThreshold: this.fieldThreshold
        });
      }
    }
    
    return smells;
  }

  calculateSeverity(methodCount, fieldCount) {
    const methodRatio = methodCount / this.methodThreshold;
    const fieldRatio = fieldCount / this.fieldThreshold;
    const maxRatio = Math.max(methodRatio, fieldRatio);
    
    if (maxRatio >= 2) {
      return 'high';
    } else if (maxRatio > 1.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

module.exports = GodClassAnalyzer;