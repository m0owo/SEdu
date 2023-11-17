import ZODB, ZODB.FileStorage
import BTrees._OOBTree
import transaction
import persistent
from fastapi import Form
from typing import Union


storage = ZODB.FileStorage.FileStorage('mydata.fs')
db = ZODB.DB(storage)
connection = db.open()
root = connection.root

if not hasattr(root, "tokens"):
    root.tokens = {}

def commit_transaction():
    transaction.commit()

def getAssignmentByID(assignment_id):
    return root.assignments.get(assignment_id, None)

class Course(persistent.Persistent):
    def __init__(self, id, name = "", description = "", teacherName = "", credit = 0):
        super().__init__()
        self.id = id
        self.name = name
        self.description = description
        self.teacherName = teacherName
        self.credit = credit
        self.timeList = persistent.list.PersistentList()
        self.gradeScheme = {
            "A" : 90,
            "B+" : 85,
            "B" : 80,
            "C+" : 75,
            "C" : 70, 
            "D+" : 65,
            "D" : 60,
            "F" : 55
        }
        self.courseWeights = {
            "attendance" : 0,
            "assignment" : 10,
            "lab" : 10,
            "project": 10,
            "midterm": 30,
            "final": 30
        }
        self.assignments = persistent.list.PersistentList()
        self.posts = persistent.list.PersistentList()

    def setName(self, name):
        self.name = name
    
    def getCredit(self):
        return self.credit
    
    def getId(self):
        return self.id
    
    def getName(self):
        return self.name
    
    def setCourseWeights(self, courseWeights:dict):
        self.courseWeights = courseWeights
    
    def getCourseWeights(self):
        return self.courseWeights

    def setGradeScheme(self, gradeScheme:dict):
        self.gradeScheme = gradeScheme
    
    def getGradeScheme(self):
        return self.gradeScheme

    def addAssignment(self, Assignment):
        self.assignments.append(Assignment)
        return Assignment
    
    def addPost(self, Post):
        self.posts.append(Post)
        return Post

    def addTimeTable(self, day, starttime, endtime, type):
        timeDict = {"day" : day, "starttime" : starttime, "endtime" : endtime, "type" : type}
        self.timeList.append(timeDict)
        return self.timeList
    
    def calculateLabScore(self):
        self.lab_score = sum(lab.getScore() for lab in self.labs)
        return self.lab_score
    
    def calculateAttendanceScore(self):
        # Assuming each attendance counts as 1 point
        self.attendance_score = sum(1 for attendance in self.attendances if attendance.isAttended())
        return self.attendance_score
    
    def calculateAssignmentScore(self):
        self.assignment_score = sum(assignment.getScore()/assignment.totalGrade() for assignment in self.assignments)
        return self.assignment_score
    
    def printStudents(self):
        for student in self.students:
            print(student.id)
    
    def __str__(self):
        return f"ID: {self.id} Course Name: {self.name.ljust(30)}, Credit {self.credit}"
    
    def printDetail(self):
        print(self.__str__())
    
    def printScoreDetail(self):
        print("Score")
        print(f"Midterm: {self.midterm_score}, Final: {self.final_score}")
        print(f"Assignmnet: {self.calculateAssignmentScore()}, Lab: {self.calculateLabScore()}, Attendence: {self.calculateAttendanceScore()}")
 
class User(persistent.Persistent):
    def __init__(self, id, name, password, role):
        self.enrolls = persistent.list.PersistentList()
        self.id = id
        self.name = name
        self.password = password
        self.role = role

    def getName(self):
        return self.name
    
    def getId(self):
        return self.id

    def setEnrolls(self, enrolls):
        self.enrolls = enrolls

    def enrollCourse(self, course):
        print(f"Enrolling in course {course.getName()}")
        enrollment = Enrollment(course)
        self.enrolls.append(enrollment)
        return enrollment

    def getRole(self):
        return self.role
    
    def getEnrollment(self, Course):
        if Course in self.enrolls:
            return Course
        return None
    
    def __str__(self):
        return f"ID: {self.id:8} Name {self.name}"
    

    def calculateGPA(self):
        self.credit = 0
        self.totalCredit = 0
        for c in self.enrolls:

            self.grade = c.getGrade()
            if self.grade == "A":
                self.num = 4
            elif self.grade == "B":
                self.num = 3
            elif self.grade == "C":
                self.num = 2
            elif self.grade == "D":
                self.num = 1

            self.credit += c.getCourse().getCredit() * self.num
            self.totalCredit += c.getCourse().getCredit()
            
        return (self.credit/self.totalCredit)
    
    def printAllAssignments(self):
        print(f"Assignments for Student: {self.name} (ID: {self.id})")
        for enrollment in self.enrolls:
            course = enrollment.getCourse()
            print(f"  Course: {course.name}")
            for assignment in course.assignments:
                print(f"    Assignment: {assignment.title}")
                for submission in enrollment.submissions:
                    if submission.assignment_id == assignment.id:
                        print(f"      Submission: {submission.content}, Score: {submission.score}")

    def printSubmissions(self):
        for enrollment in self.enrolls:
            course = enrollment.getCourse()
            for submission in enrollment.submissions:
                assignment = getAssignmentByID(submission.assignment_id)
                if submission.student_id == self.id:
                    print(f"Course: {course.name}, Assignment ID: {assignment.id}, Submission Details: {submission.content}, Submission Time: {submission.submit_date} {submission.submit_time}, Score: {submission.score}/{assignment.total_score}")
    
    def printEnrollments(self):
        print(self.__str__())
        for c in self.enrolls:
            c.printDetail()

    def setName(self,name):
        self.name = name
    
    def login_sys(self, student_id, student_password):
        return str(student_id) == str(self.id) and str(student_password) == str(self.password)
    
    def getstudentID(self):
        return self.id
    
    def getRole(self):
        return self.role
    
