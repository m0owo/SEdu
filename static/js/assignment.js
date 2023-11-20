//assignment ---Edit Name and Due Date---
const assignmentName = document.getElementById("assignmentName");
const assignmentDueDate = document.getElementById("assignmentDueDate");
assignmentName.addEventListener("click", function (e) {
    if (role == "teacher") {
        editAssignmentName(e)
    }
});

assignmentDueDate.addEventListener("click", function (e) {
    if (role == "teacher") {
        editAssignmentDueDate(e)
    }
});

const userElement = document.getElementById("user-data");
const user = userElement.getAttribute("data");
const course_id = userElement.getAttribute("course");
const assignment_id = userElement.getAttribute("assignment");
const role = userElement.getAttribute("role");
const roleSpan = document.getElementById("userRole");

function editAssignmentName(e) {
    let newNameInput = document.createElement("input");
    newNameInput.type = "text";
    newNameInput.classList.add("large");
    let curName = e.target
    curName.parentNode.replaceChild(newNameInput, curName);
    newNameInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            curName.innerText = newNameInput.value;
            e.target.parentNode.replaceChild(curName, newNameInput);
            let title = curName.innerText;

            // Make a POST request to edit assignment name
            fetch(`/edit-assignment/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "course_id": course_id, "assignment_id": assignment_id, "title": title,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Assignment name edited:', data);
                })
                .catch(error => {
                    console.error('Error editing assignment name:', error);
                });
        }
    });
}

function editAssignmentDueDate(e) {
    let newDateInput = document.createElement("input");
    newDateInput.type = "text";
    newDateInput.style.width = "fit-content";
    newDateInput.classList.add("small");
    newDateInput.id = "newDateInput";
    let curDate = e.target;
    let container = document.createElement("div");
    container.appendChild(newDateInput);
    curDate.parentNode.replaceChild(container, curDate);
    newDateInput.placeholder = "month day, year time";
    newDateInput.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            const enteredDateText = newDateInput.value;
            const enteredDateObject = new Date(enteredDateText);
            let currentDate = new Date();
            if (!isNaN(enteredDateObject.getTime()) && enteredDateObject > currentDate) {
                let formatDate = { month: 'long', day: 'numeric', year: 'numeric' };
                let formatTime = { hour: '2-digit', minute: '2-digit' };
                let date = enteredDateObject.toLocaleDateString('en-US', formatDate);
                let time = enteredDateObject.toLocaleTimeString('en-US', formatTime);
                curDate.innerText = date + ", " + time;
                const formattedDate = enteredDateObject.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                console.log(formattedDate);
                console.log(time);

                // Make a POST request to edit assignment time
                fetch(`/edit-assignment/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "course_id": course_id, "assignment_id": assignment_id, "date": formattedDate, "time": time,
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Assignment date edited:', data);
                    })
                    .catch(error => {
                        console.error('Error editing assignment date:', error);
                    });

            } else if (enteredDateObject < currentDate) {
                alert("Invalid Date");
            } else {
                alert("Invalid Date Format (Month Day, Year, Time(optional)");
            }
            container.parentNode.replaceChild(curDate, container);
        }
    });
    newDateInput.focus();
}

// assignment ---Description---
const descriptionEdit = document.getElementById("editButton");
let descriptionDone = document.createElement("span");
descriptionDone.classList.add("edit-button");
descriptionDone.innerText = "Done";
descriptionDone.id = "descriptionDone";
descriptionDone.addEventListener("click", showDescriptionTextArea)
const descriptionTextArea = document.getElementById("descriptionTextArea");
const descriptionText = document.getElementById("description");

descriptionEdit.addEventListener("click", showDescriptionTextArea);

let editing = false;
descriptionText.innerText = "Enter a Brief Description . . ."
descriptionTextArea.innerText = "";

// add text editing features, like tab
function showDescriptionTextArea() {
    descriptionTextArea.style.transition = "0.1s ease-in";
    if (editing == false) {
        descriptionTextArea.style.visibility = "visible";
        descriptionTextArea.value = descriptionText.innerText;
        descriptionText.innerText = "";
        descriptionTextArea.style.width = "100%";
        descriptionTextArea.style.height = "200px";
        descriptionEdit.parentNode.replaceChild(descriptionDone, descriptionEdit);
        editing = true;
    } else if (editing == true) {
        descriptionText.innerText = descriptionTextArea.value;
        postDescriptionToDB(descriptionText.innerText);
        descriptionTextArea.value = "";
        descriptionTextArea.style.width = "0px";
        descriptionTextArea.style.height = "0px";
        descriptionTextArea.style.visibility = "hidden";
        descriptionDone.parentNode.replaceChild(descriptionEdit, descriptionDone);
        editing = false;
    }
}

