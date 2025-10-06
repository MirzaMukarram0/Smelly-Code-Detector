const CodeSmellDetector = require('../src/detector');
const fs = require('fs');
const path = require('path');

describe('CodeSmellDetector', () => {
  let detector;
  let testConfig;

  beforeEach(() => {
    testConfig = {
      smells: {
        LongMethod: true,
        GodClass: true,
        DuplicatedCode: true,
        LargeParameterList: true,
        MagicNumbers: true,
        FeatureEnvy: true
      },
      thresholds: {
        LongMethod: 10, // Lower threshold for testing
        LargeParameterList: 3,
        GodClassMethods: 5,
        GodClassFields: 8,
        DuplicatedCodeSimilarity: 0.8,
        FeatureEnvyThreshold: 2
      },
      output: {
        format: 'json',
        includeLineNumbers: true,
        verboseMode: false
      }
    };
    
    detector = new CodeSmellDetector(testConfig);
  });

  describe('Constructor', () => {
    test('should initialize with provided config', () => {
      expect(detector.config).toEqual(testConfig);
      expect(detector.analyzers).toBeDefined();
    });

    test('should initialize only enabled analyzers', () => {
      const partialConfig = {
        smells: {
          LongMethod: true,
          GodClass: false,
          DuplicatedCode: true,
          LargeParameterList: false,
          MagicNumbers: false,
          FeatureEnvy: false
        },
        thresholds: testConfig.thresholds
      };
      
      const partialDetector = new CodeSmellDetector(partialConfig);
      expect(partialDetector.analyzers.LongMethod).toBeDefined();
      expect(partialDetector.analyzers.GodClass).toBeUndefined();
      expect(partialDetector.analyzers.DuplicatedCode).toBeDefined();
    });
  });

  describe('parseFile', () => {
    test('should parse Python file correctly', () => {
      const pythonCode = `
class Calculator:
    def __init__(self, value=0):
        self.value = value
        self.history = []
    
    def add(self, x, y):
        result = x + y
        self.history.append(result)
        return result
    
    def multiply(self, x, y):
        return x * y

def standalone_function(a, b, c, d, e):
    return a + b + c + d + e
`;
      
      const parsed = detector.parseFile(pythonCode, '.py');
      
      expect(parsed.language).toBe('python');
      expect(parsed.classes).toHaveLength(1);
      expect(parsed.classes[0].name).toBe('Calculator');
      expect(parsed.functions).toHaveLength(4); // __init__, add, multiply, standalone_function
    });

    test('should parse Java file correctly', () => {
      const javaCode = `
public class Calculator {
    private int value;
    private List<Integer> history;
    
    public Calculator(int value) {
        this.value = value;
        this.history = new ArrayList<>();
    }
    
    public int add(int x, int y) {
        int result = x + y;
        history.add(result);
        return result;
    }
    
    public static int multiply(int x, int y) {
        return x * y;
    }
}

public static int standaloneFunction(int a, int b, int c, int d) {
    return a + b + c + d;
}
`;
      
      const parsed = detector.parseFile(javaCode, '.java');
      
      expect(parsed.language).toBe('java');
      expect(parsed.classes).toHaveLength(1);
      expect(parsed.classes[0].name).toBe('Calculator');
    });
  });

  describe('analyze', () => {
    const tempDir = path.join(__dirname, 'temp');
    
    beforeEach(() => {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
    });

    afterEach(() => {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    test('should analyze Python file with long method', async () => {
      const pythonCode = `
def very_long_function():
    # This function is intentionally long
    line1 = 1
    line2 = 2
    line3 = 3
    line4 = 4
    line5 = 5
    line6 = 6
    line7 = 7
    line8 = 8
    line9 = 9
    line10 = 10
    line11 = 11
    line12 = 12
    return line12
`;
      
      const testFile = path.join(tempDir, 'test.py');
      fs.writeFileSync(testFile, pythonCode);
      
      const result = await detector.analyze(testFile);
      
      expect(result.file).toBe('test.py');
      expect(result.language).toBe('Python');
      expect(result.activeSmells).toContain('LongMethod');
      expect(result.detected).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'LongMethod',
            methodName: 'very_long_function'
          })
        ])
      );
    });

    test('should analyze Java file with large parameter list', async () => {
      const javaCode = `
public class Test {
    public void methodWithManyParams(int a, int b, int c, int d, int e, int f) {
        System.out.println(a + b + c + d + e + f);
    }
}
`;
      
      const testFile = path.join(tempDir, 'Test.java');
      fs.writeFileSync(testFile, javaCode);
      
      const result = await detector.analyze(testFile);
      
      expect(result.file).toBe('Test.java');
      expect(result.language).toBe('Java');
      expect(result.activeSmells).toContain('LargeParameterList');
    });

    test('should handle unsupported file types', async () => {
      const testFile = path.join(tempDir, 'test.txt');
      fs.writeFileSync(testFile, 'This is not a supported file type');
      
      await expect(detector.analyze(testFile)).rejects.toThrow('Unsupported file type');
    });

    test('should handle non-existent files', async () => {
      const nonExistentFile = path.join(tempDir, 'nonexistent.py');
      
      await expect(detector.analyze(nonExistentFile)).rejects.toThrow();
    });
  });

  describe('extractFunctions', () => {
    test('should extract Python functions with parameters', () => {
      const pythonCode = `
def simple_function():
    pass

def function_with_params(a, b, c):
    return a + b + c

class TestClass:
    def method(self, x):
        return x * 2
`;
      
      const functions = detector.extractFunctions(pythonCode, '.py');
      
      expect(functions).toHaveLength(3);
      expect(functions[0].name).toBe('simple_function');
      expect(functions[0].parameters).toHaveLength(0);
      expect(functions[1].name).toBe('function_with_params');
      expect(functions[1].parameters).toHaveLength(3);
      expect(functions[2].name).toBe('method');
      expect(functions[2].parameters).toContain('self');
    });

    test('should extract Java methods with parameters', () => {
      const javaCode = `
public class Test {
    public void simpleMethod() {
        // do nothing
    }
    
    private int methodWithParams(int a, String b, boolean c) {
        return a;
    }
    
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
`;
      
      const functions = detector.extractFunctions(javaCode, '.java');
      
      expect(functions.length).toBeGreaterThan(0);
      const methodNames = functions.map(f => f.name);
      expect(methodNames).toContain('simpleMethod');
      expect(methodNames).toContain('methodWithParams');
      expect(methodNames).toContain('main');
    });
  });

  describe('extractClasses', () => {
    test('should extract Python classes', () => {
      const pythonCode = `
class SimpleClass:
    pass

class ClassWithMethods:
    def __init__(self):
        self.value = 0
    
    def method1(self):
        pass
    
    def method2(self):
        pass
`;
      
      const classes = detector.extractClasses(pythonCode, '.py');
      
      expect(classes).toHaveLength(2);
      expect(classes[0].name).toBe('SimpleClass');
      expect(classes[1].name).toBe('ClassWithMethods');
      expect(classes[1].methods.length).toBeGreaterThan(0);
    });

    test('should extract Java classes', () => {
      const javaCode = `
public class PublicClass {
    private int field1;
    protected String field2;
    
    public void method1() {}
    private void method2() {}
}

class PackageClass {
    public void method() {}
}
`;
      
      const classes = detector.extractClasses(javaCode, '.java');
      
      expect(classes.length).toBeGreaterThanOrEqual(1);
      expect(classes[0].name).toBe('PublicClass');
    });
  });
});