class Enrollment(persistent.Persistent):
    def __init__(self, course):
        self.course = course
        self.submissions = persistent.list.PersistentList()
        self.scores = { 
            "attendance" : 0,
            "assignment" : 0,
            "lab" : 0,
            "project" : 0,
            "midterm" : 0,
            "final" : 0
        }
        self.grade = "F"

    def getCourse(self):
        return self.course
    
    def getGrade(self):
        return self.grade
    
    def getScores(self):
        return self.scores
    
    def setScores(self, scores:dict):
        self.scores = scores

    def setAssignmentScore(self, assignment_id, score):
        for submission in self.submissions:
            if submission.assignment_id == assignment_id:
                submission.score = score
                break

    def submitAssignment(self, Submission):
        self.submissions.append(Submission)
        Submission.sent = True
        # Assuming you have a way to get the assignment object
        assignment_object = getAssignmentByID(Submission.assignment_id)
        assignment_object.addSubmission(Submission)

    def __str__(self):
        course_str = str(self.course)  # Call the __str__ method of the Course class
        weights_str = "Weights not available"

        if hasattr(self.course, 'getCourseWeights') and callable(getattr(self.course, 'getCourseWeights')):
            weights_str = self.course.getCourseWeights()

        return f"Course: {course_str} Weights: {weights_str} Scores: {self.scores}"


    
    def printDetail(self):
        print(self.__str__())

class Assignment(persistent.Persistent):
    def __init__(self, id, title, assign_date, assign_time, due_date, due_time, description):
        self.id = id
        self.title = title  # The title of the assignment
        self.assign_date = assign_date  # The date when the assignment is assigned
        self.assign_time = assign_time
        self.due_date = due_date  # The due date for the assignment
        self.due_time = due_time
        self.description = description  # Description of the assignment (text, instructions, etc.)
        self.student_id = 0
        self.total_score = 0
        
        self.files = persistent.list.PersistentList()
        self.submissions = persistent.list.PersistentList()
        self.individual_comments = persistent.list.PersistentList() # Dictionary with student_id as key and their individual comments as value

    def addSubmission(self, submission):
        self.submissions.append(submission)
        return self.submissions
    
    def addFile(self, File):
       self.files.append(File)
       return File

    def get_files_data(self):
        return [{'path': file_info['path'], 'type': file_info['type']} for file_info in self.files]
    
    def setTotalScore(self, totalGrade):
        self.total_score = totalGrade

    def addIndividualComment(self, commenter, comment_date, comment_time, comment_text=None):
        comment = {"commenter": commenter, "comment_date": comment_date, "comment_time":comment_time, "text": comment_text}
        self.individual_comments.append(comment)
        return self.individual_comments

    def addclassComment(self, commenter, comment_date, comment_time, comment_text=None):
        comment = {"commenter": commenter, "comment_date": comment_date, "comment_time":comment_time, "text": comment_text}
        self.class_comments.append(comment)
        return self.class_comments
    
    def __str__(self):
        return f"Homework: {self.title}, Assign date: {self.assign_date} {self.assign_time} Due date: {self.due_date} {self.due_time}, Description: {self.description}"
    
    def printAssignmentDetail(self):
        print(self.__str__())
    
    def printIndividualComment(self):
        for comment in self.individual_comments:
            print(f"Commenter:  {comment['commenter']}, Comment: {comment['text']}")

    def printClassComment(self):
        for comment in self.class_comments:
            print(f"Commenter:  {comment['commenter']}, Comment: {comment['text']}")

