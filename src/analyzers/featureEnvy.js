class FeatureEnvyAnalyzer {
  constructor(thresholds) {
    this.threshold = thresholds.FeatureEnvyThreshold || 3;
  }

  async analyze(parseResult, content, filePath) {
    const smells = [];
    
    // Analyze methods within classes
    for (const cls of parseResult.classes) {
      const classMethods = this.extractMethodsFromClass(cls, parseResult);
      
      for (const method of classMethods) {
        const externalReferences = this.findExternalReferences(method, cls, parseResult);
        const ownReferences = this.findOwnClassReferences(method, cls);
        
        // Check if method uses more external class features than its own
        for (const [externalClass, refCount] of Object.entries(externalReferences)) {
          if (refCount >= this.threshold && refCount > ownReferences) {
            smells.push({
              type: 'FeatureEnvy',
              lines: `${method.startLine}-${method.endLine}`,
              description: `Method '${method.name}()' in class '${cls.name}' uses ${refCount} features from '${externalClass}' but only ${ownReferences} from its own class.`,
              details: `Method shows feature envy towards external class`,
              severity: this.calculateSeverity(refCount, ownReferences),
              methodName: method.name,
              className: cls.name,
              enviedClass: externalClass,
              externalReferences: refCount,
              ownReferences: ownReferences,
              threshold: this.threshold
            });
          }
        }
      }
    }
    
    return smells;
  }

  extractMethodsFromClass(cls, parseResult) {
    const methods = [];
    
    // Find functions that belong to this class
    for (const func of parseResult.functions) {
      if (func.startLine >= cls.startLine && func.endLine <= cls.endLine) {
        methods.push(func);
      }
    }
    
    return methods;
  }

  findExternalReferences(method, ownClass, parseResult) {
    const externalRefs = {};
    const lines = method.content.split('\n');
    
    for (const line of lines) {
      // Find object method calls and property accesses
      const patterns = [
        /(\w+)\.(\w+)\s*\(/g, // Method calls: object.method()
        /(\w+)\.(\w+)/g, // Property access: object.property
      ];
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const objectName = match[1];
          const memberName = match[2];
          
          // Skip self references in Python or this references in Java
          if (objectName === 'self' || objectName === 'this') {
            continue;
          }
          
          // Try to identify the class of the object
          const objectClass = this.identifyObjectClass(objectName, ownClass, parseResult);
          
          if (objectClass && objectClass !== ownClass.name) {
            if (!externalRefs[objectClass]) {
              externalRefs[objectClass] = 0;
            }
            externalRefs[objectClass]++;
          }
        }
      }
    }
    
    return externalRefs;
  }

  findOwnClassReferences(method, ownClass) {
    let ownRefs = 0;
    const lines = method.content.split('\n');
    
    for (const line of lines) {
      // Count self/this references
      const selfRefs = (line.match(/\bself\./g) || []).length;
      const thisRefs = (line.match(/\bthis\./g) || []).length;
      
      ownRefs += selfRefs + thisRefs;
      
      // Count direct references to own class fields/methods
      for (const field of ownClass.fields) {
        const fieldRefs = (line.match(new RegExp(`\\b${field}\\b`, 'g')) || []).length;
        ownRefs += fieldRefs;
      }
      
      for (const methodName of ownClass.methods) {
        if (methodName !== method.name) {
          const methodRefs = (line.match(new RegExp(`\\b${methodName}\\s*\\(`, 'g')) || []).length;
          ownRefs += methodRefs;
        }
      }
    }
    
    return ownRefs;
  }

  identifyObjectClass(objectName, ownClass, parseResult) {
    // Simple heuristic to identify object class
    // This could be enhanced with more sophisticated type analysis
    
    // Check if it's a field of the current class
    if (ownClass.fields.includes(objectName)) {
      // Try to infer type from field declaration or usage
      const classContent = ownClass.content;
      const patterns = [
        new RegExp(`${objectName}\\s*=\\s*new\\s+(\\w+)`, 'i'), // Java: field = new ClassName()
        new RegExp(`${objectName}\\s*=\\s*(\\w+)\\(`, 'i'), // Python: field = ClassName()
        new RegExp(`(\\w+)\\s+${objectName}\\s*[=;]`, 'i'), // Java: ClassName field = ...
      ];
      
      for (const pattern of patterns) {
        const match = classContent.match(pattern);
        if (match) {
          return match[1];
        }
      }
    }
    
    // Check if it's a parameter with type annotation
    const paramPattern = new RegExp(`${objectName}\\s*:\\s*(\\w+)`, 'i');
    const paramMatch = method.content.match(paramPattern);
    if (paramMatch) {
      return paramMatch[1];
    }
    
    // Check if it's instantiated in the method
    const newPattern = new RegExp(`${objectName}\\s*=\\s*(?:new\\s+)?(\\w+)\\s*\\(`, 'i');
    const newMatch = method.content.match(newPattern);
    if (newMatch) {
      return newMatch[1];
    }
    
    // Default: use the object name as class name (common convention)
    return objectName.charAt(0).toUpperCase() + objectName.slice(1);
  }

  calculateSeverity(externalRefs, ownRefs) {
    const ratio = externalRefs / Math.max(ownRefs, 1);
    
    if (ratio > 5) {
      return 'high';
    } else if (ratio > 2) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

module.exports = FeatureEnvyAnalyzer;