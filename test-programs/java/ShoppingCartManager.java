import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * E-Commerce Shopping Cart System (~250 LOC)
 * This program intentionally contains all 6 code smells for testing purposes:
 * 1. Long Method - processOrder() is very long
 * 2. God Class - ShoppingCartManager does too much
 * 3. Duplicated Code - validation logic is repeated
 * 4. Large Parameter List - createCustomerProfile() has many parameters
 * 5. Magic Numbers - hardcoded values throughout
 * 6. Feature Envy - methods access other classes extensively
 */
public class ShoppingCartManager {
    
    // God Class: Too many responsibilities and fields
    private List<Product> products;
    private List<Customer> customers;
    private List<Order> orders;
    private Map<String, Double> discountCodes;
    private Map<String, Integer> inventory;
    private PaymentProcessor paymentProcessor;
    private EmailService emailService;
    private DatabaseService databaseService;
    private TaxCalculator taxCalculator;
    private ShippingCalculator shippingCalculator;
    private AuditLogger auditLogger;
    private SecurityManager securityManager;
    private ReportGenerator reportGenerator;
    private NotificationService notificationService;
    private double totalRevenue;
    private int totalOrders;
    private String systemVersion;
    private boolean maintenanceMode;
    
    public ShoppingCartManager() {
        this.products = new ArrayList<>();
        this.customers = new ArrayList<>();
        this.orders = new ArrayList<>();
        this.discountCodes = new HashMap<>();
        this.inventory = new HashMap<>();
        this.paymentProcessor = new PaymentProcessor();
        this.emailService = new EmailService();
        this.databaseService = new DatabaseService();
        this.taxCalculator = new TaxCalculator();
        this.shippingCalculator = new ShippingCalculator();
        this.totalRevenue = 0.0;
        this.totalOrders = 0;
        this.systemVersion = "1.0.0";
        this.maintenanceMode = false;
        initializeDiscountCodes();
    }
    
    // Long Method: This method is intentionally too long (60+ lines)
    public OrderResult processOrder(String customerId, List<String> productIds, 
                                   String shippingAddress, String paymentMethod,
                                   String discountCode, boolean expressShipping) {
        
        // Validation phase with magic numbers
        if (productIds == null || productIds.size() == 0) {
            return new OrderResult(false, "No products selected");
        }
        
        if (productIds.size() > 50) { // Magic number!
            return new OrderResult(false, "Too many products in single order");
        }
        
        // Customer validation
        Customer customer = findCustomerById(customerId);
        if (customer == null) {
            return new OrderResult(false, "Customer not found");
        }
        
        // Age verification with magic numbers
        if (customer.getAge() < 18) { // Magic number!
            return new OrderResult(false, "Customer must be 18 or older");
        }
        
        // Calculate order total with magic numbers
        double subtotal = 0.0;
        List<Product> orderProducts = new ArrayList<>();
        
        for (String productId : productIds) {
            Product product = findProductById(productId);
            if (product == null) continue;
            
            // Check inventory
            Integer stock = inventory.get(productId);
            if (stock == null || stock < 1) {
                return new OrderResult(false, "Product " + productId + " out of stock");
            }
            
            subtotal += product.getPrice();
            orderProducts.add(product);
            
            // Update inventory
            inventory.put(productId, stock - 1);
        }
        
        // Apply discount with magic numbers
        double discountAmount = 0.0;
        if (discountCode != null && discountCodes.containsKey(discountCode)) {
            double discountPercent = discountCodes.get(discountCode);
            discountAmount = subtotal * discountPercent;
            
            // Maximum discount limits with magic numbers
            if (discountAmount > 100.0) { // Magic number!
                discountAmount = 100.0;
            }
        }
        
        // Calculate tax with magic numbers
        double taxRate = customer.getState().equals("CA") ? 0.08 : 0.06; // Magic numbers!
        double taxAmount = (subtotal - discountAmount) * taxRate;
        
        // Calculate shipping with magic numbers
        double shippingCost = expressShipping ? 25.99 : 9.99; // Magic numbers!
        if (subtotal > 75.0) { // Magic number!
            shippingCost = expressShipping ? 15.99 : 0.0; // Magic numbers!
        }
        
        // Final total calculation
        double total = subtotal - discountAmount + taxAmount + shippingCost;
        
        // Payment processing with magic numbers
        if (total < 0.01) { // Magic number!
            return new OrderResult(false, "Invalid order total");
        }
        
        if (total > 10000.0) { // Magic number!
            return new OrderResult(false, "Order total exceeds maximum limit");
        }
        
        // Create and save order
        Order order = new Order();
        order.setCustomerId(customerId);
        order.setProducts(orderProducts);
        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setTaxAmount(taxAmount);
        order.setShippingCost(shippingCost);
        order.setTotal(total);
        order.setOrderDate(LocalDateTime.now());
        order.setShippingAddress(shippingAddress);
        order.setExpressShipping(expressShipping);
        
        orders.add(order);
        totalOrders++;
        totalRevenue += total;
        
        // Send confirmation email
        sendOrderConfirmation(customer, order);
        
        return new OrderResult(true, "Order processed successfully", order);
    }
    
