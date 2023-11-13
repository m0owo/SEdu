let statusUpcoming = "upcoming";
let statusOverdue = "overdue";
let roleStudent = "student";
let roleTeacher = "teacher";


// assignment ---Description--- code
const descriptionEdit = document.getElementById("editButton");
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
        descriptionEdit.innerText = "Done"
        editing = true;
    } else if (editing = true){
        descriptionText.innerText = descriptionTextArea.value;
        descriptionTextArea.value = "";
        descriptionTextArea.style.width = "0px";
        descriptionTextArea.style.height = "0px";
        descriptionTextArea.style.visibility = "hidden";
        descriptionEdit.innerText = "Edit";
        editing = false;
    }

}

// assignment ---Additional Resources--- code
let files = [];
const fileInput = document.getElementById("fileInput");
const fileInputButton = document.getElementById("fileInputButton");
const resourceFrames = document.getElementById("resourceFrames");
fileInputButton.addEventListener('click', function () {
    fileInput.click();
})
fileInput.addEventListener('change', function() {
    const selectedFile = fileInput.files[0];
    if (selectedFile) {
        files.push(selectedFile);
        updateFileFrame();
    }
})

function updateFileFrame() {
    if (files.length == 0) {
        resourceFrames.style.visibility = "hidden";
    } else if (files.length > 0) {
        resourceFrames.style.visibility = "visible";
        files.forEach(function(file) {
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
            downloadButton.addEventListener('click', function (){
                console.log("clicked");
                let downloadLink = document.createElement("a");
                downloadLink.href = fileURL;
                downloadLink.download = file.name;
                downloadLink.click();
            });
        });
    }
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
        comments.push({
            user: "Boonyasit Warachan",
            date: current,
            text: commentInput.value
        });
        commentInput.value = "";
        updateCommentContainer();
    }
}

function updateCommentContainer() {
    commentContainer.innerHTML = "";

    // Iterate through comments in reverse order (most recent first)
    for (let i = 0; i < comments.length; i++) {
        let comment = comments[i];

        let formatDate = { month: 'numeric', day: 'numeric', year: 'numeric' };
        let formatTime = { hour: '2-digit', minute: '2-digit' };
        let date = comment.date.toLocaleDateString('en-US', formatDate);
        let time = comment.date.toLocaleTimeString('en-US', formatTime);

        // Create HTML elements
        let commentBox = document.createElement("p");
        let dateBox = document.createElement("span");
        let textBox = document.createElement("span");
        let userBox = document.createElement("span");
        
        // Add classes
        commentBox.classList.add("comment-box");
        dateBox.classList.add("comment-date-box");
        textBox.classList.add("comment-text-box");
        userBox.classList.add("comment-user-box");

        // Set content
        dateBox.innerText = date + ", " + time;
        textBox.innerText = comment.text;
        userBox.innerText = comment.user;

        // Append elements to the container
        commentBox.appendChild(userBox)
        commentBox.appendChild(dateBox);
        commentBox.appendChild(textBox);
        commentContainer.appendChild(commentBox);
    }
}

// assignment ---Submission Table--- for Teachers 
let submissions = [
    {
        "student" : "65011367",
        "status" : "Graded",
        "score" : "10",
    },
    {
        "student" : "65011365",
        "status" : "Missing",
        "score" : "N/A",
    },
    {
        "student" : "65011528",
        "status" : "Submitted",
        "score": "N/A",
    }
];
let totalScore = 10.00;
let submissionBody = document.getElementById("submissionBody"); 

submissions.forEach(submission => {
    // create a row for the submission
    let submissionRow = submissionBody.insertRow();
    submissionRow.classList.add("submission");

    // insert a cell for the student id
    let student = submissionRow.insertCell(0);
    student.classList.add("submission-student-cell");
    student.innerText = submission.student;

    // insert a cell for the status and format it accordingly
    let status = submissionRow.insertCell(1);
    status.classList.add("submission-status-cell");
    switch (submission.status) {
        case "Submitted":
            status.classList.add("submission-status-submitted");
            break;
        case "Missing":
            status.classList.add("submission-status-missing");
            break;
        case "Graded":
            status.classList.add("submission-status-graded");
            break;
        default:
            break;
    }
    status.innerText = submission.status;

    // create a cell for the score
    let score = submissionRow.insertCell(2);
    score.classList.add("submission-score-cell");
    let rawScore = document.createElement("span");
    rawScore.classList.add("score");
    // add the text for the score
    if (submission.score) {
        rawScore.textContent = submission.score;
    } else {
        rawScore.textContent = "N/A";
    }
    let totalScoreDisplay = document.createElement("span");
    totalScoreDisplay.classList.add("small-bold");
    totalScoreDisplay.innerText = "/" + totalScore.toFixed(2);
    score.appendChild(rawScore);
    score.appendChild(totalScoreDisplay);
    // when the score is pressed, you can edit it
    rawScore.addEventListener('click', function(e) {
        editRawScore(e);
    });
});

function editRawScore(e) {
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
                updateScore(rawScoreInput, newScore);
            }
        }
    });    
}

function updateScore(rawScoreInput, newScoreValue) {
    let newScoreSpan = document.createElement("span");
    newScoreSpan.classList.add("score")
    let parsedScore = parseFloat(newScoreValue);
    if (!isNaN(parsedScore)) {
        if (parsedScore >= 0 && parsedScore <= totalScore) {
            newScoreSpan.textContent = parsedScore.toFixed(2);
        }
    } else {
        newScoreSpan.textContent = newScoreValue;
    }
    rawScoreInput.parentNode.replaceChild(newScoreSpan, rawScoreInput);
    newScoreSpan.addEventListener('click', function (e) {
        editRawScore(e);
    });
}