function postDescriptionToDB(description) {
    // Make a POST request to edit assignment description
    fetch(`/edit-assignment/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "course_id": course_id, "assignment_id": assignment_id, "description": description,
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Assignment description edited:', data);
        })
        .catch(error => {
            console.error('Error editing assignment name:', error);
        });
}

// assignment ---Additional Resources--- code
let files = [];
const fileInput = document.getElementById("fileInput");
const fileInputButton = document.getElementById("fileInputButton");
const resourceFrames = document.getElementById("resourceFrames");
fileInputButton.addEventListener('click', function () {
    fileInput.click();
})


function updateFileFrame() {
    resourceFrames.innerHTML = ''; 
    if (files.length == 0) {
        resourceFrames.style.visibility = "hidden";
    } else if (files.length > 0) {
        resourceFrames.style.visibility = "visible";
        files.forEach(function (file) {
            console.log("Adding file to frame:", file.name); 
            console.log(typeof file, file);
            let iframe = document.createElement("iframe");
            let downloadButton = document.createElement("button");
            resourceFrames.appendChild(document.createElement("br"));
            downloadButton.innerText = "Download";
            downloadButton.classList.add("edit-button");
            resourceFrames.appendChild(iframe);
            resourceFrames.appendChild(downloadButton);
            const fileURL = URL.createObjectURL(file);
            iframe.classList.add("fileFrame");
            iframe.setAttribute("src", fileURL);
            downloadButton.addEventListener('click', function () {
                console.log("clicked");
                let downloadLink = document.createElement("a");
                downloadLink.href = fileURL;
                downloadLink.download = file.name;
                downloadLink.click();
            });
        });
    }
}

fileInput.addEventListener('change', function () {
    const selectedFile = fileInput.files[0];
    if (selectedFile) {
        files.push(selectedFile);
        updateFileFrame();
    }
})

// assignment -------File------- code
const sentFileButton = document.getElementById("sentFileButton");
sentFileButton.addEventListener('click', function () {
    // Assuming files is an array of File objects
    resourceFrames.innerHTML = "";
    resourceFrames.style.visibility = "hidden";
    console.log("-----TO DB------");
    postFilesToDB(files);

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append("fileInput", file);

        fetch("/uploadfile/", {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response data
            console.log("File uploaded the fileeee:", data);
        })
        .catch(error => {
            console.error("Error uploading file:", error);
        });
    } else {
        console.error("No file selected.");
    }
});

function postFilesToDB(file) {
    fetch(`/students/${user}`)
    .then(response => response.json())
    .then(user => {
        //fetch to post comments in assignment
        fetch("/edit-assignment/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "course_id": course_id, 
                "assignment_id": assignment_id, 
                "files": files.map(file => ({
                    "file_name": file.name, 
                    "file_owner": user["name"]
                })),
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                
                fetchDBtoUpdate();
                console.log(file.name, user["name"], `upload/${file.name}`)
                console.log("File uploaded:", data);
        
            })
            .catch((error) => {
                console.error("Error uploading file:", error);
            });
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
    });

  }

// assignment ---Comments--- code
let comments = [];
const commentInput = document.getElementById("commentInput");
const commentContainer = document.getElementById("commentContainer");
const commentButton = document.getElementById("sendComment");

commentButton.addEventListener("click", sendComment);

function sendComment() {
    if (commentInput.value !== "") {
        let current = new Date();
        let text = commentInput.value
        let formatDate = { month: 'numeric', day: 'numeric', year: 'numeric' };
        let formatTime = { hour: '2-digit', minute: '2-digit' };
        let date = current.toLocaleDateString('en-US', formatDate);
        let time = current.toLocaleTimeString('en-US', formatTime);
        assignmentDueDate.innerText = date + ", " + time;
        //fetch to get user name
        fetch(`/students/${user}`)
            .then(response => response.json())
            .then(user => {
                //fetch to post comments in assignment
                fetch(`/post-new-assignment-comment/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "course_id": course_id,
                        "assignment_id": assignment_id,
                        "commenter": user["name"],
                        "comment_date": date,
                        "comment_time": time,
                        "comment_text": text,
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        fetchDBtoUpdate();
                        console.log('Assignment comment posted:', data);
                    })
                    .catch(error => {
                        console.error('Error posting comment:', error);
                    });
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });

        commentInput.value = "";
    }
}