    // Feature Envy: This method uses emailService extensively
    private void sendOrderConfirmation(Customer customer, Order order) {
        // Feature Envy: accessing emailService features too much
        String template = emailService.loadTemplate("order_confirmation");
        Map<String, String> variables = emailService.createVariableMap();
        emailService.addVariable(variables, "customerName", customer.getName());
        emailService.addVariable(variables, "orderTotal", String.valueOf(order.getTotal()));
        emailService.addVariable(variables, "orderDate", order.getOrderDate().toString());
        
        String emailContent = emailService.processTemplate(template, variables);
        String subject = emailService.generateSubject("Order Confirmation");
        
        emailService.sendEmail(customer.getEmail(), subject, emailContent);
        emailService.logEmailSent(customer.getEmail(), "order_confirmation");
        emailService.updateDeliveryStats("confirmation_sent");
    }
    
    // Large Parameter List: Too many parameters (8 total)
    public Customer createCustomerProfile(String firstName, String lastName, String email,
                                        String phone, String address, String city, 
                                        String state, int age) {
        // Duplicated validation logic
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (email.length() < 5 || email.length() > 100) { // Magic numbers!
            throw new IllegalArgumentException("Email length invalid");
        }
        if (age < 13 || age > 120) { // Magic numbers!
            throw new IllegalArgumentException("Invalid age");
        }
        if (phone != null && (phone.length() < 10 || phone.length() > 15)) { // Magic numbers!
            throw new IllegalArgumentException("Phone number invalid");
        }
        
        Customer customer = new Customer();
        customer.setFirstName(firstName);
        customer.setLastName(lastName);
        customer.setEmail(email);
        customer.setPhone(phone);
        customer.setAddress(address);
        customer.setCity(city);
        customer.setState(state);
        customer.setAge(age);
        customer.setCustomerId(generateCustomerId());
        customer.setRegistrationDate(LocalDateTime.now());
        
        customers.add(customer);
        return customer;
    }
    
    // Duplicated Code: Similar validation logic as above
    public boolean validateCustomerUpdate(String email, int age, String phone) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        if (email.length() < 5 || email.length() > 100) { // Same magic numbers!
            return false;
        }
        if (age < 13 || age > 120) { // Same magic numbers!
            return false;
        }
        if (phone != null && (phone.length() < 10 || phone.length() > 15)) { // Same magic numbers!
            return false;
        }
        return true;
    }
    
    private void initializeDiscountCodes() {
        discountCodes.put("WELCOME10", 0.10); // Magic number!
        discountCodes.put("SAVE20", 0.20);    // Magic number!
        discountCodes.put("BULK15", 0.15);    // Magic number!
    }
    
    private String generateCustomerId() {
        return "CUST" + (customers.size() + 1000); // Magic number!
    }
    
    private Customer findCustomerById(String customerId) {
        return customers.stream()
                .filter(c -> c.getCustomerId().equals(customerId))
                .findFirst()
                .orElse(null);
    }
    
    private Product findProductById(String productId) {
        return products.stream()
                .filter(p -> p.getProductId().equals(productId))
                .findFirst()
                .orElse(null);
    }
    
    // Getters for testing
    public List<Order> getOrders() { return orders; }
    public List<Customer> getCustomers() { return customers; }
    public double getTotalRevenue() { return totalRevenue; }
    public int getTotalOrders() { return totalOrders; }
}

// Supporting classes
class Customer {
    private String customerId, firstName, lastName, email, phone, address, city, state;
    private int age;
    private LocalDateTime registrationDate;
    
    // Getters and setters
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public String getName() { return firstName + " " + lastName; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDateTime registrationDate) { this.registrationDate = registrationDate; }
}

class Product {
    private String productId, name, category;
    private double price;
    
    public Product(String productId, String name, String category, double price) {
        this.productId = productId;
        this.name = name;
        this.category = category;
        this.price = price;
    }
    
    public String getProductId() { return productId; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public double getPrice() { return price; }
}

class Order {
    private String customerId, shippingAddress;
    private List<Product> products;
    private double subtotal, discountAmount, taxAmount, shippingCost, total;
    private LocalDateTime orderDate;
    private boolean expressShipping;
    
    // Getters and setters
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }
    public double getSubtotal() { return subtotal; }
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }
    public double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(double discountAmount) { this.discountAmount = discountAmount; }
    public double getTaxAmount() { return taxAmount; }
    public void setTaxAmount(double taxAmount) { this.taxAmount = taxAmount; }
    public double getShippingCost() { return shippingCost; }
    public void setShippingCost(double shippingCost) { this.shippingCost = shippingCost; }
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public boolean isExpressShipping() { return expressShipping; }
    public void setExpressShipping(boolean expressShipping) { this.expressShipping = expressShipping; }
}

class OrderResult {
    private boolean success;
    private String message;
    private Order order;
    
    public OrderResult(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public OrderResult(boolean success, String message, Order order) {
        this.success = success;
        this.message = message;
        this.order = order;
    }
    
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public Order getOrder() { return order; }
}

// Mock service classes
class EmailService {
    public String loadTemplate(String name) { return "template"; }
    public Map<String, String> createVariableMap() { return new HashMap<>(); }
    public void addVariable(Map<String, String> map, String key, String value) { map.put(key, value); }
    public String processTemplate(String template, Map<String, String> variables) { return "processed"; }
    public String generateSubject(String type) { return type; }
    public void sendEmail(String email, String subject, String content) { }
    public void logEmailSent(String email, String type) { }
    public void updateDeliveryStats(String type) { }
}

class PaymentProcessor { }
class DatabaseService { }
class TaxCalculator { }
class ShippingCalculator { }
class AuditLogger { }
class SecurityManager { }
class ReportGenerator { }
class NotificationService { }