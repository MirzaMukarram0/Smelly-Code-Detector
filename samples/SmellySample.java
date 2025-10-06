import java.util.*;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

/**
 * Sample Java file demonstrating multiple code smells:
 * - God Class (too many responsibilities)
 * - Long methods
 * - Large parameter lists  
 * - Magic numbers
 * - Duplicated code
 * - Feature envy
 */
public class UserManagementSystem {
    
    // Too many fields - God Class smell
    private String applicationName;
    private String version;
    private String databaseUrl;
    private String databaseUsername;
    private String databasePassword;
    private List<User> users;
    private List<String> validationErrors;
    private Map<String, Object> configuration;
    private Map<String, String> cache;
    private EmailService emailService;
    private DatabaseConnection dbConnection;
    private Logger logger;
    private FileManager fileManager;
    private SecurityManager securityManager;
    private ReportGenerator reportGenerator;
    private int errorCount;
    private int successCount;
    private long startTime;
    private long endTime;
    private boolean debugMode;
    
    public UserManagementSystem() {
        this.users = new ArrayList<>();
        this.validationErrors = new ArrayList<>();
        this.configuration = new HashMap<>();
        this.cache = new HashMap<>();
        this.errorCount = 0;
        this.successCount = 0;
        this.debugMode = false;
    }
    
