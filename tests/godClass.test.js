const GodClassAnalyzer = require('../src/analyzers/godClass');

describe('GodClassAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new GodClassAnalyzer({ 
      GodClassMethods: 5, 
      GodClassFields: 8 
    });
  });

  test('should detect class with too many methods', async () => {
    const parseResult = {
      classes: [
        {
          name: 'SimpleClass',
          startLine: 1,
          endLine: 20,
          methods: ['method1', 'method2'],
          fields: ['field1', 'field2']
        },
        {
          name: 'GodClass',
          startLine: 25,
          endLine: 100,
          methods: ['method1', 'method2', 'method3', 'method4', 'method5', 'method6'],
          fields: ['field1', 'field2', 'field3']
        }
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');

    expect(smells).toHaveLength(1);
    expect(smells[0].type).toBe('GodClass');
    expect(smells[0].className).toBe('GodClass');
    expect(smells[0].methodCount).toBe(6);
    expect(smells[0].description).toContain('6 methods');
  });

  test('should detect class with too many fields', async () => {
    const parseResult = {
      classes: [
        {
          name: 'GodClass',
          startLine: 1,
          endLine: 50,
          methods: ['method1', 'method2'],
          fields: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8', 'field9']
        }
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');

    expect(smells).toHaveLength(1);
    expect(smells[0].type).toBe('GodClass');
    expect(smells[0].fieldCount).toBe(9);
    expect(smells[0].description).toContain('9 fields');
  });

  test('should detect class with both too many methods and fields', async () => {
    const parseResult = {
      classes: [
        {
          name: 'SuperGodClass',
          startLine: 1,
          endLine: 100,
          methods: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11'],  // 11 methods
          fields: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12', 'f13', 'f14', 'f15', 'f16']  // 16 fields
        }
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');

    expect(smells).toHaveLength(1);
    expect(smells[0].description).toContain('11 methods');
    expect(smells[0].description).toContain('16 fields');
    expect(smells[0].severity).toBe('high');
  });

  test('should not detect well-structured classes', async () => {
    const parseResult = {
      classes: [
        {
          name: 'WellStructuredClass',
          startLine: 1,
          endLine: 30,
          methods: ['method1', 'method2', 'method3'],
          fields: ['field1', 'field2']
        }
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');
    expect(smells).toHaveLength(0);
  });

  test('should calculate severity correctly', () => {
    // Method ratio: 10/5 = 2, Field ratio: 16/8 = 2, Max = 2
    expect(analyzer.calculateSeverity(10, 16)).toBe('high');
    
    // Method ratio: 8/5 = 1.6, Field ratio: 12/8 = 1.5, Max = 1.6
    expect(analyzer.calculateSeverity(8, 12)).toBe('medium');
    
    // Method ratio: 6/5 = 1.2, Field ratio: 10/8 = 1.25, Max = 1.25
    expect(analyzer.calculateSeverity(6, 10)).toBe('low');
  });

  test('should handle empty class list', async () => {
    const parseResult = { classes: [] };
    const smells = await analyzer.analyze(parseResult, '', '');
    expect(smells).toHaveLength(0);
  });

  test('should include detailed information in smell report', async () => {
    const parseResult = {
      classes: [
        {
          name: 'TestGodClass',
          startLine: 1,
          endLine: 80,
          methods: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
          fields: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9']
        }
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');

    expect(smells[0]).toMatchObject({
      type: 'GodClass',
      lines: '1-80',
      description: expect.stringContaining('TestGodClass'),
      details: expect.stringContaining('6 methods, 9 fields'),
      className: 'TestGodClass',
      methodCount: 6,
      fieldCount: 9,
      methodThreshold: 5,
      fieldThreshold: 8
    });
  });
});