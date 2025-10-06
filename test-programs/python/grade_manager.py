"""
Student Grade Management System (~250 LOC)
This program intentionally contains all 6 code smells for testing purposes:
1. Long Method - calculate_final_grades() is very long
2. God Class - GradeManager does too much
3. Duplicated Code - validation logic is repeated
4. Large Parameter List - create_student_record() has many parameters
5. Magic Numbers - hardcoded values throughout
6. Feature Envy - methods access other classes extensively
"""

import datetime
import json
import re
from typing import List, Dict, Optional


class GradeManager:
    """
    God Class: This class has too many responsibilities:
    - Student management
    - Grade calculation
    - Report generation
    - Email notifications
    - Database operations
    - Statistics calculation
    - File I/O
    - Validation
    """
    
    def __init__(self):
        # Too many fields for a single class
        self.students = []
        self.courses = {}  # Fixed: should be dictionary
        self.grades = {}
        self.attendance = {}
        self.assignments = {}
        self.email_service = EmailNotificationService()
        self.database = DatabaseService()
        self.report_generator = ReportGenerator()
        self.statistics_calculator = StatisticsCalculator()
        self.file_manager = FileManager()
        self.audit_logger = AuditLogger()
        self.notification_settings = {}
        self.grading_scales = {}
        self.semester_info = {}
        self.system_settings = {}
        self.user_permissions = {}
        self.backup_settings = {}
        self.export_formats = ['pdf', 'csv', 'excel']
        self.notification_queue = []
        self.processing_status = "idle"
        
    # Long Method: This method is intentionally too long (80+ lines)
    def calculate_final_grades(self, student_id: str, semester: str, 
                             include_extra_credit: bool = True,
                             weight_participation: bool = True,
                             apply_curve: bool = False) -> Dict:
        """
        Calculate final grades for a student - intentionally long method
        """
        # Input validation with magic numbers
        if not student_id or len(student_id) < 3:  # Magic number!
            raise ValueError("Invalid student ID")
        
        student = self.find_student_by_id(student_id)
        if not student:
            raise ValueError("Student not found")
        
        # Age validation with magic numbers
        if student['age'] < 16 or student['age'] > 70:  # Magic numbers!
            raise ValueError("Invalid student age for grade calculation")
        
        final_grades = {}
        total_credit_hours = 0
        weighted_grade_points = 0
        
        # Process each course
        for course_id, course_info in self.courses.items():
            if course_info['semester'] != semester:
                continue
                
            # Get all assignments for this course
            course_grades = []
            assignment_weights = {
                'homework': 0.20,    # Magic number!
                'quizzes': 0.15,     # Magic number!
                'midterm': 0.25,     # Magic number!
                'final': 0.30,       # Magic number!
                'participation': 0.10 # Magic number!
            }
            
            # Calculate homework average
            homework_scores = []
            for assignment in self.assignments.get(course_id, {}).get('homework', []):
                if student_id in assignment['grades']:
                    score = assignment['grades'][student_id]
                    # Drop lowest score if more than 5 assignments (magic number!)
                    homework_scores.append(score)
            
            if len(homework_scores) > 5:  # Magic number!
                homework_scores.remove(min(homework_scores))
            
            homework_avg = sum(homework_scores) / len(homework_scores) if homework_scores else 0
            
            # Calculate quiz average
            quiz_scores = []
            for assignment in self.assignments.get(course_id, {}).get('quizzes', []):
                if student_id in assignment['grades']:
                    score = assignment['grades'][student_id]
                    quiz_scores.append(score)
            
            # Drop lowest 2 quiz scores if more than 8 quizzes (magic numbers!)
            if len(quiz_scores) > 8:  # Magic number!
                quiz_scores.sort()
                quiz_scores = quiz_scores[2:]  # Magic number!
            
            quiz_avg = sum(quiz_scores) / len(quiz_scores) if quiz_scores else 0
            
            # Get exam scores
            midterm_score = 0
            final_score = 0
            
            for assignment in self.assignments.get(course_id, {}).get('exams', []):
                if student_id in assignment['grades']:
                    if assignment['type'] == 'midterm':
                        midterm_score = assignment['grades'][student_id]
                    elif assignment['type'] == 'final':
                        final_score = assignment['grades'][student_id]
            
            # Calculate participation score
            participation_score = 0
            if weight_participation:
                attendance_rate = self.attendance.get(course_id, {}).get(student_id, 0)
                # Magic numbers for participation calculation
                if attendance_rate >= 95:      # Magic number!
                    participation_score = 100
                elif attendance_rate >= 90:   # Magic number!
                    participation_score = 95
                elif attendance_rate >= 85:   # Magic number!
                    participation_score = 90
                elif attendance_rate >= 80:   # Magic number!
                    participation_score = 85
                else:
                    participation_score = max(0, attendance_rate * 0.8)  # Magic number!
            
            # Calculate weighted course grade
            course_grade = (
                homework_avg * assignment_weights['homework'] +
                quiz_avg * assignment_weights['quizzes'] +
                midterm_score * assignment_weights['midterm'] +
                final_score * assignment_weights['final'] +
                participation_score * assignment_weights['participation']
            )
            
            # Apply extra credit if available
            if include_extra_credit:
                extra_credit = self.get_extra_credit(student_id, course_id)
                course_grade += extra_credit
                # Cap at 100% with magic number
                course_grade = min(course_grade, 105)  # Magic number!
            
            # Apply curve if requested
            if apply_curve:
                curve_adjustment = self.calculate_curve_adjustment(course_id)
                course_grade += curve_adjustment
                course_grade = max(0, min(course_grade, 100))  # Magic numbers!
            
            # Convert to letter grade with magic numbers
            if course_grade >= 97:    # Magic number!
                letter_grade = 'A+'
                grade_points = 4.0
            elif course_grade >= 93:  # Magic number!
                letter_grade = 'A'
                grade_points = 4.0
            elif course_grade >= 90:  # Magic number!
                letter_grade = 'A-'
                grade_points = 3.7
            elif course_grade >= 87:  # Magic number!
                letter_grade = 'B+'
                grade_points = 3.3
            elif course_grade >= 83:  # Magic number!
                letter_grade = 'B'
                grade_points = 3.0
            elif course_grade >= 80:  # Magic number!
                letter_grade = 'B-'
                grade_points = 2.7
            elif course_grade >= 77:  # Magic number!
                letter_grade = 'C+'
                grade_points = 2.3
            elif course_grade >= 73:  # Magic number!
                letter_grade = 'C'
                grade_points = 2.0
            elif course_grade >= 70:  # Magic number!
                letter_grade = 'C-'
                grade_points = 1.7
            elif course_grade >= 67:  # Magic number!
                letter_grade = 'D+'
                grade_points = 1.3
            elif course_grade >= 65:  # Magic number!
                letter_grade = 'D'
                grade_points = 1.0
            else:
                letter_grade = 'F'
                grade_points = 0.0
            
            # Store course result
            final_grades[course_id] = {
                'numeric_grade': round(course_grade, 2),
                'letter_grade': letter_grade,
                'grade_points': grade_points,
                'credit_hours': course_info['credit_hours']
            }
            
            # Add to GPA calculation
            credit_hours = course_info['credit_hours']
            total_credit_hours += credit_hours
            weighted_grade_points += grade_points * credit_hours
        
        # Calculate GPA
        gpa = weighted_grade_points / total_credit_hours if total_credit_hours > 0 else 0.0
        
        return {
            'student_id': student_id,
            'semester': semester,
            'courses': final_grades,
            'gpa': round(gpa, 3),
            'total_credit_hours': total_credit_hours,
            'calculation_date': datetime.datetime.now().isoformat()
        }
    
    # Feature Envy: This method uses email_service extensively
    def send_grade_notification(self, student_id: str, grade_data: Dict):
        """Method that shows feature envy towards EmailNotificationService"""
        # Feature Envy: accessing email_service features too much
        template = self.email_service.load_template("grade_notification")
        variables = self.email_service.create_variable_map()
        
        student = self.find_student_by_id(student_id)
        self.email_service.add_variable(variables, "student_name", student['name'])
        self.email_service.add_variable(variables, "gpa", str(grade_data['gpa']))
        self.email_service.add_variable(variables, "semester", grade_data['semester'])
        
        content = self.email_service.process_template(template, variables)
        subject = self.email_service.generate_subject("Grade Report Available")
        
        self.email_service.send_email(student['email'], subject, content)
        self.email_service.log_sent_email(student['email'], "grade_notification")
        self.email_service.update_delivery_statistics("grades_sent")
    
    # Large Parameter List: Too many parameters (9 total)
    def create_student_record(self, first_name: str, last_name: str, email: str,
                            phone: str, address: str, birth_date: str,
                            emergency_contact: str, major: str, enrollment_year: int) -> Dict:
        """Create a new student record with too many parameters"""
        
        # Duplicated validation logic
        if not email or len(email) < 5 or len(email) > 100:  # Magic numbers!
            raise ValueError("Invalid email address")
        
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            raise ValueError("Email format invalid")
        
        age = self.calculate_age_from_birth_date(birth_date)
        if age < 16 or age > 70:  # Magic numbers!
            raise ValueError("Invalid age for student")
        
        if phone and (len(phone) < 10 or len(phone) > 15):  # Magic numbers!
            raise ValueError("Invalid phone number")
        
        student = {
            'student_id': self.generate_student_id(),
            'first_name': first_name,
            'last_name': last_name,
            'name': f"{first_name} {last_name}",
            'email': email,
            'phone': phone,
            'address': address,
            'birth_date': birth_date,
            'age': age,
            'emergency_contact': emergency_contact,
            'major': major,
            'enrollment_year': enrollment_year,
            'registration_date': datetime.datetime.now(),
            'status': 'active'
        }
        
        self.students.append(student)
        return student
    
    # Duplicated Code: Similar validation logic as above
    def validate_student_update(self, email: str, age: int, phone: str) -> bool:
        """Validate student update data - duplicates validation logic"""
        if not email or len(email) < 5 or len(email) > 100:  # Same magic numbers!
            return False
        
        if not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            return False
        
        if age < 16 or age > 70:  # Same magic numbers!
            return False
        
        if phone and (len(phone) < 10 or len(phone) > 15):  # Same magic numbers!
            return False
        
        return True
    
    def find_student_by_id(self, student_id: str) -> Optional[Dict]:
        """Find student by ID"""
        for student in self.students:
            if student['student_id'] == student_id:
                return student
        return None
    
    def generate_student_id(self) -> str:
        """Generate unique student ID"""
        return f"STU{len(self.students) + 1000}"  # Magic number!
    
    def calculate_age_from_birth_date(self, birth_date: str) -> int:
        """Calculate age from birth date string"""
        birth = datetime.datetime.strptime(birth_date, "%Y-%m-%d")
        today = datetime.datetime.now()
        age = today.year - birth.year
        if today.month < birth.month or (today.month == birth.month and today.day < birth.day):
            age -= 1
        return age
    
    def get_extra_credit(self, student_id: str, course_id: str) -> float:
        """Get extra credit points for student in course"""
        # Magic numbers for extra credit
        return 2.5  # Magic number!
    
    def calculate_curve_adjustment(self, course_id: str) -> float:
        """Calculate curve adjustment for course"""
        # Magic numbers for curve calculation
        return 3.0  # Magic number!
    
    # Getters for testing
    def get_students(self) -> List[Dict]:
        return self.students
    
    def get_courses(self) -> Dict:
        return self.courses
    
    def add_course(self, course_id: str, course_info: Dict):
        self.courses[course_id] = course_info


