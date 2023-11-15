import ZODB, ZODB.FileStorage
import BTrees._OOBTree
import transaction
import persistent
from fastapi import Form
import uuid
import time
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
        self.gradeScheme = persistent.list.PersistentList()
        self.labs = persistent.list.PersistentList()
        self.attendances = persistent.list.PersistentList()
        self.assignments = persistent.list.PersistentList()
        self.posts = persistent.list.PersistentList()
        self.students = persistent.list.PersistentList()

        self.assignment_score = 0
        self.lab_score = 0
        self.attendance_score = 0

        self.midterm_total_score = 0
        self.final_total_score = 0
        self.project_total_score = 0


    def setName(self, name):
        self.name = name
    
    def getCredit(self):
        return self.credit
    
    def getId(self):
        return self.id
    
    def getName(self):
        return self.name
    
    def ScoreGrading(self, score):
        for key in self.gradeScheme:
            if  key["min"]<= score < key["max"]:
                return key["Grade"]
            
    def setGradeScheme(self, grade_list):
        self.gradeScheme = grade_list

    def setMidtermTotalScore(self, score):
        self.midterm_total_score = score

    def setFinalTotalScore(self, score):
        self.final_total_score = score

    def setProjectTotalScore(self, score):
        self.project_total_score = score

    def addAssignment(self, Assignment):
        self.assignments.append(Assignment)
        return Assignment
    
    def addPost(self, Post):
        self.posts.append(Post)
        return Post
    
    def addStudent(self, User):
        self.students.append(User)
        return User
    
    def printStudents(self):
        for student in self.students:
            print(student.__str__())
    
    # def addLab(self, week, score):
    #     self.labs.append(Lab(week, score))

    # def recordAttendance(self, week, attended):
    #     self.attendances.append(Attendance(week, attended))
    
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
    
    def calculateOverallScore(self, gradingScheme):
        """
        gradingScheme is a dict like:
        {
            "midterm": 25,
            "final": 40,
            "lab": 15,
            "project": 15,
            "attendance": 5
        }
        """

        total_score = (
            self.midtermScore * gradingScheme["midterm"] / 100 +
            self.finalScore * gradingScheme["final"] / 100 +
            self.calculateLabScore() * gradingScheme["lab"] / 100 +
            self.projectScore * gradingScheme["project"] / 100 +
            self.calculateAttendanceScore * gradingScheme["attendance"] / 100 +
            self.calculateAssignmentScore * gradingScheme["assignment"] / 100
        )
        return total_score
    
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
    
    def enrollCourse(self, Course):
        student = User(self.id, self.name, self.password, self.role)
        x = Enrollment(Course)
        if (self.getRole() == "student"):
            Course.addStudent(student)
        self.enrolls.append(x)
        return x
    
    def getRole(self):
        return self.role
    
    def getEnrollment(self,Course):
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
                    print(f"Course: {course.name}, Assignment ID: {assignment.id}, Submission Details: {submission.content}, Submission Time: {submission.summit_date} {submission.summit_time}, Score: {submission.score}/{assignment.total_score}")
    
    def printEnrollment(self):
        print(self.__str__())
        for c in self.enrolls:
            c.printDetail()
        
        # print("Total GPA is: " + "{:.2f}".format(self.calculateGPA()))

    def setName(self,name):
        self.name = name
    
    def login_sys(self, student_id, student_password):
        return str(student_id) == str(self.id) and str(student_password) == str(self.password)
    
    def getstudentID(self):
        return self.id
    
class Enrollment(persistent.Persistent):
    def __init__(self,course,score = 0):
        self.course = course
        self.submissions = persistent.list.PersistentList()
        self.midterm_score = 0
        self.final_score = 0
        self.project_score = 0

    def getCourse(self):
        return self.course
    
    def getGrade(self):
        return str( self.course.ScoreGrading(self.getScore()))
    
    def getScore(self):
        return self.score 
    
    def setMidtermTotalScore(self, score):
            self.midterm_total_score = score

    def setFinalTotalScore(self, score):
        self.final_total_score = score

    def setProjectTotalScore(self, score):
        self.project_total_score = score

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
        return f"{self.course}"
    # return f"{self.course}, Score: {self.getScore()}, Grade:{self.getGrade()}"
    
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

        self.submissions = persistent.list.PersistentList()
        self.individual_comments = persistent.list.PersistentList() # Dictionary with student_id as key and their individual comments as value
        self.class_comments = persistent.list.PersistentList() # List of class-wide comments

    def addSubmission(self, submission):
        self.submissions.append(submission)
        return self.submissions
    
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
    def __init__(self, student_id, assignment_id, content, summit_date, summit_time):
        self.student_id = student_id
        self.assignment_id = assignment_id
        self.content = content
        self.summit_date = summit_date
        self.summit_time = summit_time 
        self.score = None
        self.sent = False

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
        for comment in self.classroom_comments:
            print(f"Commenter:  {comment['commenter']}, Comment: {comment['text']}", )

