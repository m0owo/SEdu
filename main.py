from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from databasetest import root, commit_transaction, Assignment, Post, Submission  # Import your database-related code
from fastapi import Form
from typing import List, Dict
from pydantic import BaseModel
import json

class DiscussionCreate(BaseModel):
    course_id: int
    author: str
    posted_date: str
    posted_time: str
    content: str

class PostCommentCreate(BaseModel):
    course_id: int
    commenter: str = None
    assignment_id: int = None
    comment_date: str = None
    comment_time: str = None
    comment_text: str = None
    comment_post: int = None

class CommentCreate(BaseModel):
    course_id: int
    commenter: str = None
    assignment_id: int = None
    comment_date: str = None
    comment_time: str = None
    comment_text: str = None
    comment_post: int = None

class AssignmentUpdate(BaseModel):
    course_id: int
    assignment_id: int
    title: str = None
    description: str = None
    date: str = None
    time: str = None

class SubmissionCreate(BaseModel):
    user_id: int
    course_id: int
    assignment_id: int
    content: str = None
    submit_date: str = None
    submit_time: str = None
    score: str = None
    sent: str = True

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def read_home():
    with open("templates/loginpage.html", "r", encoding="utf-8") as file:
        html_content = file.read()
    return HTMLResponse(content=html_content)

@app.post("/home/", response_class=HTMLResponse)
async def read_login(requests: Request, student_id:str=Form(...), student_password:str=Form(...)):
    user = root.users[int(student_id)]
    if user.login_sys(student_id,student_password):
        return templates.TemplateResponse("home.html", {"request": requests, "user": user})
    raise HTTPException(status_code=404, detail="User not found")
    

@app.get("/home/", include_in_schema=False)
def redirect_home():
    with open("templates/home.html", "r", encoding="utf-8") as file:
        html_content = file.read()
    return HTMLResponse(content=html_content)

@app.get("/{user_id}", response_class=HTMLResponse)
async def read_user_home(request: Request, user_id: int):
    user = root.users[user_id]
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return templates.TemplateResponse(
        "home.html",
        {"request": request, "user": user},
    )

@app.get("/{user_id}/course/{course_id}", response_class=HTMLResponse)
async def read_user_course(request: Request, user_id: int, course_id: int):
    user = root.users[user_id]
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    course = root.courses[course_id]
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    return templates.TemplateResponse(
        "course.html",
        {"request": request, "user": user, "course": course},
    )

@app.get("/{user_id}/course/{course_id}/assignment/{assignment_id}", response_class=HTMLResponse)
async def read_user_assignment(request: Request, user_id: int, course_id: int, assignment_id: int):
    user = root.users[user_id]
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    course = root.courses[course_id]
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    assignment = root.assignments[assignment_id]
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")

    return templates.TemplateResponse(
        "assignment.html",
        {"request": request, "user": user, "course": course, "assignment": assignment},
    )

@app.get("/students/{user_id}")
async def findStudent(user_id: int):
    if user_id in root.users.keys():
        return root.users[user_id]
    else:
        return {"error": "Student not found"}

@app.get("/course/", response_class=HTMLResponse)
async def read_course():
    with open("templates/course.html", "r", encoding="utf-8") as file:
        html_content = file.read()
    return HTMLResponse(content=html_content)

@app.get("/assignment/", response_class=HTMLResponse)
async def read_course():
    with open("templates/assignment.html", "r", encoding="utf-8") as file:
        html_content = file.read()
    return HTMLResponse(content=html_content)

