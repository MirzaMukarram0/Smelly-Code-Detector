# Code Smells Documentation

This document provides detailed information about each code smell detected by the application, including detection criteria, examples, and remediation strategies.

## 1. Long Method

### Description
A Long Method is a method that has grown too large and tries to do too much. Long methods are harder to understand, test, and maintain.

### Detection Criteria
- **Threshold:** More than 40 lines (configurable)
- **Measurement:** Non-empty, non-comment lines
- **Scope:** All functions and methods

### Example (Python)
```python
def process_user_data(user_data):
    # This method is too long - it handles validation,
    # processing, database operations, and email sending
    
    # Validation logic (10 lines)
    if not user_data:
        raise ValueError("User data is required")
    if 'email' not in user_data:
        raise ValueError("Email is required")
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', user_data['email']):
        raise ValueError("Invalid email format")
    # ... more validation
    
    # Data processing (15 lines)
    processed_data = {}
    processed_data['email'] = user_data['email'].lower().strip()
    processed_data['name'] = user_data.get('name', '').title()
    # ... more processing
    
    # Database operations (10 lines)
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO users ...", processed_data)
    connection.commit()
    # ... more database work
    
    # Email sending (8 lines)
    email_service = EmailService()
    email_service.send_welcome_email(processed_data['email'])
    # ... more email logic
    
    return processed_data
```

### Remediation
- **Extract Method:** Break into smaller, focused methods
- **Single Responsibility:** Each method should do one thing
- **Compose Method:** Use multiple small methods to build functionality

### Refactored Example
```python
def process_user_data(user_data):
    validated_data = validate_user_data(user_data)
    processed_data = transform_user_data(validated_data)
    user_id = save_user_to_database(processed_data)
    send_welcome_email(processed_data['email'])
    return processed_data

def validate_user_data(user_data):
    # Focused validation logic
    pass

def transform_user_data(user_data):
    # Focused data transformation
    pass
```

---

## 2. God Class (Blob)

### Description
A God Class is a class that knows too much or does too much. It violates the Single Responsibility Principle by having too many methods or fields.

### Detection Criteria
- **Method Threshold:** More than 10 methods (configurable)
- **Field Threshold:** More than 15 fields (configurable)
- **Scope:** All classes

### Example (Java)
```java
// This class has too many responsibilities
public class UserManager {
    // Too many fields (20+)
    private String name, email, phone, address, city, state, zip;
    private int age, salary, experience, rating, departmentId;
    private Date birthDate, hireDate, lastLogin, lastUpdate;
    private boolean isActive, isAdmin, isPremium, hasNotifications;
    
    // Too many methods (15+)
    public void createUser() { }
    public void updateUser() { }
    public void deleteUser() { }
    public void validateEmail() { }
    public void validatePhone() { }
    public void sendEmail() { }
    public void sendSMS() { }
    public void generateReport() { }
    public void exportToCSV() { }
    public void importFromCSV() { }
    public void calculateSalary() { }
    public void processPayment() { }
    public void handleLogin() { }
    public void handleLogout() { }
    public void managePermissions() { }
    // ... even more methods
}
```

### Remediation
- **Extract Class:** Split into multiple focused classes
- **Single Responsibility:** Each class should have one reason to change
- **Delegation:** Use composition instead of inheritance

### Refactored Example
```java
public class User {
    private String name, email, phone;
    private boolean isActive;
    // Only user-specific fields
}

public class UserValidator {
    public boolean validateEmail(String email) { }
    public boolean validatePhone(String phone) { }
}

public class NotificationService {
    public void sendEmail(String email, String message) { }
    public void sendSMS(String phone, String message) { }
}

public class UserRepository {
    public void save(User user) { }
    public void delete(User user) { }
    public User findById(Long id) { }
}
```

---

## 3. Duplicated Code

