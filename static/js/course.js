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
let discussions = {};
const discussionInput = document.getElementById("discussionInput");
const discussionContainer = document.getElementById("discussionContainer");
const postButton = document.getElementById("postButton")

postButton.addEventListener("click", postDiscussion);

function postDiscussion() {
    if (discussionInput.value != "")  {
        let date = new Date();
        discussions[date.getMonth() + "/" + date.getDate() + ", " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()] = (discussionInput.value);
        discussionInput.value = "";
        updateDiscussionContainer();
    }
}

function updateDiscussionContainer() {
    for(let discussion in discussions) {
        let discussionBox = document.createElement("p");
        discussionBox.classList.add("card");
        discussionBox.classList.add("discussion");
        let dateBox = document.createElement("span");
        let textBox = document.createElement("span");
        let userBox = document.createElement("span");
        discussionBox.classList.add("discussion-box");
        dateBox.classList.add("discussion-date-box");
        textBox.classList.add("discussion-text-box");
        userBox.classList.add("discussion-user-box");
        dateBox.innerText = discussion;
        textBox.innerText = discussions[discussion];
        userBox.innerText = "Boonyasit Warachan";
        discussionBox.appendChild(userBox);
        discussionBox.appendChild(dateBox);
        discussionBox.appendChild(textBox);
        discussionContainer.appendChild(discussionBox);
    }
    discussions = {};
}
