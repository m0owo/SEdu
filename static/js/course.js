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

//discussion posts
let discussions = {}; // user: { date: discussion }
let replies = {}; // discussionDate: { user: { date: reply } }

const discussionInput = document.getElementById("discussionInput");
const discussionContainer = document.getElementById("discussionContainer");
const postButton = document.getElementById("postButton");

postButton.addEventListener("click", postDiscussion);

function postDiscussion() {
    if (discussionInput.value !== "") {
        let date = new Date();
        let month = date.getMonth() + 1; // Adding 1 because getMonth() returns zero-based month
        let dayNumber = date.getDate(); // Using getDate() instead of getDay()
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();
        
        // Add leading zeros if necessary
        month = month < 10 ? "0" + month : month;
        dayNumber = dayNumber < 10 ? "0" + dayNumber : dayNumber;
        hour = hour < 10 ? "0" + hour : hour;
        minute = minute < 10 ? "0" + minute : minute;
        second = second < 10 ? "0" + second : second;

        let discussionDate =
            month +
            "/" +
            dayNumber + // Use dayNumber instead of date
            ", " +
            hour +
            ":" +
            minute +
            ":" +
            second;
        discussions[discussionDate] = {
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
    if (!replies[discussionDate]) {
        replies[discussionDate] = {};
    }
    let user = "Boonyasit Warachan";
    let date = new Date();
    let month = date.getMonth() + 1;
    let dayNumber = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    // Add leading zeros if necessary
    month = month < 10 ? "0" + month : month;
    dayNumber = dayNumber < 10 ? "0" + dayNumber : dayNumber;
    hour = hour < 10 ? "0" + hour : hour;
    minute = minute < 10 ? "0" + minute : minute;
    second = second < 10 ? "0" + second : second;
    let replyDate =
        month +
        "/" +
        dayNumber +
        ", " +
        hour +
        ":" +
        minute +
        ":" +
        second;
    if (!replies[discussionDate][user]) {
        replies[discussionDate][user] = {};
    }
    replies[discussionDate][user][replyDate] = reply;
    updateDiscussionContainer();
}