class Submission(persistent.Persistent):
    def __init__(self, user_id, course_id, assignment_id, content, submit_date, submit_time):
        self.user_id = user_id
        self.course_id = course_id
        self.assignment_id = assignment_id
        self.content = content
        self.submit_date = submit_date
        self.submit_time = submit_time 
        self.score = None
        self.sent = True

class Post(persistent.Persistent):
    def __init__(self, author, posted_date, posted_time, content):
        self.author = author  # The author of the post (teacher or student)
        self.posted_date = posted_date  # The date when the post was created
        self.posted_time = posted_time
        self.content = content  # The content of the post (text, links, files, etc.)
        self.classroom_comments = persistent.list.PersistentList()  # List of comments on the post (textual comments)

    def addComment(self, commenter, comment_date, comment_time, comment_text=None):
        comment = {"commenter": commenter, "comment_date": comment_date, "comment_time":comment_time, "text": comment_text}
        self.classroom_comments.append(comment)
        return self.classroom_comments
    
    def __str__(self):
        return f"Author: {self.author}, Date: {self.posted_date} {self.posted_time}, Content: {self.content}"
    
    def to_dict(self):
        return {
            "author": self.author,
            "posted_date": self.posted_date,
            "posted_time": self.posted_time,
            "content": self.content,
            "classroom_comments": list(self.classroom_comments),
        }
    
    def printPost(self):
        print(self.__str__())

class File(persistent.Persistent):
    def __init__(self, file_name, file_path, file_owner):
        self.file_name = file_name
        self.file_path = file_path
        self.file_owner = file_owner
    
    def getFileName(self):
        return self.file_name

class Allstudent(persistent.Persistent):
    def __init__(self):
        self.student = persistent.list()
    
    def add_student(self, Student):
        self.student.append(Student)

# Initialize Example Courses
root.courses = BTrees.OOBTree.BTree()
root.courses[101] = Course(101, 'Computer Programming', 'Learn C++', 'Lecturer 1 Name', 4)
root.courses[101].addTimeTable('Saturday', '1:00 PM', '4:00 PM', 'Lecture')
root.courses[101].addTimeTable('Friday', '1:00 PM' , '4:00 PM', 'Lab')

# root.courses[101].setGradeScheme(grading)
root.courses[102] = Course(102, 'Web Programming', 'HTML, CSS, JS & more', 'Lecturer 1 Name', 4)
root.courses[102].addTimeTable('Saturday', '9:00 AM', '12:00 PM', 'Lecture')
root.courses[102].addTimeTable('Thursday', '5:00 PM' , '7:00 PM', 'Lab')
root.courses[102].addTimeTable('Friday', '9:00 PM' , '10:00 PM', 'Lab')
root.courses[102].addTimeTable('Friday', '11:00 PM' , '11:30 AM', 'Lab')
# root.courses[201].setGradeScheme(grading)
root.courses[103] = Course(103, 'Software Engineering Principles', 'Lets Learn Principles', 'Lecturer 2 Name', 5)
root.courses[103].addTimeTable('Monday', '9:00 AM' ,'12:00 PM', 'Lecture')
root.courses[103].addTimeTable('Wednesday', '1:00 PM', '4:00 PM', 'Lab')
root.courses[103].addTimeTable('Saturday', '11:30 PM' , '12:00 AM', 'Lecture')
# root.courses[202].setGradeScheme(grading_se)
root.courses[104] = Course(104, 'Artificial Intelligence', 'Lets Learn AI', 'Lecturer 2 Name', 3)
root.courses[104].addTimeTable('Monday', '9:00 AM' ,'12:00 PM', 'Lecture')
root.courses[104].addTimeTable('Wednesday', '1:00 PM', '4:00 PM', 'Lab')
root.courses[104].addTimeTable('Thursday', '7:30 PM' , '8:00 PM', 'Lab')
# root.courses[301].setGradeScheme(grading_ai)
root.courses[105] = Course(105, 'Professional Communication', 'Professional Communication', 'Lecturer 3 Name', 3)
root.courses[105].addTimeTable('Tuesday', '9:00 AM' ,'12:00 PM', 'Lecture')

root.courses[106] = Course(106, 'Charm School', 'Have Fun At Charm School!', 'Lecturer 3 Name', 3)
root.courses[106].addTimeTable('Tuesday', '12:00 PM' ,'4:00 PM', 'Lecture')


#Initialize student info and enroll courses
root.users = BTrees.OOBTree.BTree()

root.users[1101] = User(1101, 'Miki Ajiki', "1111", "student")

