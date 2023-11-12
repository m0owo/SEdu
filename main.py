from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from databasetest import root, commit_transaction  # Import your database-related code
from fastapi import Form


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
    user = root.students[user_id]
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return templates.TemplateResponse(
        "home.html",
        {"request": request, "user": user},
    )

@app.get("/students/{user_id}")
async def findStudent(user_id: int):
    if user_id in root.students.keys():
        return root.students[user_id]
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

@app.on_event("shutdown")
def shutdown_event():
    commit_transaction()  # Commit the transaction on shutdown