function editRawScore(e, totalScore) {
    let rawScoreInput = document.createElement("input");
    rawScoreInput.classList.add("score-input");
    rawScoreInput.type = "text";
    rawScoreInput.pattern = "\\d*";

    let originalScoreSpan = e.target;

    originalScoreSpan.parentNode.replaceChild(rawScoreInput, originalScoreSpan);

    rawScoreInput.focus();

    rawScoreInput.addEventListener('keydown', function (e) {
        if (e.key === "Enter") {
            let newScore = parseInt(rawScoreInput.value, 10);
            if (!isNaN(newScore) && newScore >= 0 && newScore <= totalScore) {
                updateScore(rawScoreInput, newScore, totalScore);
            } else {
                alert("Invalid Score Input !");
            }
        }
    });
}

function updateScore(rawScoreInput, newScoreValue, totalScore) {
    let newScoreSpan = document.createElement("span");
    newScoreSpan.classList.add("score")
    let parsedScore = parseFloat(newScoreValue);
    if (!isNaN(parsedScore)) {
        newScoreSpan.textContent = parsedScore.toFixed(2);
    } else {
        newScoreSpan.text = newScoreValue;
    }
    rawScoreInput.parentNode.replaceChild(newScoreSpan, rawScoreInput);
    newScoreSpan.addEventListener('click', function (e) {
        editRawScore(e, totalScore);
    });
}

//====================================
//student submission

let studentFiles = [];
const studentFileInputButton = document.getElementById("studentFileInputButton");
const studentFileInput = document.getElementById("studentFileInput");
const studentDataBaseFrame = document.getElementById("studentDataBaseFrame")

studentFileInputButton.addEventListener('click', function () {
    studentFileInput.click();
})

function studentupdateFileFrame() {
    studentDataBaseFrame.innerHTML = ''; 
    if (studentFiles.length == 0) {
        studentDataBaseFrame.style.visibility = "hidden";
    } else if (studentFiles.length > 0) {
        studentDataBaseFrame.style.visibility = "visible";
        studentFiles.forEach(function (file) {
            console.log("Adding file to frame:", studentFiles.name); 
            console.log(typeof file, file);
            let iframe = document.createElement("iframe");
            let downloadButton = document.createElement("button");
            studentDataBaseFrame.appendChild(document.createElement("br"));
            downloadButton.innerText = "Download";
            downloadButton.classList.add("edit-button");
            studentDataBaseFrame.appendChild(iframe);
            studentDataBaseFrame.appendChild(downloadButton);
            const fileURL = URL.createObjectURL(file);
            iframe.classList.add("fileFrame");
            iframe.setAttribute("src", fileURL);
            downloadButton.addEventListener('click', function () {
                console.log("clicked");
                let downloadLink = document.createElement("a");
                downloadLink.href = fileURL;
                downloadLink.download = file.name;
                downloadLink.click();
            });
        });
    }
}

studentFileInput.addEventListener('change', function () {
    const selectedFile = studentFileInput.files[0];
    if (selectedFile) {
        studentFiles.push(selectedFile);
        studentupdateFileFrame();
    }
})

//====================================
//submit submission

