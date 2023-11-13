// alternating between discussion, upcoming, and completed
const discussionEl = document.getElementById("discussion");
const upcomingEl = document.getElementById("upcoming");
const completedEl = document.getElementById("completed");

discussionEl.addEventListener("click", showDiscussion);
upcomingEl.addEventListener("click", showUpcoming);
completedEl.addEventListener("click", showCompleted);

function showDiscussion() {
    discussionEl.style.display = "flex";
    upcomingEl.style.display = "none";
    completedEl.style.display = "none";
}

function showUpcoming() {
    discussionEl.style.display = "none";
    upcomingEl.style.display = "flex";
    completedEl.style.display = "none";
}

function showCompleted() {
    discussionEl.style.display = "none";
    upcomingEl.style.display = "none";
    completedEl.style.display = "flex";
}

//pull assignments from database
document.addEventListener("DOMContentLoaded", function () {
    const userElement = document.getElementById("user-data");
    var user = userElement.getAttribute("data");
    var course_id = userElement.getAttribute("course");

    var userData;
    fetch(`/students/${user}`)
        .then(response => response.json())
        .then(user => {
            pullAssignmentFromDB(user, course_id);
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });

    const sidebarElement = document.getElementById("sidebar");

    function pullAssignmentFromDB(userData, course_id_focus) {
        const upcomingSectionEl = upcomingEl.querySelector(".section");
        const completedSectionEl = completedEl.querySelector(".section");

        upcomingSectionEl.innerHTML = "";
        completedSectionEl.innerHTML = "";

        if (!userData || !userData.id) {
            return;
        }
    
        let id = userData.id;
        let enrolls = userData.enrolls;
        let enrollments = enrolls["data"];
    
        for (let enrollment of enrollments) {
            let course_id = enrollment["course"]["id"];
            let assignments = enrollment["course"]["assignments"]["data"];

            if (Array.isArray(assignments) && course_id == course_id_focus) {
                for (let assignment of assignments) {
                    console.log(assignment);

                    let divcard = document.createElement("div");
                    divcard.className = "card";

                    let divcardcontent = document.createElement("div");
                    divcardcontent.className = "card-content";

                    let divassignmentcard = document.createElement("div");
                    divassignmentcard.className = "assignment-card";

                    let div = document.createElement("div");
                    let divhighlight = document.createElement("div");
                    divhighlight.className = "highlight";

                    let spantime = document.createElement("span");
                    spantime.className = "small";

                    let spantitle = document.createElement("span");
                    spantitle.className = "medium";
                    spantitle.innerHTML = assignment["title"];

                    let spanviewassignment = document.createElement("span");
                    spanviewassignment.className = "nav-items-small";

                    let a = document.createElement("a");
                    a.href = "/assignment/";
                    a.innerHTML = "VIEW ASSIGNMENT";


                    let dueDate = new Date(assignment["due_date"]);
                    let dueTime = assignment["due_time"];

                    if (isToday(dueDate)) {
                        spantime.textContent = `Today, ${dueTime}`;
                    } else if (isUpcoming(dueDate)) {
                        spantime.textContent = `${getDayOfWeek(dueDate)}, ${dueTime}`;
                    } else {
                        //completed
                        divassignmentcard.appendChild(spantitle);
                        spanviewassignment.appendChild(a);
                        divassignmentcard.appendChild(spanviewassignment);
                        divcardcontent.appendChild(divassignmentcard);
                        divcard.appendChild(divcardcontent);
                        completedSectionEl.appendChild(divcard);
                        continue;
                    }

                    //upcoming
                    divhighlight.appendChild(spantime);
                    div.appendChild(divhighlight);
                    divassignmentcard.appendChild(div);
                    divassignmentcard.appendChild(spantitle);
                    spanviewassignment.appendChild(a);
                    divassignmentcard.appendChild(spanviewassignment);
                    divcardcontent.appendChild(divassignmentcard);
                    divcard.appendChild(divcardcontent);
                    upcomingSectionEl.appendChild(divcard);
                }
            }
        }
    }

    pullAssignmentFromDB();
});

function isToday(someDate) {
    const today = new Date();
    return (
        someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear()
    );
}

function isUpcoming(someDate) {
    const today = new Date();
    return someDate > today;
}

function getDayOfWeek(someDate) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return daysOfWeek[someDate.getDay()];
}

//discussion posts
let exampleDate = new Date();
let exampleUser = "Boonyasit Warachan";
let replies = [
    {
        "user": "Boonyasit WaraMoon",
        "date" : exampleDate,
        "content": "This is an Example Reply",
    }
]
let discussions = [
    {
        "user": "Boonyasit Warachan",
        "date":  exampleDate,
        "content": "This is an example message",
        "replies": replies,
    }
]; 

// init the discussion input and the container and the post button
const discussionInput = document.getElementById("discussionInput");
const discussionContainer = document.getElementById("discussionContainer");
const postButton = document.getElementById("postButton");