class Token(persistent.Persistent):
    def __init__(self, user:User):
        self.user = user
        self.token = uuid.uuid4().hex
        self.expire = time.time() + 3600 #Expires in 1 hour

    def getUser(self):
        return self.user
    
    def getToken(self):
        return self.token
    
    
    def checkToken(self, token):
        if self.token == token:
            if (time.time() < self.expire):
                self.expire = time.time() + 3600
                return True
        return False
    
    def validateToken(self, token) -> Union[User, None]:  
        if self.checkToken(token):
            return self.user
        return None
    
    def str(self):
        return self.token

    def __repr__(self):
        return f"<Token {self.token} for {self.user.name}>"


root.courses = BTrees.OOBTree.BTree()
root.courses[101] = Course(101, 'Computer Programming', 'Learn C++', 'John Morris', 4)
# root.courses[101].setGradeScheme(grading)
root.courses[201] = Course(201, 'Web Programming', 'HTML, CSS, JS & more', 'Visit Hirankitti', 4)
# root.courses[201].setGradeScheme(grading)
root.courses[202] = Course(202, 'Software Engineering Principles', 'Lets Learn Principles', 'Visit Hirankitti', 5)
# root.courses[202].setGradeScheme(grading_se)
root.courses[301] = Course(301, 'Artificial Intelligence', 'Lets Learn AI', 'Visit Hirankitti', 3)
# root.courses[301].setGradeScheme(grading_ai)

#Initialize student info and enroll courses
root.users = BTrees.OOBTree.BTree()
root.users[1101] = User(1101, 'Moomoo', "1111", "student")
s1_id = root.users[1101].id
s1_enroll1 = root.users[1101].enrollCourse(root.courses[101])
s1_enroll2 = root.users[1101].enrollCourse(root.courses[201])
s1_enroll3 = root.users[1101].enrollCourse(root.courses[202])
s1_enroll4 = root.users[1101].enrollCourse(root.courses[301])

#Initialize teacher info and enroll courses
root.users[1111] = User(1111, 'Visit Hirankitti', "0101", "teacher")
t1_enroll1 = root.users[1111].enrollCourse(root.courses[201])
t2_enroll2 = root.users[1111].enrollCourse(root.courses[202])
t3_enroll3 = root.users[1111].enrollCourse(root.courses[301])

# root.courses[201].addStudent(root.users[1101])
# print("All students")
# root.courses[201].printStudents()
# root.courses[202].addStudent(root.users[1101])
# root.courses[301].addStudent(root.users[1101])

#Teacher Assign homework to student
root.assignments = BTrees.OOBTree.BTree()
root.assignments[101001] = Assignment(101001,"Homework1 turtle", "11/01/2023", "12:00 AM", "11/15/2023", "11:59 PM", "Create a house by using turtle")
root.courses[101].addAssignment(root.assignments[101001]).setTotalScore(100)
root.assignments[201001] = Assignment(201001,"Project amazing", "11/01/2023", "12:00 AM", "11/20/2023", "11:59 PM", "Do your SE website")
root.courses[201].addAssignment(root.assignments[201001])
root.assignments[201002] = Assignment(201002,"project late na", "11/01/2023", "12:00 AM", "11/12/2023", "11:59 PM", "this project is late")
root.courses[201].addAssignment(root.assignments[201002])

# Student submits homework
root.submissions = BTrees.OOBTree.BTree()
root.submissions[1000] = Submission(s1_id, root.assignments[101001].id, "main.py", "2023-11-11", "12:00 PM")
s1_enroll1.submitAssignment(root.submissions[1000])

#Adding comment in Assginment
root.assignments[101001].addIndividualComment(root.users[1111].name, "11/01/2023", "1:00 AM", "Make sure you sent it in zip file")
root.assignments[101001].addIndividualComment(root.users[1101].name, "11/01/2023", "1:11 AM", "I already resent my work. Can you check")

# root.assignments[101001].printIndividualComment()
#Set score to student assignment
# s1_enroll1.setAssignmentScore(root.assignments[101001].id, 95)

#Crete Post
root.posts = BTrees.OOBTree.BTree()
root.posts[201100] = Post(root.users[1111].name, "11/01/2023", "12:00 AM", "Sorry for the slight delay on the lecture, our lab will be on next Tuesday") 
root.posts[201100].addComment(root.users[1101].name, "11/01/2023", "1:00 AM", "Alright, thank you.")
root.courses[201].addPost(root.posts[201100])
root.posts[201101] = Post(root.users[1101].name, "24/01/2023", "12:00 AM", "Can you repost the lecture slides?") 
root.courses[201].addPost(root.posts[201101])


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
