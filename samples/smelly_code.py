# Sample Python file with multiple code smells
import re
import json
from datetime import datetime

class DataProcessor:
    """
    This class demonstrates multiple code smells:
    - God Class (too many responsibilities)
    - Long methods
    - Magic numbers
    """
    
    def __init__(self):
        # Too many fields for a single class
        self.data = []
        self.processed_data = []
        self.validation_errors = []
        self.email_service = None
        self.database_connection = None
        self.cache = {}
        self.statistics = {}
        self.configuration = {}
        self.temp_files = []
        self.log_entries = []
        self.error_count = 0
        self.success_count = 0
        self.total_processed = 0
        self.start_time = None
        self.end_time = None
        
    def validate_and_process_user_data(self, user_data_list, send_notifications=True, 
                                     save_to_database=True, generate_reports=True,
                                     validate_emails=True, process_payments=False):
        """
        This method has too many parameters and is too long.
        It violates Single Responsibility Principle.
        """
        self.start_time = datetime.now()
        processed_results = []
        
        # Validation phase - should be extracted
        for user_data in user_data_list:
            validation_errors = []
            
            # Email validation with magic numbers
            if 'email' in user_data:
                email = user_data['email']
                if len(email) < 5 or len(email) > 254:  # Magic numbers!
                    validation_errors.append("Email length invalid")
                if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
                    validation_errors.append("Email format invalid")
            
            # Age validation with more magic numbers
            if 'age' in user_data:
                age = user_data['age']
                if age < 13 or age > 120:  # Magic numbers!
                    validation_errors.append("Age out of range")
            
            # Phone validation
            if 'phone' in user_data:
                phone = user_data['phone']
                if len(phone) < 10 or len(phone) > 15:  # Magic numbers!
                    validation_errors.append("Phone length invalid")
            
            # Salary validation with magic numbers
            if 'salary' in user_data:
                salary = user_data['salary']
                if salary < 15000 or salary > 1000000:  # Magic numbers!
                    validation_errors.append("Salary out of range")
            
            if validation_errors:
                self.validation_errors.extend(validation_errors)
                continue
            
            # Data processing phase - should be extracted
            processed_user = {}
            processed_user['id'] = len(processed_results) + 1
            processed_user['email'] = user_data['email'].lower().strip()
            processed_user['full_name'] = f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}"
            processed_user['age_group'] = self.categorize_age(user_data['age'])
            processed_user['phone_formatted'] = self.format_phone(user_data['phone'])
            processed_user['created_at'] = datetime.now().isoformat()
            
            # Calculate some metrics with magic numbers
            if user_data['age'] < 25:  # Magic number!
                processed_user['discount_rate'] = 0.15  # Magic number!
            elif user_data['age'] < 65:  # Magic number!
                processed_user['discount_rate'] = 0.10  # Magic number!
            else:
                processed_user['discount_rate'] = 0.20  # Magic number!
            
            # Payment processing with magic numbers
            if process_payments and 'salary' in user_data:
                tax_rate = 0.25 if user_data['salary'] > 100000 else 0.15  # Magic numbers!
                processed_user['estimated_tax'] = user_data['salary'] * tax_rate
                processing_fee = max(25.0, user_data['salary'] * 0.02)  # Magic numbers!
                processed_user['processing_fee'] = processing_fee
            
            processed_results.append(processed_user)
            self.success_count += 1
        
        # Database saving phase - should be extracted
        if save_to_database:
            for user in processed_results:
                self.save_to_database(user)
                
        # Notification phase - should be extracted  
        if send_notifications:
            for user in processed_results:
                self.send_welcome_email(user['email'], user['full_name'])
        
        # Report generation phase - should be extracted
        if generate_reports:
            self.generate_processing_report(processed_results)
        
        self.end_time = datetime.now()
        self.total_processed = len(processed_results)
        
        return processed_results
    
    def categorize_age(self, age):
        """More magic numbers here"""
        if age < 18:    # Magic number!
            return "minor"
        elif age < 25:  # Magic number!
            return "young_adult"
        elif age < 40:  # Magic number!
            return "adult"
        elif age < 65:  # Magic number!
            return "middle_aged"
        else:
            return "senior"
    
    def format_phone(self, phone):
        """Phone formatting with magic numbers"""
        digits = re.sub(r'\D', '', phone)
        if len(digits) == 10:  # Magic number!
            return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        elif len(digits) == 11 and digits[0] == '1':  # Magic number!
            return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
        return phone
    
    def save_to_database(self, user_data):
        """This method shows Feature Envy - it uses too many external features"""
        # Feature Envy: accessing database_connection features extensively
        cursor = self.database_connection.cursor()
        query = self.database_connection.prepare_statement("INSERT INTO users VALUES (?, ?, ?, ?)")
        self.database_connection.execute(query, user_data['id'], user_data['email'], 
                                        user_data['full_name'], user_data['created_at'])
        self.database_connection.commit()
        self.database_connection.close_cursor(cursor)
        
        # Also accesses cache extensively
        cache_key = f"user_{user_data['id']}"
        self.cache.set(cache_key, user_data, 3600)  # Magic number! (3600 seconds)
        self.cache.update_stats(cache_key)
        self.cache.cleanup_expired()
    
    def send_welcome_email(self, email, name):
        """Another example of Feature Envy"""
        # Feature Envy: accessing email_service features extensively
        template = self.email_service.load_template("welcome")
        content = self.email_service.render_template(template, {"name": name})
        message = self.email_service.create_message(email, "Welcome!", content)
        self.email_service.send(message)
        self.email_service.log_sent_email(email, "welcome")
        self.email_service.update_statistics("welcome_sent")
    
    def generate_processing_report(self, results):
        """Yet another long method with magic numbers"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_processed': len(results),
            'success_rate': self.success_count / max(1, len(results)) * 100,  # Magic number!
            'error_count': self.error_count,
            'processing_time_seconds': (self.end_time - self.start_time).total_seconds(),
            'statistics': {}
        }
        
        # Calculate age group statistics with magic numbers
        age_groups = {}
        for user in results:
            group = user['age_group']
            age_groups[group] = age_groups.get(group, 0) + 1
        
        report['statistics']['age_groups'] = age_groups
        
        # Calculate discount statistics
        total_discount = sum(user.get('discount_rate', 0) for user in results)
        average_discount = total_discount / len(results) if results else 0
        report['statistics']['average_discount_rate'] = average_discount
        
        # Performance metrics with magic numbers
        processing_rate = len(results) / max(1, (self.end_time - self.start_time).total_seconds())
        if processing_rate > 100:  # Magic number!
            report['performance'] = 'excellent'
        elif processing_rate > 50:  # Magic number!
            report['performance'] = 'good'
        elif processing_rate > 20:  # Magic number!
            report['performance'] = 'average'
        else:
            report['performance'] = 'poor'
        
        # Save report with magic numbers for file size limits
        report_json = json.dumps(report, indent=2)
        if len(report_json) > 10240:  # Magic number! (10KB)
            # Truncate large reports
            report['truncated'] = True
            report['original_size'] = len(report_json)
        
        filename = f"processing_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        return report

# Duplicated code example - similar validation logic
def validate_user_registration(user_data):
    """This function duplicates validation logic from the class above"""
    errors = []
    
    # Duplicate email validation
    if 'email' in user_data:
        email = user_data['email']
        if len(email) < 5 or len(email) > 254:  # Same magic numbers!
            errors.append("Email length invalid")
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            errors.append("Email format invalid")
    
    # Duplicate age validation  
    if 'age' in user_data:
        age = user_data['age']
        if age < 13 or age > 120:  # Same magic numbers!
            errors.append("Age out of range")
    
    # Duplicate phone validation
    if 'phone' in user_data:
        phone = user_data['phone']
        if len(phone) < 10 or len(phone) > 15:  # Same magic numbers!
            errors.append("Phone length invalid")
    
    return errors

def validate_user_login(credentials):
    """More duplicated validation logic"""
    errors = []
    
    # More duplicate email validation
    if 'email' in credentials:
        email = credentials['email']
        if len(email) < 5 or len(email) > 254:  # Same magic numbers again!
            errors.append("Email length invalid")
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            errors.append("Email format invalid")
    
    return errors

# Function with large parameter list
def create_comprehensive_user_profile(first_name, last_name, email, phone, address, 
                                     city, state, zip_code, country, birth_date, 
                                     gender, occupation, salary, education_level,
                                     emergency_contact_name, emergency_contact_phone):
    """This function has way too many parameters (16 total!)"""
    profile = {
        'personal': {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone': phone,
            'birth_date': birth_date,
            'gender': gender
        },
        'address': {
            'street': address,
            'city': city,
            'state': state,
            'zip_code': zip_code,
            'country': country
        },
        'professional': {
            'occupation': occupation,
            'salary': salary,
            'education_level': education_level
        },
        'emergency_contact': {
            'name': emergency_contact_name,
            'phone': emergency_contact_phone
        }
    }
    return profile