const submitButton = document.getElementById("submitButton");
submitButton.addEventListener("click", addSubmission);
function addSubmission() {
    let current = new Date();
    let text = commentInput.value
    let formatDate = { month: 'numeric', day: 'numeric', year: 'numeric' };
    let formatTime = { hour: '2-digit', minute: '2-digit' };
    let date = current.toLocaleDateString('en-US', formatDate);
    let time = current.toLocaleTimeString('en-US', formatTime);
    assignmentDueDate.innerText = date + ", " + time;

    //fetch to get user name
    fetch(`/students/${user}`)
        .then(response => response.json())
        .then(user => {

            //fetch to post comments in assignment
            fetch(`/post-submission/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "user_id": user["id"],
                    "course_id": course_id,
                    "assignment_id": assignment_id,
                    //========================= file is "test" right now
                    "content": "test",
                    "files": studentFiles.map(file => ({
                        "file_name": file.name, 
                        "file_owner": user["name"]
                    })),
                    //=========================
                    "submit_date": date,
                    "submit_time": time,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    fetchDBtoUpdate();
                    console.log('Assignment submission posted:', data);
                })
                .catch(error => {
                    console.error('Error posting submission:', error);
                });
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });

    const studentfile = studentFileInput.files[0];
    if (studentfile) {
        const formData = new FormData();
        formData.append("fileInput", studentfile);

        fetch("/uploadfile/", {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response data
            console.log("File uploaded the fileeee:", data);
        })
        .catch(error => {
            console.error("Error uploading file:", error);
        });
    } else {
        console.error("No file selected.");
    }

}

//==============================================
//update all content on page
document.addEventListener("DOMContentLoaded", fetchDBtoUpdate);
function fetchDBtoUpdate() {
    var userData;
    //ui change depending on roles
    if (role == "student") {
        const submissionTable = document.getElementById("submissionsTable");
        const submission_title = document.getElementById("submission-title");
        const submissionsBox = document.getElementById("submissionsBox");
        // const turnedIn = document.getElementById("turned-in");
        // const notTurnedIn = document.getElementById("not-turned-in");
        // const studentNotTurnedIn = document.getElementById("students-not-turned-in");
        submission_title.textContent = "Submission Box";
        roleSpan.innerText = "Student";
        descriptionEdit.style.display = "none";
        submissionTable.style.display = "none";
        // turnedIn.style.display = "none";
        // notTurnedIn.style.display = "none";
        // studentNotTurnedIn.style.display = "none";
        fileInput.style.display = "none";
        fileInputButton.style.display = "none";
        sentFileButton.style.display = "none";
        
    } else if (role == "teacher") {
        const submission_state = document.getElementById("submission-state");
        roleSpan.innerText = "Lecturer";
        submitButton.style.display = "none";
        submission_state.style.display = "none";
        studentFileInput.style.display = "none";
        studentFileInputButton.style.display = "none";
        studentDataBaseFrame.style.display = "none";
    }

    fetch(`/students/${user}`)
        .then(response => response.json())
        .then(user => {
            pullInfoFromDB(user, course_id, assignment_id);
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });

    const sidebarElement = document.getElementById("sidebar");

    function pullInfoFromDB(userData, course_id_focus, assignment_id_focus) {
        if (!userData || !userData.id) {
            return;
        }
        console.log("userData");
        console.log(userData);
        let user_id = userData.id;
        let enrolls = userData.enrolls;
        let enrollments = enrolls["data"];
        let first_course_id = enrollments[0]["course"]["id"];

        let submittedStudents = [];

        for (let enrollment of enrollments) {
            let course_id = enrollment["course"]["id"];
            let assignments = enrollment["course"]["assignments"]["data"];
            const courseElement = document.getElementById("course");
            courseElement.href = `/${user_id}/course/${first_course_id}`;

            if (Array.isArray(assignments) && course_id == course_id_focus) {
                for (let assignment of assignments) {
                    if (assignment["id"] == assignment_id_focus) {
                        console.log(assignment);

                        //update time
                        descriptionText.innerText = assignment["description"];

                        const enteredDateText = assignment["due_date"] + " " + assignment["due_time"];
                        const enteredDateObject = new Date(enteredDateText);

                        let formatDate = { month: 'long', day: 'numeric', year: 'numeric' };
                        let formatTime = { hour: '2-digit', minute: '2-digit' };
                        let date = enteredDateObject.toLocaleDateString('en-US', formatDate);
                        let time = enteredDateObject.toLocaleTimeString('en-US', formatTime);
                        assignmentDueDate.innerText = date + ", " + time;

                        let comments = assignment["individual_comments"]["data"];
                        //update comments
                        commentContainer.innerHTML = "";
                        if (comments && comments.length > 0) {
                            for (let comment of comments) {
                                let commentBox = document.createElement("p");
                                let dateBox = document.createElement("span");
                                let textBox = document.createElement("span");
                                let userBox = document.createElement("span");
                                commentBox.classList.add("comment-box");
                                dateBox.classList.add("comment-date-box");
                                textBox.classList.add("comment-text-box");
                                userBox.classList.add("comment-user-box");
                                dateBox.innerText = comment["comment_date"] + ", " + comment["comment_time"];
                                textBox.innerText = comment["text"];
                                userBox.innerText = comment["commenter"];
                                // Append elements to the container
                                commentBox.appendChild(userBox)
                                commentBox.appendChild(dateBox);
                                commentBox.appendChild(textBox);
                                commentContainer.appendChild(commentBox);
                            }
                        }

            
                        let files = assignment["files"]["data"];
                        filearea = document.getElementById("dataBaseFrame")
                        filearea.innerText = ''
                        if (Array.isArray(files)) {
                            filearea.style.visibility = "visible";
                            for (let file of files) {
                            
                                console.log("----File from database----", file);
                                let iframe = document.createElement("iframe");
                                const filePath = `/static/${file.file_path}/${file.file_name}`;
                                iframe.setAttribute("src", filePath);
                        
                                let downloadButton = document.createElement("button");
                                filearea.appendChild(document.createElement("br"));
                                downloadButton.innerText = "Download";
                                downloadButton.classList.add("edit-button");
                                filearea.appendChild(iframe);
                                filearea.appendChild(downloadButton);
                                iframe.classList.add("fileFrame");
                        
                                // Declare downloadLink outside the event listener
                                let downloadLink = document.createElement("a");
                                downloadLink.href = filePath;
                                downloadLink.download = file.file_name;
                        
                                downloadButton.addEventListener('click', function () {
                                    console.log("clicked");
                                    downloadLink.click();
                                });
                        
                                console.log("Adding file to frame:", file.file_name);
                                console.log("Download Link:", downloadLink);
                            }
                        }
                        //update submissions
                        //1) DONE - Teacher Additional Files Update and Post

                        //2) Student submission Update and Post
                            //2.1) DONE - Submission content having actual files instead of {content: "test"}
                            //2.2) DONE - Submission can post and update (with content of "test" right now)
                            //2.3) DONE - status for students (Graded, Turned In, Not Turned In)

                        //3) Teacher submissions Update and Post
                        //3.1) almost done - Submissions Updating
                        // only students not turned in is not updated yet


                        //3.2) NOT DONE!! - Submissions Score Posting
                        // problem is students that didnt submit does not have submission in the database
                        // so i have to check from both the students in course list and the submissions list
                        // which will probably affect how gpa works since teacher can't grade who didnt submit

                        //3.3) DONE - Table can display submitted files at content column

                        //submissions related update
                        let submissions = assignment["submissions"]["data"];
                        const submissionBody = document.getElementById("submissionBody");
                        submissionBody.innerHTML = "";
                        let turnedInStudents = [];
                        let notTurnedInStudents = [];
                        if (submissions) {
                            for (let submission of submissions) { //get submission here
                                //change status for students ==========================================
                                let studentfiles = submission["files"]["data"];
                                const submission_state = document.getElementById("submission-state");
                                if (submission["user_id"] == user_id) {
                                    if (submission["score"]) {
                                        submission_state.textContent = "Graded";
                                        submission_state.style.color = "Green";
                                    } else {
                                        submission_state.textContent = "Turned In";
                                        submission_state.style.color = "Green";
                                        submitButton.style.display = "none";
                                    }
                                    
                                    const studentDataBaseFrame = document.getElementById("studentDataBaseFrame")
                                    if (submission["user_id"] == user_id){
                                        if (Array.isArray(studentfiles)) {
                                            studentDataBaseFrame.innerHTML = "";
                                            studentDataBaseFrame.style.visibility = "visible";
                                            for (let file of studentfiles) {
                                                console.log("----File from database----", studentfiles);
                                                let iframe = document.createElement("iframe");
                                                const filePath = `/static/${file.file_path}/${file.file_name}`;
                                                iframe.setAttribute("src", filePath);
                                        
                                                let downloadButton = document.createElement("button");
                                                studentDataBaseFrame.appendChild(document.createElement("br"));
                                                downloadButton.innerText = "Download";
                                                downloadButton.classList.add("edit-button");
                                                studentDataBaseFrame.appendChild(iframe);
                                                studentDataBaseFrame.appendChild(downloadButton);
                                                iframe.classList.add("fileFrame");
                                        
                                                // Declare downloadLink outside the event listener
                                                let downloadLink = document.createElement("a");
                                                downloadLink.href = filePath;
                                                downloadLink.download = file.file_name;
                                        
                                                downloadButton.addEventListener('click', function () {
                                                    console.log("clicked");
                                                    downloadLink.click();
                                                });
                                        
                                                console.log("Adding file to frame:", file.file_name);
                                                console.log("Download Link:", downloadLink);
                                            }
                                        }
    
                                    }
                                    break;
                                }

                            //display all submissions for teacher =================================
                                // let submissionTable = document.getElementById("submissionTable");
                                let submissionBody = document.getElementById("submissionBody");
                                // submissionTable.style.marginLeft = "100px";

                                // create a row for the submission
                                let submissionRow = submissionBody.insertRow();
                                submissionRow.classList.add("submission");

                                // insert a cell for the student id
                                let student = submissionRow.insertCell(0);
                                student.classList.add("submission-student-cell");
                                student.innerText = "6501" + submission["user_id"].toString();
                                turnedInStudents.push(submission["user_id"]);
                                console.log("pushing new student to turned in");
                                console.log(submission["user_id"]);

                                // !!!!!!! insert a cell for files !!!!!!!!
                                let content = submissionRow.insertCell(1);
                                if (Array.isArray(studentfiles)) {
                                    for (let file of studentfiles) {
                                        console.log("----File from database----", studentfiles);
                                        const filePath = `/static/${file.file_path}/${file.file_name}`;
                                        content.innerText = file.file_name;
                                        let button = document.createElement("a");
                                        button.className = "edit-button";
                                        button.id = "view-submission-file";
                                        button.textContent = "Download";
                                        button.href = filePath;
                                        button.download = file.file_name;
                                        content.appendChild(button);
                                    }
                                } else {
                                    content.innerText = "No Files Attached";
                                }
                                
                                // insert a cell for submission time
                                let time = submissionRow.insertCell(2);
                                time.innerText = submission["submit_date"] + ", " + submission["submit_time"];
                                
                                // insert a cell for the status and format it accordingly
                                let status = submissionRow.insertCell(3);
                                const submittedDateText = submission["submit_date"] + " " + submission["submit_time"];
                                const submittedDateObject = new Date(submittedDateText);
                                if (submittedDateObject > enteredDateObject){
                                    status.innerText = "Submitted Late";
                                    status.className = "submission-status-submitted";
                                } else {
                                    status.innerText = "Submitted";
                                    status.className = "submission-status-graded";
                                }

                                // create a cell for the score
                                let score = submissionRow.insertCell(4);
                                score.classList.add("submission-score-cell");
                                let rawScore = document.createElement("span");
                                rawScore.classList.add("score");
                                let totalScore = document.createElement("span");
                                totalScore.classList.add("score");
                                totalScore.style.fontWeight = "bold";
                                totalScore.innerText = "/" + assignment["total_score"];
                                // add the text for the score
                                if (submission["score"]) {
                                    rawScore.textContent = submission["score"];
                                } else {
                                    rawScore.textContent = "N/A";
                                }
                                score.appendChild(rawScore);
                                score.appendChild(totalScore);
                                // when the score is pressed, you can edit it
                                rawScore.addEventListener('click', function (e) {
                                    editRawScore(e, assignment["total_score"]);
                                });

                                // display students who don't have submission ===============

                                // fetch all students
                                fetch (`/students/`)
                                .then(response => response.json())
                                .then(fetchedStudents => {
                                    console.log("fetched students")
                                    console.log(fetchedStudents);
                                    console.log("turned in students");
                                    console.log(turnedInStudents);
                                    showNotTurnedIn(fetchedStudents, turnedInStudents);
                                })

                                function showNotTurnedIn(allStudents, submissionStudents) {
                                    studentsEnrolled = [];
                                    for (let student of allStudents) {
                                        let enrolls = student["enrolls"].data;
                                        for (let enroll of enrolls) {
                                            if (enroll.course.id == course_id) {
                                                console.log(student.id);
                                                studentsEnrolled.push(student.id);
                                            }
                                        }
                                    }

                                    let notTurnedInBody = document.getElementById("notTurnedInBody");
                                    for (let studentId of studentsEnrolled) {
                                        console.log("students submitted");
                                        console.log(submissionStudents);
                                        if (!submissionStudents.includes(studentId)){
                                            if (!notTurnedInStudents.includes(studentId)) {
                                                notTurnedInStudents.push(studentId);
                                                let submissionRow = submissionBody.insertRow();
                                                submissionRow.classList.add("submission");

                                                let studentCell = submissionRow.insertCell(0);
                                                studentCell.classList.add("submission-student-cell");
                                                studentCell.innerText = "650" + studentId;

                                                let contentCell = submissionRow.insertCell(1);
                                                
                                                let timeCell = submissionRow.insertCell(2);

                                                let statusCell = submissionRow.insertCell(3);
                                                statusCell.innerText = "Missing";
                                                statusCell.style.color = "Red";

                                                let score = submissionRow.insertCell(4);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