// if you click the post buttion, you post a discussion
postButton.addEventListener("click", postDiscussion);


function postDiscussion() {
    // if the discussion input is not empty
    if (discussionInput.value != "") {
        // get the current date and formati it
        let current = new Date();
        let discussion = {
            "user" : exampleUser,
            "date" : current,
            "content" : discussionInput.value,
            "replies" : [],
        }
        discussions.push(discussion);
        // clear the input
        discussionInput.value = "";
        updateDiscussionContainer();
    }
}

function updateDiscussionContainer() {
    // empty the container
    discussionContainer.innerHTML = "";

    for (let discussion of discussions) {
        //format the date
        let formatDate = { month: 'numeric', day: 'numeric', year: 'numeric'};
        let formatTime = { hour: '2-digit', minute: '2-digit' };
        let date = discussion.date.toLocaleDateString('en-US', formatDate);
        let time = discussion.date.toLocaleTimeString('en-US', formatTime);
        
        // create a discussion box for discussion and replies
        let wholeDiscussionBox = document.createElement("div");
        wholeDiscussionBox.classList.add("column");
        wholeDiscussionBox.classList.add("card");
        wholeDiscussionBox.classList.add("whole-discussion-box");

        // create a discussion box for user, text, and date
        let discussionBox = document.createElement("div");
        discussionBox.classList.add("card");
        discussionBox.classList.add("discussion");
        discussionBox.classList.add("discussion-box");
        discussionBox.classList.add("medium");
        discussionBox.classList.add("light-highlight");

        // create the boxes for user, text, and date
        let dateBox = document.createElement("span");
        let textBox = document.createElement("span");
        let userBox = document.createElement("span");
        dateBox.classList.add("discussion-date-box");
        textBox.classList.add("discussion-text-box");
        userBox.classList.add("discussion-user-box");

        // add date, text, and user to the discussion box
        dateBox.innerText = date + ", " + time;
        textBox.innerText = discussion.content;
        userBox.innerText = discussion.user;

        discussionBox.appendChild(userBox);
        discussionBox.appendChild(dateBox);
        discussionBox.appendChild(textBox);
        
        // create a container for the input and the post reply button
        let replyInputContainer = document.createElement("div");
        replyInputContainer.classList.add("root");
        replyInputContainer.classList.add("row");
        let replyInput = document.createElement("textarea");
        let replyButton = document.createElement("span");
        replyInput.placeholder = "Enter a Reply . . .";
        replyInput.classList.add("small");
        replyButton.innerText = "Reply";
        replyButton.classList.add("small");
        replyButton.classList.add("post-button");

        // when clicking the post reply button, add the value of the input to the replies 
        replyButton.addEventListener("click", function () {
            let current = new Date();
            discussion.replies.push(
                {
                    "user": exampleUser,
                    "date": current,
                    "content": replyInput.value,
                }
            );
            replyInput.value = "";
            updateDiscussionContainer();
        });

        // add the reply input and the reply post button to the container
        replyInputContainer.appendChild(replyInput);
        replyInputContainer.appendChild(replyButton);

        // add the discussion to the whole discussion box
        wholeDiscussionBox.appendChild(discussionBox);

        // Display replies for the current discussion
        if (discussion.replies) { // if there are replies
            for (let reply of discussion.replies) {
                console.log(reply);
                // create a container for all replies
                let replyContainer = document.createElement("div");
                replyContainer.classList.add("column");
                replyContainer.classList.add("whole-discussion-box");
                replyContainer.classList.add("reply-container");
                replyContainer.classList.add("root");

                //create reply box for one reply
                let replyBox = document.createElement("div");
                replyBox.classList.add("discussion");
                replyBox.classList.add("discussion-box");
                replyBox.classList.add("small");
                replyBox.classList.add("card");

                // create element for the reply user, date, and text
                let replyDateElement = document.createElement("span");
                let replyUser = document.createElement("span");
                let replyTextBox = document.createElement("span");
                replyDateElement.classList.add("discussion-date-box");
                replyTextBox.classList.add("discussion-text-box");
                replyUser.classList.add("discussion-user-box");

                // format the date
                let formatDate = { month: 'numeric', day: 'numeric', year: 'numeric'};
                let formatTime = { hour: '2-digit', minute: '2-digit' };
                let date = reply.date.toLocaleDateString('en-US', formatDate);
                let time = reply.date.toLocaleTimeString('en-US', formatTime);

                replyDateElement.innerText = date + ", " + time;
                replyUser.innerText = reply.user;
                replyTextBox.innerText = reply.content;

                replyBox.appendChild(replyUser);
                replyBox.appendChild(replyDateElement);
                replyBox.appendChild(replyTextBox);
                replyContainer.appendChild(replyBox);
                wholeDiscussionBox.appendChild(replyContainer);
            }
        } else {
            discussion.replies = [];
        }
        discussionContainer.appendChild(wholeDiscussionBox);
        wholeDiscussionBox.appendChild(replyInputContainer);
    }
}

