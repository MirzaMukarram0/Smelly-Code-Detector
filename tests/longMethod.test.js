const LongMethodAnalyzer = require('../src/analyzers/longMethod');

describe('LongMethodAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new LongMethodAnalyzer({ LongMethod: 20 });
  });

  test('should detect long methods exceeding threshold', async () => {
    const parseResult = {
      functions: [
        {
          name: 'shortMethod',
          startLine: 1,
          endLine: 10,
          lineCount: 10
        },
        {
          name: 'longMethod',
          startLine: 15,
          endLine: 45,
          lineCount: 31
        }
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');

    expect(smells).toHaveLength(1);
    expect(smells[0].type).toBe('LongMethod');
    expect(smells[0].methodName).toBe('longMethod');
    expect(smells[0].actualLines).toBe(31);
    expect(smells[0].threshold).toBe(20);
  });

  test('should not detect methods within threshold', async () => {
    const parseResult = {
      functions: [
        {
          name: 'shortMethod1',
          startLine: 1,
          endLine: 10,
          lineCount: 10
        },
        {
          name: 'shortMethod2',
          startLine: 15,
          endLine: 35,
          lineCount: 20
        }
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');

    expect(smells).toHaveLength(0);
  });

  test('should calculate severity correctly', () => {
    expect(analyzer.calculateSeverity(25)).toBe('low'); // 1.25x threshold
    expect(analyzer.calculateSeverity(35)).toBe('medium'); // 1.75x threshold
    expect(analyzer.calculateSeverity(45)).toBe('high'); // 2.25x threshold
  });

  test('should handle empty function list', async () => {
    const parseResult = { functions: [] };
    const smells = await analyzer.analyze(parseResult, '', '');
    expect(smells).toHaveLength(0);
  });

  test('should include detailed information in smell report', async () => {
    const parseResult = {
      functions: [
        {
          name: 'veryLongMethod',
          startLine: 1,
          endLine: 50,
          lineCount: 50
        }
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');

    expect(smells[0]).toMatchObject({
      type: 'LongMethod',
      lines: '1-50',
      description: expect.stringContaining('veryLongMethod'),
      details: expect.stringContaining('50 lines'),
      severity: 'high',
      methodName: 'veryLongMethod',
      actualLines: 50,
      threshold: 20
    });
  });
});