    /**
     * This method is too long and has too many parameters.
     * It violates Single Responsibility Principle.
     */
    public List<User> processUserRegistrations(List<Map<String, Object>> userDataList,
                                             boolean validateEmails, boolean sendNotifications,
                                             boolean saveToDatabase, boolean generateReports,
                                             boolean enableCaching, boolean logActivity,
                                             String notificationTemplate, int batchSize) {
        
        this.startTime = System.currentTimeMillis();
        List<User> processedUsers = new ArrayList<>();
        
        // Input validation phase
        if (userDataList == null || userDataList.isEmpty()) {
            this.validationErrors.add("User data list cannot be null or empty");
            return processedUsers;
        }
        
        if (batchSize <= 0) {
            batchSize = 100; // Magic number!
        }
        
        // Process users in batches
        for (int i = 0; i < userDataList.size(); i += batchSize) {
            int endIndex = Math.min(i + batchSize, userDataList.size());
            List<Map<String, Object>> batch = userDataList.subList(i, endIndex);
            
            for (Map<String, Object> userData : batch) {
                try {
                    // Validation phase with magic numbers
                    List<String> errors = new ArrayList<>();
                    
                    // Email validation
                    String email = (String) userData.get("email");
                    if (email == null || email.trim().isEmpty()) {
                        errors.add("Email is required");
                    } else if (email.length() < 5 || email.length() > 254) { // Magic numbers!
                        errors.add("Email length must be between 5 and 254 characters");
                    } else if (!Pattern.matches("^[^@]+@[^@]+\\.[^@]+$", email)) {
                        errors.add("Invalid email format");
                    }
                    
                    // Age validation with magic numbers
                    Integer age = (Integer) userData.get("age");
                    if (age == null) {
                        errors.add("Age is required");
                    } else if (age < 13 || age > 120) { // Magic numbers!
                        errors.add("Age must be between 13 and 120");
                    }
                    
                    // Phone validation
                    String phone = (String) userData.get("phone");
                    if (phone != null) {
                        String cleanPhone = phone.replaceAll("\\D", "");
                        if (cleanPhone.length() < 10 || cleanPhone.length() > 15) { // Magic numbers!
                            errors.add("Phone number length invalid");
                        }
                    }
                    
                    // Salary validation with magic numbers
                    Double salary = (Double) userData.get("salary");
                    if (salary != null) {
                        if (salary < 15000.0 || salary > 1000000.0) { // Magic numbers!
                            errors.add("Salary must be between $15,000 and $1,000,000");
                        }
                    }
                    
                    if (!errors.isEmpty()) {
                        this.validationErrors.addAll(errors);
                        this.errorCount++;
                        continue;
                    }
                    
                    // User creation and processing
                    User user = new User();
                    user.setId(processedUsers.size() + 1);
                    user.setEmail(email.toLowerCase().trim());
                    user.setFirstName((String) userData.get("firstName"));
                    user.setLastName((String) userData.get("lastName"));
                    user.setAge(age);
                    user.setPhone(phone);
                    user.setSalary(salary);
                    user.setCreatedAt(LocalDateTime.now());
                    
                    // Calculate discount based on age with magic numbers
                    double discountRate;
                    if (age < 25) { // Magic number!
                        discountRate = 0.15; // Magic number!
                    } else if (age < 65) { // Magic number!
                        discountRate = 0.10; // Magic number!
                    } else {
                        discountRate = 0.20; // Magic number!
                    }
                    user.setDiscountRate(discountRate);
                    
                    // Calculate tax with magic numbers
                    if (salary != null) {
                        double taxRate = salary > 100000.0 ? 0.25 : 0.15; // Magic numbers!
                        user.setEstimatedTax(salary * taxRate);
                        
                        double processingFee = Math.max(25.0, salary * 0.02); // Magic numbers!
                        user.setProcessingFee(processingFee);
                    }
                    
                    // Category assignment with magic numbers
                    String category;
                    if (age < 18) { // Magic number!
                        category = "minor";
                    } else if (age < 30) { // Magic number!
                        category = "young_adult";
                    } else if (age < 50) { // Magic number!
                        category = "adult";
                    } else {
                        category = "senior";
                    }
                    user.setCategory(category);
                    
                    processedUsers.add(user);
                    this.successCount++;
                    
                    // Caching with magic numbers
                    if (enableCaching) {
                        String cacheKey = "user_" + user.getId();
                        this.cache.put(cacheKey, user.toString());
                        
                        // Cache cleanup with magic number
                        if (this.cache.size() > 1000) { // Magic number!
                            this.cache.clear();
                        }
                    }
                    
                    // Database saving
                    if (saveToDatabase) {
                        this.saveUserToDatabase(user);
                    }
                    
                    // Email notification
                    if (sendNotifications) {
                        this.sendWelcomeEmail(user, notificationTemplate);
                    }
                    
                    // Activity logging
                    if (logActivity) {
                        this.logUserRegistration(user);
                    }
                    
                } catch (Exception e) {
                    this.errorCount++;
                    this.validationErrors.add("Error processing user: " + e.getMessage());
                }
            }
            
            // Batch processing delay with magic number
            try {
                Thread.sleep(50); // Magic number! (50ms delay)
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        this.endTime = System.currentTimeMillis();
        
        // Report generation
        if (generateReports) {
            this.generateProcessingReport(processedUsers);
        }
        
        return processedUsers;
    }
    
    /**
     * This method shows Feature Envy - it uses dbConnection features extensively
     */
    private void saveUserToDatabase(User user) {
        // Feature Envy: too many calls to dbConnection
        this.dbConnection.openConnection();
        String query = this.dbConnection.prepareStatement(
            "INSERT INTO users (id, email, first_name, last_name, age, phone, salary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        this.dbConnection.setParameter(1, user.getId());
        this.dbConnection.setParameter(2, user.getEmail());
        this.dbConnection.setParameter(3, user.getFirstName());
        this.dbConnection.setParameter(4, user.getLastName());
        this.dbConnection.setParameter(5, user.getAge());
        this.dbConnection.setParameter(6, user.getPhone());
        this.dbConnection.setParameter(7, user.getSalary());
        this.dbConnection.setParameter(8, user.getCreatedAt().toString());
        this.dbConnection.executeUpdate();
        this.dbConnection.commit();
        this.dbConnection.closeConnection();
    }
    
    /**
     * Another example of Feature Envy with emailService
     */
    private void sendWelcomeEmail(User user, String template) {
        // Feature Envy: too many calls to emailService
        String emailTemplate = this.emailService.loadTemplate(template);
        Map<String, String> variables = new HashMap<>();
        variables.put("firstName", user.getFirstName());
        variables.put("lastName", user.getLastName());
        variables.put("email", user.getEmail());
        
        String emailContent = this.emailService.renderTemplate(emailTemplate, variables);
        String subject = this.emailService.getSubjectFromTemplate(template);
        
        this.emailService.createMessage(user.getEmail(), subject, emailContent);
        this.emailService.sendMessage();
        this.emailService.logSentEmail(user.getEmail(), template);
        this.emailService.updateStatistics("welcome_sent");
    }
    
    /**
     * Long method with many magic numbers for report generation
     */
    private void generateProcessingReport(List<User> users) {
        Map<String, Object> report = new HashMap<>();
        report.put("timestamp", LocalDateTime.now().toString());
        report.put("totalProcessed", users.size());
        report.put("successCount", this.successCount);
        report.put("errorCount", this.errorCount);
        
        double successRate = this.successCount / (double) Math.max(1, users.size()) * 100.0; // Magic number!
        report.put("successRate", successRate);
        
        long processingTime = this.endTime - this.startTime;
        report.put("processingTimeMs", processingTime);
        
        // Age group statistics with magic numbers
        Map<String, Integer> ageGroups = new HashMap<>();
        for (User user : users) {
            int age = user.getAge();
            String group;
            if (age < 18) { // Magic number!
                group = "minor";
            } else if (age < 30) { // Magic number!
                group = "young_adult";
            } else if (age < 50) { // Magic number!
                group = "adult";
            } else {
                group = "senior";
            }
            ageGroups.put(group, ageGroups.getOrDefault(group, 0) + 1);
        }
        report.put("ageGroupStats", ageGroups);
        
        // Performance metrics with magic numbers
        double usersPerSecond = users.size() / (processingTime / 1000.0);
        String performance;
        if (usersPerSecond > 100.0) { // Magic number!
            performance = "excellent";
        } else if (usersPerSecond > 50.0) { // Magic number!
            performance = "good";  
        } else if (usersPerSecond > 20.0) { // Magic number!
            performance = "average";
        } else {
            performance = "poor";
        }
        report.put("performance", performance);
        
        // Financial summary with magic numbers
        double totalSalary = users.stream().mapToDouble(u -> u.getSalary() != null ? u.getSalary() : 0).sum();
        double averageSalary = totalSalary / users.size();
        double totalTax = users.stream().mapToDouble(u -> u.getEstimatedTax()).sum();
        double totalFees = users.stream().mapToDouble(u -> u.getProcessingFee()).sum();
        
        report.put("averageSalary", averageSalary);
        report.put("totalTax", totalTax);
        report.put("totalFees", totalFees);
        
        // Quality metrics with magic numbers
        double errorRate = this.errorCount / (double) Math.max(1, users.size() + this.errorCount) * 100.0; // Magic number!
        if (errorRate > 10.0) { // Magic number!
            report.put("quality", "poor");
        } else if (errorRate > 5.0) { // Magic number!
            report.put("quality", "fair");
        } else if (errorRate > 1.0) { // Magic number!
            report.put("quality", "good");
        } else {
            report.put("quality", "excellent");
        }
        
        // Save report with magic number for size limit
        String reportJson = report.toString();
        if (reportJson.length() > 10240) { // Magic number! (10KB)
            report.put("truncated", true);
            report.put("originalSize", reportJson.length());
        }
        
        // File saving logic
        String filename = "user_processing_report_" + System.currentTimeMillis() + ".json";
        // Implementation would save to file...
    }
    
    private void logUserRegistration(User user) {
        String logMessage = String.format("[%s] User registered: ID=%d, Email=%s, Age=%d", 
                                        LocalDateTime.now(), user.getId(), user.getEmail(), user.getAge());
        this.logger.info(logMessage);
    }
}

/**
 * Duplicated validation code - similar to the validation in processUserRegistrations
 */
class UserValidator {
    
    /**
     * This method duplicates validation logic from UserManagementSystem
     */
    public List<String> validateUserForLogin(Map<String, Object> userData) {
        List<String> errors = new ArrayList<>();
        
        // Duplicate email validation with same magic numbers
        String email = (String) userData.get("email");
        if (email == null || email.trim().isEmpty()) {
            errors.add("Email is required");
        } else if (email.length() < 5 || email.length() > 254) { // Same magic numbers!
            errors.add("Email length must be between 5 and 254 characters");
        } else if (!Pattern.matches("^[^@]+@[^@]+\\.[^@]+$", email)) {
            errors.add("Invalid email format");
        }
        
        // Duplicate age validation
        Integer age = (Integer) userData.get("age");
        if (age != null && (age < 13 || age > 120)) { // Same magic numbers!
            errors.add("Age must be between 13 and 120");
        }
        
        return errors;
    }
    
    /**
     * More duplicated validation logic
     */
    public List<String> validateUserForUpdate(Map<String, Object> userData) {
        List<String> errors = new ArrayList<>();
        
        // More duplicate email validation
        String email = (String) userData.get("email");
        if (email != null) {
            if (email.length() < 5 || email.length() > 254) { // Same magic numbers again!
                errors.add("Email length must be between 5 and 254 characters");
            }
            if (!Pattern.matches("^[^@]+@[^@]+\\.[^@]+$", email)) {
                errors.add("Invalid email format");
            }
        }
        
        // Duplicate phone validation
        String phone = (String) userData.get("phone");
        if (phone != null) {
            String cleanPhone = phone.replaceAll("\\D", "");
            if (cleanPhone.length() < 10 || cleanPhone.length() > 15) { // Same magic numbers!
                errors.add("Phone number length invalid");
            }
        }
        
        return errors;
    }
}

/**
 * Method with large parameter list - 12 parameters!
 */
class UserProfileCreator {
    
    public User createDetailedUserProfile(String firstName, String lastName, String email,
                                        String phone, String address, String city, String state,
                                        String zipCode, Integer age, String occupation,
                                        Double salary, String educationLevel) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPhone(phone);
        user.setAge(age);
        user.setSalary(salary);
        // ... set other fields
        return user;
    }
}

/**
 * Simple User class for the examples
 */
class User {
    private int id;
    private String email;
    private String firstName;
    private String lastName;
    private int age;
    private String phone;
    private Double salary;
    private LocalDateTime createdAt;
    private double discountRate;
    private double estimatedTax;
    private double processingFee;
    private String category;
    
    // Getters and setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public Double getSalary() { return salary; }
    public void setSalary(Double salary) { this.salary = salary; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public double getDiscountRate() { return discountRate; }
    public void setDiscountRate(double discountRate) { this.discountRate = discountRate; }
    
    public double getEstimatedTax() { return estimatedTax; }
    public void setEstimatedTax(double estimatedTax) { this.estimatedTax = estimatedTax; }
    
    public double getProcessingFee() { return processingFee; }
    public void setProcessingFee(double processingFee) { this.processingFee = processingFee; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}

// Placeholder classes for the example
class EmailService {
    public String loadTemplate(String template) { return ""; }
    public String renderTemplate(String template, Map<String, String> variables) { return ""; }
    public String getSubjectFromTemplate(String template) { return ""; }
    public void createMessage(String email, String subject, String content) { }
    public void sendMessage() { }
    public void logSentEmail(String email, String template) { }
    public void updateStatistics(String action) { }
}

class DatabaseConnection {
    public void openConnection() { }
    public String prepareStatement(String sql) { return ""; }
    public void setParameter(int index, Object value) { }
    public void executeUpdate() { }
    public void commit() { }
    public void closeConnection() { }
}

class Logger {
    public void info(String message) { }
}

class FileManager { }
class SecurityManager { }
class ReportGenerator { }