@app.post("/create-new-assignment/{course_id}")
async def create_new_assignment(course_id: int):
    course = root.courses.get(course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    assignment_id = int(str(course_id) + "001")

    # Check if the assignment_id already exists
    while assignment_id in root.assignments:
        assignment_id += 1

    new_assignment = Assignment(assignment_id, "New Assignment", "11/01/2023", "12:00 AM", "1/1/2024", "11:59 PM", "Description Here")
    root.assignments[assignment_id] = new_assignment
    root.courses[course_id].addAssignment(root.assignments[assignment_id])

    return new_assignment

@app.post("/post-new-discussion/{course_id}")
async def post_new_discussion(course_id: int, discussion_data: DiscussionCreate):
    try:
        print(discussion_data.__dict__)
        print(discussion_data.author)
        print(discussion_data.posted_time)
        print(discussion_data.posted_date)
        course = root.courses.get(course_id)
        if course is None:
            raise HTTPException(status_code=404, detail="Course not found")
        
        discussion_id = int(str(course_id) + "100")
        # check if the post_id already exists
        while discussion_id in root.posts:
            discussion_id += 1
        new_discussion = Post(
            author = discussion_data.author,
            posted_date = discussion_data.posted_date,
            posted_time = discussion_data.posted_time,
            content = discussion_data.content
        )
        root.posts[discussion_id] = new_discussion
        root.courses[course_id].addPost(root.posts[discussion_id])
        return JSONResponse(content={"message": "Discussion created successfully"})
    except Exception as e:
        import traceback
        traceback.print_exc()  # or use logger.error(traceback.format_exc())
        return JSONResponse(status_code=500, content={"message": "Internal Server Error"})
    
@app.post("/post-new-reply/{course_id}")
async def post_new_comment(course_id: int, comment_data: PostCommentCreate):
    course = root.courses.get(course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    discussion_id = int(str(course_id) + str(100 + comment_data.comment_post))
    root.posts[discussion_id].addComment(comment_data.commenter, comment_data.comment_date, comment_data.comment_time, comment_data.comment_text)
    return JSONResponse(content={"message": "Comment Posted Successfully"})

@app.post("/post-new-assignment-comment/")
async def post_new_comment(comment_data: PostCommentCreate):
    course = root.courses.get(comment_data.course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    assignment_db = root.assignments.get(comment_data.assignment_id)
    if assignment_db is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    

    if (comment_data.commenter and comment_data.comment_date and comment_data.comment_time and comment_data.comment_text):
        comment = {"commenter": comment_data.commenter,
                   "comment_date": comment_data.comment_date,
                   "comment_time":comment_data.comment_time,
                   "text": comment_data.comment_text,
                   }
    
    assignment_db.individual_comments.append(comment)
    return comment

@app.post("/edit-assignment/")
async def edit_assignment(assignment: AssignmentUpdate):
    course = root.courses.get(assignment.course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    assignment_db = root.assignments.get(assignment.assignment_id)
    if assignment_db is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    if assignment.title:
        assignment_db.title = assignment.title

    if assignment.description:
        assignment_db.description = assignment.description

    if assignment.date:
        assignment_db.due_date = assignment.date

    if assignment.time:
        assignment_db.due_time = assignment.time

    root.assignments[assignment.assignment_id] = assignment_db

    return root.assignments[assignment.assignment_id]

@app.post("/post-submission/")
async def post_new_comment(submission: SubmissionCreate):
    user = root.users.get(submission.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    course = root.courses.get(submission.course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    assignment = root.assignments.get(submission.assignment_id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if (submission.content and submission.submit_date and submission.submit_time):
        new_submission = Submission(submission.user_id, submission.course_id, submission.assignment_id, submission.content, submission.submit_date, submission.submit_time)

    #if user already submitted before, resubmit
    submissions = root.assignments[submission.assignment_id].submissions
    submitted = True
    for i in range(len(submissions)):
        print(submissions[i].content)
        if submissions[i].user_id == submission.user_id:
            submissions[i] = new_submission #replace old submission
            break
        else:
            submitted = False
    if not submitted or len(submissions) == 0: #not submitted or if submissions are empty
        root.assignments[submission.assignment_id].addSubmission(new_submission)
    return new_submission


@app.on_event("shutdown")
def shutdown_event():
    commit_transaction()  # Commit the transaction on shutdown
