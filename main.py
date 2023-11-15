from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from databasetest import root, commit_transaction, Token, User  # Import your database-related code
from fastapi import Form, Header


app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def read_login():
    with open("templates/loginpage.html", "r", encoding="utf-8") as file:
        html_content = file.read()
    return HTMLResponse(content=html_content)

async def getHeader(request: Request):
    headers = request.headers
    print("Incoming Headers:", headers)

    authorization_header = request.headers.get('Authorization')
    if authorization_header != None :
        print(authorization_header)
        parts = authorization_header.split(' ')
    
        if len(parts) == 2 and parts[0].lower() == 'bearer':
            # Use strip() to remove any leading/trailing whitespace
            extract_token = parts[1]
            print("Extracted Token:", extract_token)
            return extract_token
    # else:
    #      raise HTTPException(status_code=401, detail="Authorization header missing")

async def getCurrentUser(request: Request):
    extract_token = await getHeader(request)
    if extract_token is None:
        return None
    token = root.tokens[extract_token]
    return token.getUser()

    # if token is not None:
    #         # If a matching token is found, return the associated user
    #     return token.getUser()
    # else:
    #     # Handle the case when the token is not found or invalid
    #     raise HTTPException(status_code=401, detail="Invalid or expired token")


@app.post("/home/")
async def read_login(student_id: str = Form(...), student_password: str = Form(...)):
    user = root.users[int(student_id)]
    if user and user.login_sys(student_id, student_password):
        # Create a new token for the user
        token = Token(user)
        root.tokens[token.getToken()] = token  # Store the token in the database
        commit_transaction()  # Save the changes in the database
        return {"token": token.getToken(), "message": "Login Successful", "user" :  user}
    raise HTTPException(status_code=404, detail="User not found or password is incorrect")

@app.get("/home/", response_class=HTMLResponse)
async def read_home(request: Request):
    user = await getCurrentUser(request)
    return templates.TemplateResponse("home.html", {"request": request, "user": user})

@app.get("/getUser/")
async def getUser(request: Request):
    user = await getCurrentUser(request)
    return {"data": user}

@app.get("/course/", response_class=HTMLResponse)
async def read_course(request: Request):
    user = Token.getUser
    return templates.TemplateResponse("course.html", {"request": request, "user": user})


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
    if user_id in root.users.keys():
        return root.users[int(user_id)]
    else:
        return {"error": "Student not found"}


@app.get("/assignment/", response_class=HTMLResponse)
async def read_course():
    with open("templates/assignment.html", "r", encoding="utf-8") as file:
        html_content = file.read()
    return HTMLResponse(content=html_content)

@app.on_event("shutdown")
def shutdown_event():
    commit_transaction()  # Commit the transaction on shutdown
