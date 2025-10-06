import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.Arrays;
import java.util.List;

/**
 * Unit tests for ShoppingCartManager
 * These tests pass despite the code smells in the main class
 */
public class ShoppingCartManagerTest {
    
    private ShoppingCartManager cartManager;
    
    @BeforeEach
    void setUp() {
        cartManager = new ShoppingCartManager();
        
        // Add some test products to inventory
        cartManager.getProducts().add(new Product("P001", "Laptop", "Electronics", 999.99));
        cartManager.getProducts().add(new Product("P002", "Mouse", "Electronics", 29.99));
        cartManager.getProducts().add(new Product("P003", "Book", "Education", 19.99));
        
        // Add inventory
        cartManager.getInventory().put("P001", 10);
        cartManager.getInventory().put("P002", 50);
        cartManager.getInventory().put("P003", 25);
    }
    
    @Test
    void testCreateCustomerProfile_ValidData() {
        Customer customer = cartManager.createCustomerProfile(
            "John", "Doe", "john.doe@email.com", "1234567890",
            "123 Main St", "Anytown", "CA", 25
        );
        
        assertNotNull(customer);
        assertEquals("John", customer.getFirstName());
        assertEquals("Doe", customer.getLastName());
        assertEquals("john.doe@email.com", customer.getEmail());
        assertEquals(25, customer.getAge());
        assertEquals("CA", customer.getState());
        assertTrue(customer.getCustomerId().startsWith("CUST"));
        assertEquals(1, cartManager.getCustomers().size());
    }
    
    @Test
    void testCreateCustomerProfile_InvalidEmail() {
        assertThrows(IllegalArgumentException.class, () -> {
            cartManager.createCustomerProfile(
                "Jane", "Smith", "", "1234567890",
                "456 Oak Ave", "Somewhere", "NY", 30
            );
        });
    }
    
    @Test
    void testCreateCustomerProfile_InvalidAge() {
        assertThrows(IllegalArgumentException.class, () -> {
            cartManager.createCustomerProfile(
                "Bob", "Wilson", "bob@email.com", "1234567890",
                "789 Pine St", "Elsewhere", "TX", 12
            );
        });
    }
    
    @Test
    void testValidateCustomerUpdate_ValidData() {
        boolean result = cartManager.validateCustomerUpdate("valid@email.com", 25, "1234567890");
        assertTrue(result);
    }
    
    @Test
    void testValidateCustomerUpdate_InvalidEmail() {
        boolean result = cartManager.validateCustomerUpdate("", 25, "1234567890");
        assertFalse(result);
        
        result = cartManager.validateCustomerUpdate("a@b", 25, "1234567890");
        assertFalse(result);
    }
    
    @Test
    void testProcessOrder_ValidOrder() {
        // First create a customer
        Customer customer = cartManager.createCustomerProfile(
            "Alice", "Johnson", "alice@email.com", "5551234567",
            "321 Elm St", "Testville", "FL", 28
        );
        
        List<String> productIds = Arrays.asList("P002", "P003");
        
        OrderResult result = cartManager.processOrder(
            customer.getCustomerId(),
            productIds,
            "321 Elm St, Testville, FL",
            "credit_card",
            "WELCOME10",
            false
        );
        
        assertTrue(result.isSuccess());
        assertEquals("Order processed successfully", result.getMessage());
        assertNotNull(result.getOrder());
        assertEquals(1, cartManager.getOrders().size());
        assertEquals(1, cartManager.getTotalOrders());
        assertTrue(cartManager.getTotalRevenue() > 0);
    }
    
    @Test
    void testProcessOrder_EmptyProductList() {
        Customer customer = cartManager.createCustomerProfile(
            "Bob", "Smith", "bob@email.com", "5559876543",
            "654 Oak Dr", "Nowhere", "CA", 35
        );
        
        OrderResult result = cartManager.processOrder(
            customer.getCustomerId(),
            Arrays.asList(),
            "654 Oak Dr, Nowhere, CA",
            "credit_card",
            null,
            false
        );
        
        assertFalse(result.isSuccess());
        assertEquals("No products selected", result.getMessage());
        assertEquals(0, cartManager.getOrders().size());
    }
    
    @Test
    void testProcessOrder_CustomerNotFound() {
        OrderResult result = cartManager.processOrder(
            "INVALID_ID",
            Arrays.asList("P001"),
            "123 Test St",
            "credit_card",
            null,
            false
        );
        
        assertFalse(result.isSuccess());
        assertEquals("Customer not found", result.getMessage());
        assertEquals(0, cartManager.getOrders().size());
    }
}