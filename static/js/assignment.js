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

// assignment ---Comments--- code + have to add user to the dict
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