s1_id = root.users[1101].id
root.users[1101].enrollCourse(root.courses[102])
s1_enroll1 = root.users[1101].enrollCourse(root.courses[103])
s1_enroll2 = root.users[1101].enrollCourse(root.courses[104])
s1_enroll3 = root.users[1101].enrollCourse(root.courses[105])
s1_enroll4 = root.users[1101].enrollCourse(root.courses[106])

root.users[1102] = User(1102, 'Putter Something', "1111", "student")
root.users[1102].enrollCourse(root.courses[101])
root.users[1102].enrollCourse(root.courses[102])
root.users[1102].enrollCourse(root.courses[103])
root.users[1102].enrollCourse(root.courses[104])

root.users[1103] = User(1103, 'Music Auyeung', "1111", "student")
root.users[1103].enrollCourse(root.courses[102])
root.users[1103].enrollCourse(root.courses[103])
root.users[1103].enrollCourse(root.courses[104])
root.users[1103].enrollCourse(root.courses[105])

print("printing all enrollments")
root.users[1103].printEnrollments()
print()


#Initialize teacher info and enroll courses
root.users[1104] = User(1104, 'Lecturer 1 Name', "1111", "teacher")
t1_enroll1 = root.users[1104].enrollCourse(root.courses[101])
t2_enroll2 = root.users[1104].enrollCourse(root.courses[102])

root.users[1105] = User(1105, 'Lecturer 2 Name', "1111", "teacher")
root.users[1105].enrollCourse(root.courses[103])
root.users[1105].enrollCourse(root.courses[104])

root.users[1106] = User(1106, 'Lecturer 3 Name', "1111", "teacher")
root.users[1106].enrollCourse(root.courses[105])
root.users[1106].enrollCourse(root.courses[106])

#Teacher Assign homework to student
root.assignments = BTrees.OOBTree.BTree()
root.assignments[101001] = Assignment(101001,"Homework1 turtle", "11/01/2023", "12:00 AM", "11/21/2023", "11:59 PM", "Create a house by using turtle")
root.courses[101].addAssignment(root.assignments[101001]).setTotalScore(100)
root.assignments[101001].addFile(File("python_06.pdf", "upload", root.users[1104].name))
root.assignments[102001] = Assignment(102001,"Project amazing", "11/01/2023", "12:00 AM", "11/21/2023", "11:59 PM", "Do your SE website")
root.courses[102].addAssignment(root.assignments[102001])
root.assignments[102002] = Assignment(102002,"project late na", "11/01/2023", "12:00 AM", "11/20/2023", "11:59 PM", "this project is late")
root.courses[102].addAssignment(root.assignments[102002])

# Testing Student 1102 submits homework at course 101, assignment 101001
root.submissions = BTrees.OOBTree.BTree()
root.submissions[1001] = Submission(1102, 101, root.assignments[101001].id, "main.py", "2023-11-11", "12:00 PM")
root.assignments[101001].addSubmission(root.submissions[1001])

#Adding comment in Assginment
root.assignments[101001].addIndividualComment(root.users[1104].name, "11/01/2023", "1:00 AM", "Make sure you sent it in zip file")
root.assignments[101001].addIndividualComment(root.users[1101].name, "11/01/2023", "1:11 AM", "I already resent my work. Can you check")

# root.assignments[101001].printIndividualComment()
#Set score to student assignment
# s1_enroll1.setAssignmentScore(root.assignments[101001].id, 95)

#Crete Post
root.posts = BTrees.OOBTree.BTree()
root.posts[102100] = Post(root.users[1104].name, "11/01/2023", "12:00 AM", "Sorry for the slight delay on the lecture, our lab will be on next Tuesday") 
root.posts[102100].addComment(root.users[1101].name, "11/01/2023", "1:00 AM", "Alright, thank you.")
root.courses[102].addPost(root.posts[102100])
root.posts[102101] = Post(root.users[1101].name, "24/01/2023", "12:00 AM", "Can you repost the lecture slides?") 
root.courses[102].addPost(root.posts[102101])


transaction.commit()

if  __name__ == "__main__":
    courses = root.courses
    for c in courses:
        course = courses[c]
        course.printDetail()
    print()

    assignments = root.assignments
    for a in assignments:
        assignment = assignments[a]
        assignment.printAssignmentDetail()
        assignment.printIndividualComment()
    print()

    # students = root.users
    # for s in students:
    #     if s.role == 'student':
    #         student = students[s]
    #         student.printEnrollment()
    #         student.printSubmissions()
    #         student.printAllAssignments()
    # print()

    posts = root.posts
    for p in posts:
        post = posts[p]
        post.printPost()
