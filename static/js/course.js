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
let discussions = {}; //user:{date:discussion}
let replies = {}; //discussion:{user:{date:replies}}
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
    discussionContainer.innerHTML = "";
    for(let discussion in discussions) {
        let wholeDiscussionBox = document.createElement("p");
        wholeDiscussionBox.classList.add("column");
        wholeDiscussionBox.classList.add("card");
        wholeDiscussionBox.classList.add("whole-discussion-box");
        //box for containing the discussions with classes card and discussion
        let discussionBox = document.createElement("p");
        discussionBox.classList.add("card");
        discussionBox.classList.add("discussion");
        discussionBox.classList.add("discussion-box");

        //create the spands for user, date, and text and set their classes accordingly
        let dateBox = document.createElement("span");
        let textBox = document.createElement("span");
        let userBox = document.createElement("span");
        dateBox.classList.add("discussion-date-box");
        textBox.classList.add("discussion-text-box");
        userBox.classList.add("discussion-user-box");

        //set their inner text
        dateBox.innerText = discussion; //the date
        textBox.innerText = discussions[discussion]; //the correlating discussion
        userBox.innerText = "Boonyasit Warachan"; //name of the user

        //put each element into the discussion box
        discussionBox.appendChild(userBox); 
        discussionBox.appendChild(dateBox);
        discussionBox.appendChild(textBox);

        //put the discussion box into the container
        wholeDiscussionBox.appendChild(discussionBox);

        // get the replies of the discussion based on the replies dictionary and created button for creating and posting reply
        let discussionReplies = replies[discussion];
        let replyInputContainer = document.createElement("card");
        replyInputContainer.classList.add("root");
        replyInputContainer.classList.add("row");
        let replyInput = document.createElement("textarea");
        let replyButton = document.createElement("span");
        replyInput.placeholder = "Enter a Reply . . .";
        replyInput.classList.add("small");
        replyButton.innerText = "Reply";
        replyButton.classList.add("small");
        replyButton.classList.add("post-button");
        replyButton.classList.add("highlight");
        replyButton.addEventListener("click", function () {updateReplies(replyInput.value, discussion)});
        replyInputContainer.appendChild(replyInput);
        replyInputContainer.appendChild(replyButton);
        wholeDiscussionBox.appendChild(replyInputContainer);
        discussionContainer.appendChild(wholeDiscussionBox);
        
        // for each reply for this discussion
        for(let reply in discussionReplies) {
            //create a reply container, box, date, user
            let replyContainer = document.createElement("span");
            let replyBox = document.createElement("p");
            replyBox.classList.add("card");
            let replyDate = document.createElement("span");
            let replyUser = document.createElement("span");
            let replyText = document.createElement("span");
            // add the corresponding classes to the date, text and user
            replyDate.classList.add("discussion-date-box");
            replyText.classList.add("discussion-text-box");
            replyUser.classList.add("discussion-user-box");
            replyDate.innerText = reply;
            replyUser.innerText = "Boonyasit Warachan";
            replyText.innerText = discussionReplies[reply];
            replyBox.appendChild(replyUser);
            replyBox.appendChild(replyDate);
            replyBox.appendChild(replyText);
            replyContainer.appendChild(replyBox);
            wholeDiscussionBox.appendChild(replyContainer); 
        }
    }
}

function updateReplies(reply, discussion) {
    if (!replies[discussion]) {
        replies[discussion] = [];
    }
    replies[discussion].push(reply);
    updateDiscussionContainer();
}

