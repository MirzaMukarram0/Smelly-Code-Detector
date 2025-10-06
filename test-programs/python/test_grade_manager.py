"""
Unit tests for GradeManager
These tests pass despite the code smells in the main class
"""

import unittest
from datetime import datetime
from grade_manager import GradeManager


class TestGradeManager(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.grade_manager = GradeManager()
        
        # Add test courses
        self.grade_manager.add_course("CS101", {
            'name': 'Intro to Computer Science',
            'credit_hours': 3,
            'semester': 'Fall2023'
        })
        
        self.grade_manager.add_course("MATH201", {
            'name': 'Calculus I',
            'credit_hours': 4,
            'semester': 'Fall2023'
        })
        
        # Add test assignments
        self.grade_manager.assignments = {
            "CS101": {
                'homework': [
                    {'grades': {'STU1001': 85, 'STU1002': 92}},
                    {'grades': {'STU1001': 78, 'STU1002': 88}},
                    {'grades': {'STU1001': 90, 'STU1002': 95}}
                ],
                'quizzes': [
                    {'grades': {'STU1001': 88, 'STU1002': 90}},
                    {'grades': {'STU1001': 82, 'STU1002': 94}}
                ],
                'exams': [
                    {'type': 'midterm', 'grades': {'STU1001': 85, 'STU1002': 89}},
                    {'type': 'final', 'grades': {'STU1001': 87, 'STU1002': 91}}
                ]
            }
        }
        
        # Add attendance data
        self.grade_manager.attendance = {
            "CS101": {'STU1001': 92, 'STU1002': 96}
        }
    
    def test_create_student_record_valid_data(self):
        """Test creating a student record with valid data."""
        student = self.grade_manager.create_student_record(
            "John", "Doe", "john.doe@email.com", "1234567890",
            "123 Main St", "2000-01-15", "Jane Doe (555-0123)",
            "Computer Science", 2023
        )
        
        self.assertIsNotNone(student)
        self.assertEqual(student['first_name'], "John")
        self.assertEqual(student['last_name'], "Doe")
        self.assertEqual(student['email'], "john.doe@email.com")
        self.assertEqual(student['major'], "Computer Science")
        self.assertTrue(student['student_id'].startswith("STU"))
        self.assertEqual(len(self.grade_manager.get_students()), 1)
    
    def test_create_student_record_invalid_email(self):
        """Test creating a student record with invalid email."""
        with self.assertRaises(ValueError):
            self.grade_manager.create_student_record(
                "Jane", "Smith", "invalid-email", "1234567890",
                "456 Oak Ave", "1999-05-20", "John Smith (555-0456)",
                "Mathematics", 2022
            )
    
    def test_create_student_record_invalid_age(self):
        """Test creating a student record with invalid age."""
        with self.assertRaises(ValueError):
            self.grade_manager.create_student_record(
                "Bob", "Wilson", "bob@email.com", "1234567890",
                "789 Pine St", "2010-03-10", "Alice Wilson (555-0789)",
                "Physics", 2023
            )
    
    def test_validate_student_update_valid_data(self):
        """Test validating student update with valid data."""
        result = self.grade_manager.validate_student_update("valid@email.com", 20, "1234567890")
        self.assertTrue(result)
    
    def test_validate_student_update_invalid_email(self):
        """Test validating student update with invalid email."""
        result = self.grade_manager.validate_student_update("", 20, "1234567890")
        self.assertFalse(result)
        
        result = self.grade_manager.validate_student_update("invalid", 20, "1234567890")
        self.assertFalse(result)
    
    def test_validate_student_update_invalid_age(self):
        """Test validating student update with invalid age."""
        result = self.grade_manager.validate_student_update("valid@email.com", 15, "1234567890")
        self.assertFalse(result)
        
        result = self.grade_manager.validate_student_update("valid@email.com", 75, "1234567890")
        self.assertFalse(result)
    
    def test_calculate_final_grades_valid_student(self):
        """Test calculating final grades for a valid student."""
        # First create a student
        student = self.grade_manager.create_student_record(
            "Alice", "Johnson", "alice@email.com", "5551234567",
            "321 Elm St", "2001-08-12", "Bob Johnson (555-9876)",
            "Computer Science", 2023
        )
        
        # Calculate grades
        result = self.grade_manager.calculate_final_grades(
            student['student_id'], 
            "Fall2023"
        )
        
        self.assertIsNotNone(result)
        self.assertEqual(result['student_id'], student['student_id'])
        self.assertEqual(result['semester'], "Fall2023")
        self.assertIn('courses', result)
        self.assertIn('gpa', result)
        self.assertIsInstance(result['gpa'], float)
        self.assertGreaterEqual(result['gpa'], 0.0)
        self.assertLessEqual(result['gpa'], 4.0)
    
    def test_calculate_final_grades_invalid_student_id(self):
        """Test calculating final grades with invalid student ID."""
        with self.assertRaises(ValueError):
            self.grade_manager.calculate_final_grades("", "Fall2023")
        
        with self.assertRaises(ValueError):
            self.grade_manager.calculate_final_grades("INVALID_ID", "Fall2023")


if __name__ == '__main__':
    unittest.main()