### Description
Duplicated Code occurs when the same code structure appears in more than one place. It violates the DRY (Don't Repeat Yourself) principle.

### Detection Criteria
- **Similarity Threshold:** 80% or higher similarity (configurable)
- **Minimum Size:** At least 5 lines
- **Algorithm:** Normalized Levenshtein distance
- **Scope:** Functions and code blocks

### Example (Python)
```python
# Duplicated validation logic
def validate_user_registration(data):
    if not data.get('email'):
        raise ValueError("Email is required")
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', data['email']):
        raise ValueError("Invalid email format")
    if not data.get('password'):
        raise ValueError("Password is required")
    if len(data['password']) < 8:
        raise ValueError("Password must be at least 8 characters")

def validate_user_login(credentials):
    if not credentials.get('email'):
        raise ValueError("Email is required")
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', credentials['email']):
        raise ValueError("Invalid email format")
    if not credentials.get('password'):
        raise ValueError("Password is required")
    if len(credentials['password']) < 8:
        raise ValueError("Password must be at least 8 characters")
```

### Remediation
- **Extract Method:** Create shared utility functions
- **Extract Constant:** Define shared constants
- **Template Method:** Use inheritance for similar algorithms

### Refactored Example
```python
def validate_email(email):
    if not email:
        raise ValueError("Email is required")
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
        raise ValueError("Invalid email format")

def validate_password(password):
    if not password:
        raise ValueError("Password is required")
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters")

def validate_user_registration(data):
    validate_email(data.get('email'))
    validate_password(data.get('password'))

def validate_user_login(credentials):
    validate_email(credentials.get('email'))
    validate_password(credentials.get('password'))
```

---

## 4. Large Parameter List

### Description
A Large Parameter List occurs when a method takes too many parameters, making it hard to understand and use.

### Detection Criteria
- **Threshold:** More than 5 parameters (configurable)
- **Scope:** All functions and methods
- **Measurement:** Count of formal parameters

### Example (Java)
```java
// Too many parameters make this method hard to use
public void createUser(String firstName, String lastName, String email, 
                      String phone, String address, String city, String state, 
                      String zipCode, int age, String department, double salary,
                      boolean isActive, boolean isAdmin) {
    // Method implementation
}
```

### Remediation
- **Parameter Object:** Group related parameters into objects
- **Builder Pattern:** Use builder for complex object creation
- **Method Decomposition:** Split into smaller methods

### Refactored Example
```java
public class UserInfo {
    private String firstName, lastName, email, phone;
    private Address address;
    private int age;
    private EmployeeDetails employeeDetails;
    private UserSettings settings;
}

public class Address {
    private String street, city, state, zipCode;
}

public class EmployeeDetails {
    private String department;
    private double salary;
}

public class UserSettings {
    private boolean isActive, isAdmin;
}

// Much cleaner method signature
public void createUser(UserInfo userInfo) {
    // Method implementation
}
```

---

## 5. Magic Numbers

### Description
Magic Numbers are numeric literals that appear in code without explanation. They make code harder to understand and maintain.

### Detection Criteria
- **Detection:** Hardcoded numeric literals
- **Exclusions:** Common numbers (0, 1, -1, 2, 10, 100, 1000)
- **Context Filtering:** Ignores dates, times, versions, array indices, test values
- **Scope:** All code lines except comments and strings

### Example (Python)
```python
def calculate_tax(income):
    # Magic numbers without explanation
    if income > 50000:
        return income * 0.25  # What is 0.25?
    elif income > 25000:
        return income * 0.15  # What is 0.15?
    else:
        return income * 0.10  # What is 0.10?

def process_payment(amount):
    # More magic numbers
    fee = amount * 0.029  # What does 0.029 represent?
    if fee < 3.50:        # Why 3.50?
        fee = 3.50
    return amount + fee
```

### Remediation
- **Named Constants:** Define meaningful constant names
- **Configuration:** Move values to configuration files
- **Enums:** Use enums for related constants

### Refactored Example
```python
# Define meaningful constants
TAX_RATE_HIGH = 0.25      # Tax rate for high income (>$50k)
TAX_RATE_MEDIUM = 0.15    # Tax rate for medium income ($25k-$50k)
TAX_RATE_LOW = 0.10       # Tax rate for low income (<$25k)

HIGH_INCOME_THRESHOLD = 50000
MEDIUM_INCOME_THRESHOLD = 25000

PROCESSING_FEE_RATE = 0.029  # 2.9% processing fee
MINIMUM_FEE = 3.50           # Minimum processing fee

def calculate_tax(income):
    if income > HIGH_INCOME_THRESHOLD:
        return income * TAX_RATE_HIGH
    elif income > MEDIUM_INCOME_THRESHOLD:
        return income * TAX_RATE_MEDIUM
    else:
        return income * TAX_RATE_LOW

def process_payment(amount):
    fee = amount * PROCESSING_FEE_RATE
    if fee < MINIMUM_FEE:
        fee = MINIMUM_FEE
    return amount + fee
```

---

## 6. Feature Envy

### Description
Feature Envy occurs when a method in one class uses features (methods/fields) of another class more than its own class features.

### Detection Criteria
- **Threshold:** 3 or more external references (configurable)
- **Comparison:** External references > own class references
- **Scope:** Methods within classes
- **Measurement:** Method calls and field accesses

### Example (Java)
```java
public class Order {
    private Customer customer;
    private List<Item> items;
    
    // This method envies the Customer class
    public String generateCustomerReport() {
        StringBuilder report = new StringBuilder();
        
        // Too many references to customer features
        report.append("Name: ").append(customer.getFirstName())
              .append(" ").append(customer.getLastName()).append("\n");
        report.append("Email: ").append(customer.getEmail()).append("\n");
        report.append("Phone: ").append(customer.getPhone()).append("\n");
        report.append("Address: ").append(customer.getAddress()).append("\n");
        report.append("City: ").append(customer.getCity()).append("\n");
        report.append("State: ").append(customer.getState()).append("\n");
        
        return report.toString();
    }
}
```

### Remediation
- **Move Method:** Move the method to the class it envies
- **Extract Method:** Extract envious code to the proper class
- **Delegation:** Create methods in the envied class

### Refactored Example
```java
public class Customer {
    private String firstName, lastName, email, phone;
    private String address, city, state;
    
    // Move the envious method here
    public String generateReport() {
        StringBuilder report = new StringBuilder();
        report.append("Name: ").append(firstName).append(" ").append(lastName).append("\n");
        report.append("Email: ").append(email).append("\n");
        report.append("Phone: ").append(phone).append("\n");
        report.append("Address: ").append(address).append("\n");
        report.append("City: ").append(city).append("\n");
        report.append("State: ").append(state).append("\n");
        return report.toString();
    }
}

public class Order {
    private Customer customer;
    private List<Item> items;
    
    // Now this method just delegates
    public String generateCustomerReport() {
        return customer.generateReport();
    }
}
```

## Detection Accuracy Notes

### False Positives
The detector may flag legitimate cases as smells:
- **Long Method:** Complex algorithms that should stay together
- **Magic Numbers:** Mathematical constants or domain-specific values
- **Large Parameter List:** Constructor methods or configuration methods

### False Negatives
The detector may miss some smells:
- **Feature Envy:** Complex object relationships
- **Duplicated Code:** Semantically similar but syntactically different code
- **God Class:** Classes with appropriate complexity for their domain

### Recommendations
- Use the detector as a guide, not an absolute rule
- Consider the context and domain of your application
- Review flagged code manually before refactoring
- Adjust thresholds based on your project's needs