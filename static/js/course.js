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
let discussions = {}; // user: { date: discussion }
let replies = {}; // discussionDate: { user: { date: reply } }

const discussionInput = document.getElementById("discussionInput");
const discussionContainer = document.getElementById("discussionContainer");
const postButton = document.getElementById("postButton");

postButton.addEventListener("click", postDiscussion);

function postDiscussion() {
    if (discussionInput.value !== "") {
        let current = new Date();
        let formatDate = { month: 'numeric', day: 'numeric', year: 'numeric'};
        let formatTime = { hour: '2-digit', minute: '2-digit' };
        let date = current.toLocaleDateString('en-US', formatDate);
        let time = current.toLocaleTimeString('en-US', formatTime);
        discussions[date + ", " + time] = {
            user: "Boonyasit Warachan",
            text: discussionInput.value,
        };
        discussionInput.value = "";
        updateDiscussionContainer();
    }
}
function updateDiscussionContainer() {
    discussionContainer.innerHTML = "";
    const sortedDiscussionDates = Object.keys(discussions).sort((a, b) => {
        return new Date(b) - new Date(a);
    });
    for (let discussionDate of sortedDiscussionDates) {
        console.log(discussionDate);
        let discussion = discussions[discussionDate];
        
        let wholeDiscussionBox = document.createElement("div");
        wholeDiscussionBox.classList.add("column");
        wholeDiscussionBox.classList.add("card");
        wholeDiscussionBox.classList.add("whole-discussion-box");

        let discussionBox = document.createElement("div");
        discussionBox.classList.add("card");
        discussionBox.classList.add("discussion");
        discussionBox.classList.add("discussion-box");
        discussionBox.classList.add("medium");
        discussionBox.classList.add("light-highlight");

        let dateBox = document.createElement("span");
        let textBox = document.createElement("span");
        let userBox = document.createElement("span");
        dateBox.classList.add("discussion-date-box");
        textBox.classList.add("discussion-text-box");
        userBox.classList.add("discussion-user-box");

        dateBox.innerText = discussionDate;
        textBox.innerText = discussion.text;
        userBox.innerText = discussion.user;

        discussionBox.appendChild(userBox);
        discussionBox.appendChild(dateBox);
        discussionBox.appendChild(textBox);

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
        // replyButton.classList.add("light-highlight");
        replyButton.addEventListener("click", function () {
            updateReplies(replyInput.value, discussionDate);
        });
        replyInputContainer.appendChild(replyInput);
        replyInputContainer.appendChild(replyButton);
        wholeDiscussionBox.appendChild(discussionBox);

        // Display replies for the current discussion
        if (replies[discussionDate]) {
            for (let user in replies[discussionDate]) {
                for (let replyDate in replies[discussionDate][user]) {
                    let replyText = replies[discussionDate][user][replyDate];

                    let replyContainer = document.createElement("div");
                    replyContainer.classList.add("column");
                    replyContainer.classList.add("whole-discussion-box");
                    replyContainer.classList.add("reply-container");
                    replyContainer.classList.add("root");
                    let replyBox = document.createElement("div");

                    // replyBox.classList.add("light-highlight");
                    replyBox.classList.add("discussion");
                    replyBox.classList.add("discussion-box");
                    replyBox.classList.add("small");
                    replyBox.classList.add("card");

                    let replyDateElement = document.createElement("span");
                    let replyUser = document.createElement("span");
                    let replyTextBox = document.createElement("span");

                    replyDateElement.classList.add("discussion-date-box");
                    replyTextBox.classList.add("discussion-text-box");
                    replyUser.classList.add("discussion-user-box");

                    replyDateElement.innerText = replyDate;
                    replyUser.innerText = user;
                    replyTextBox.innerText = replyText;

                    replyBox.appendChild(replyUser);
                    replyBox.appendChild(replyDateElement);
                    replyBox.appendChild(replyTextBox);
                    replyContainer.appendChild(replyBox);
                    wholeDiscussionBox.appendChild(replyContainer);
                }
            }
        }
        discussionContainer.appendChild(wholeDiscussionBox);
        wholeDiscussionBox.appendChild(replyInputContainer);
    }
}

function updateReplies(reply, discussionDate) {
    if (!replies[discussionDate][user]) {
        replies[discussionDate][user] = {};
    }
    replies[discussionDate][user][replyDate] = reply;
    updateDiscussionContainer();
}

