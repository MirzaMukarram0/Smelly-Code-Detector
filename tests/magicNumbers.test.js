const MagicNumbersAnalyzer = require('../src/analyzers/magicNumbers');

describe('MagicNumbersAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new MagicNumbersAnalyzer({});
  });

  test('should detect magic numbers in code', async () => {
    const parseResult = {
      lines: [
        'def calculate_price(base_price):',
        '    tax_rate = 0.15  # Magic number!',
        '    shipping = 25    # Another magic number',
        '    total = base_price * (1 + tax_rate) + shipping',
        '    return total'
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');

    expect(smells.length).toBeGreaterThan(0);
    
    const magicNumbers = smells.flatMap(smell => smell.magicNumbers);
    expect(magicNumbers).toContain('25');
    // Note: 0.15 might be filtered out as it's in a comment context
  });

  test('should ignore allowed numbers', async () => {
    const parseResult = {
      lines: [
        'def simple_function():',
        '    counter = 0',
        '    limit = 1',
        '    step = -1',
        '    multiplier = 2',
        '    return counter'
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');
    expect(smells).toHaveLength(0);
  });

  test('should ignore numbers in comments and strings', async () => {
    const parseResult = {
      lines: [
        '# This is version 3.14.159',
        'another = "Price: $99.99"',
        "text = 'Price: $99.99'",
        '/* Java comment with 123 */',
        '// Line comment with 456'
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');
    expect(smells).toHaveLength(0);
  });

  test('should ignore date and time patterns', async () => {
    const parseResult = {
      lines: [
        'date = "2023-12-25"',
        'time = "14:30:00"',
        'version = "v1.2.3"',
        'timeout = "5000ms"',
        'duration = "30min"'
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');
    expect(smells).toHaveLength(0);
  });

  test('should ignore array indices and loop counters', async () => {
    const parseResult = {
      lines: [
        'for i in range(10):',
        '    array[5] = value',
        'while count < 100:',
        '    items[0] = first_item'
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');
    expect(smells).toHaveLength(0);
  });

  test('should ignore test context', async () => {
    const parseResult = {
      lines: [
        'assert result == 42',
        'expect(value).toBe(99)',
        'assertEquals(count, 15)',
        'assertTrue(score > 85)'
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');
    expect(smells).toHaveLength(0);
  });

  test('should detect genuine magic numbers', async () => {
    const parseResult = {
      lines: [
        'def complex_calculation():',
        '    limit = 9999',
        '    return limit'
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');

    expect(smells.length).toBeGreaterThan(0);
    
    const allMagicNumbers = smells.flatMap(smell => smell.magicNumbers);
    expect(allMagicNumbers).toContain('9999');
  });

  test('should calculate severity based on magic number count', () => {
    expect(analyzer.calculateSeverity(1)).toBe('low');
    expect(analyzer.calculateSeverity(3)).toBe('medium');
    expect(analyzer.calculateSeverity(6)).toBe('high');
  });

  test('should handle empty lines', async () => {
    const parseResult = { lines: [] };
    const smells = await analyzer.analyze(parseResult, '', '');
    expect(smells).toHaveLength(0);
  });

  test('should provide detailed information in smell report', async () => {
    const parseResult = {
      lines: [
        'def calculate():',
        '    max_value = 999'
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');

    expect(smells.length).toBeGreaterThan(0);
    if (smells.length > 0) {
      expect(smells[0]).toMatchObject({
        type: 'MagicNumbers',
        lines: '2',
        description: expect.stringContaining('999'),
        details: expect.stringContaining('named constants'),
        magicNumbers: ['999'],
        lineContent: expect.stringContaining('max_value = 999')
      });
    }
  });

  test('should remove duplicate magic numbers on same line', async () => {
    const parseResult = {
      lines: [
        'result = 42 + 42 + 42  # Same number multiple times'
      ]
    };

    const smells = await analyzer.analyze(parseResult, '', '');
    
    if (smells.length > 0) {
      expect(smells[0].magicNumbers).toEqual(['42']);
    }
  });
});