# Mock service classes to support the main class
class EmailNotificationService:
    """Mock email service"""
    def load_template(self, template_name: str) -> str:
        return f"template_{template_name}"
    
    def create_variable_map(self) -> Dict:
        return {}
    
    def add_variable(self, var_map: Dict, key: str, value: str):
        var_map[key] = value
    
    def process_template(self, template: str, variables: Dict) -> str:
        return f"processed_{template}"
    
    def generate_subject(self, subject_type: str) -> str:
        return f"Subject: {subject_type}"
    
    def send_email(self, email: str, subject: str, content: str):
        pass
    
    def log_sent_email(self, email: str, email_type: str):
        pass
    
    def update_delivery_statistics(self, stat_type: str):
        pass


class DatabaseService:
    """Mock database service"""
    pass


class ReportGenerator:
    """Mock report generator"""
    pass


class StatisticsCalculator:
    """Mock statistics calculator"""
    pass


class FileManager:
    """Mock file manager"""
    pass


class AuditLogger:
    """Mock audit logger"""
    pass


# Example usage and testing support
if __name__ == "__main__":
    # Create instance and add test data
    grade_manager = GradeManager()
    
    # Add test courses
    grade_manager.add_course("CS101", {
        'name': 'Intro to Computer Science',
        'credit_hours': 3,
        'semester': 'Fall2023'
    })
    
    grade_manager.add_course("MATH201", {
        'name': 'Calculus I',
        'credit_hours': 4,
        'semester': 'Fall2023'
    })
    
    print("Grade Management System initialized successfully!")