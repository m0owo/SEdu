const userElement = document.getElementById("user-data");
const user = userElement.getAttribute("data");
const course_id = userElement.getAttribute("course");
const role = userElement.getAttribute("role");

// alternating between discussion, upcoming, and completed
const discussionEl = document.getElementById("discussion");
const upcomingEl = document.getElementById("upcoming");
const completedEl = document.getElementById("completed");
const newButton = document.getElementById("new-assignment");

discussionEl.addEventListener("click", showDiscussion);
upcomingEl.addEventListener("click", showUpcoming);
completedEl.addEventListener("click", showCompleted);
newButton.addEventListener("click", addNewAssignment);

// for adding new assignment in upcoming
function addNewAssignment() {
    // Make a POST request to create an empty assignment
    fetch(`/create-new-assignment/${course_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "course_id": course_id,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Assignment created:', data);
        fetchDBtoUpdate();
    })
    .catch(error => {
        console.error('Error creating assignment:', error);
    });
}

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

// pull assignments from database
document.addEventListener("DOMContentLoaded", fetchDBtoUpdate);

function fetchDBtoUpdate() {
    let userData;
    fetch(`/students/${user}`)
        .then(response => response.json())
        .then(user => {
            pullAssignmentFromDB(user, course_id);
            pullDiscussionsFromDB(user, course_id)
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });

    const sidebarElement = document.getElementById("sidebar");

    function pullDiscussionsFromDB(userData, course_id_focus) {
        let discussionContainer = document.getElementById("discussionContainer");
        discussionContainer.innerHTML = "";
        
        if (!userData || !userData.id) {
            return;
        }
        
        let id = userData.id;
        let enrolls = userData.enrolls;
        let enrollments = enrolls["data"];

        for (let enrollment of enrollments) {
            let course_id = enrollment["course"]["id"];
            let posts = enrollment["course"]["posts"]["data"];

            if (Array.isArray(posts) && course_id == course_id_focus) {
                for (let i = (posts.length - 1); i >= 0; i--) {
                    let post = posts[i];
                    console.log(post)
                    let date = post.posted_date;
                    let time = post.posted_time;
                    let comments = post.classroom_comments.data;
                    
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
                    textBox.innerText = post.content;
                    userBox.innerText = post.author;
            
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
                    replyButton.addEventListener("click", (function(course_id_focus, i) {
                        return function() {
                            addNewReply(replyInput, course_id_focus, i);
                        };
                    })(course_id_focus, i));
            
                    // add the reply input and the reply post button to the container
                    replyInputContainer.appendChild(replyInput);
                    replyInputContainer.appendChild(replyButton);
            
                    // add the discussion to the whole discussion box
                    wholeDiscussionBox.appendChild(discussionBox);
                    wholeDiscussionBox.appendChild(replyInputContainer)

                    if (comments && comments.length > 0) { // if there are replies
                        for (let comment of comments) {
                            console.log(comment);
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
            
                            let date = comment.comment_date;
                            let time = comment.comment_time;
            
                            replyDateElement.innerText = date + ", " + time;
                            replyUser.innerText = comment.commenter;
                            replyTextBox.innerText = comment.text;
            
                            replyBox.appendChild(replyUser);
                            replyBox.appendChild(replyDateElement);
                            replyBox.appendChild(replyTextBox);
                            replyContainer.appendChild(replyBox);
                            wholeDiscussionBox.appendChild(replyContainer);
                        }
                    }
                    discussionContainer.appendChild(wholeDiscussionBox);
                }
            }
        }
    }
    function pullAssignmentFromDB(userData, course_id_focus) {
        const upcomingSectionEl = upcomingEl.querySelector(".section");
        const completedSectionEl = completedEl.querySelector(".section");

        upcomingSectionEl.innerHTML = "";
        completedSectionEl.innerHTML = "";

        if (!userData || !userData.id) {
            return;
        }
    
        let user_id = userData.id;
        let enrolls = userData.enrolls;
        let enrollments = enrolls["data"];
    
        for (let enrollment of enrollments) {
            console.log(enrollment["course"]);
            let course_id = enrollment["course"]["id"];
            let assignments = enrollment["course"]["assignments"]["data"];
            console.log(enrollment["course"]["assignments"]);

            if (Array.isArray(assignments) && course_id == course_id_focus) {
                for (let assignment of assignments) {
                    //console.log(assignment);
                    let assignment_id = assignment["id"];

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
                    a.href = `${course_id}/assignment/${assignment_id}`;
                    a.innerHTML = "VIEW ASSIGNMENT";

                    // if it is past assignment due date, put it in completed
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
}

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

function addNewReply(reply_input, course_id, post_id) {
    const reply_element = reply_input;
    let content = reply_element.value;
    if (content != "") {
        reply_element.value = "";
        let current_time = new Date();
        let format_date = { month: 'numeric', day: 'numeric', year: 'numeric'};
        let format_time = { hour: '2-digit', minute: '2-digit' };
        let posted_date = current_time.toLocaleDateString('en-US', format_date);
        let posted_time = current_time.toLocaleTimeString('en-US', format_time);
        
        fetch(`/post-new-reply/${course_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "commenter": user,
                "comment_date": posted_date,
                "comment_time": posted_time,
                "comment_text": content,
                "comment_post": post_id
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Comment Posted:', data);
        })
        .catch(error => {
            console.error('Error Posting Comment:', error);
        });
        fetchDBtoUpdate();
    }
}

function addNewDiscussion() {
    const discussion_element = document.getElementById("discussionInput");
    let content = discussion_element.value;
    if (content != "") {
        discussion_element.value = "";
        let current_time = new Date();
        let format_date = { month: 'numeric', day: 'numeric', year: 'numeric'};
        let format_time = { hour: '2-digit', minute: '2-digit' };
        let posted_date = current_time.toLocaleDateString('en-US', format_date);
        let posted_time = current_time.toLocaleTimeString('en-US', format_time);
        // Make a POST request to create discussion
        fetch(`/post-new-discussion/${course_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "course_id": course_id,
                "author": user,
                "posted_date": posted_date,
                "posted_time": posted_time,
                "content": content,
            }),        
        })
        .then(response => response.json())
        .then(data => {
            console.log('Discussion Posted:', data);
        })
        .catch(error => {
            console.error('Error Posting Discussion:', error);
        });
        fetchDBtoUpdate();
    }
}

// // discussion posts
// let exampleDate = new Date();
// let exampleUser = "Boonyasit Warachan";
// let replies = [
//     {
//         "user": "Boonyasit WaraMoon",
//         "date" : exampleDate,
//         "content": "This is an Example Reply",
//     }
// ]
// let discussions = [
//     {
//         "user": "Boonyasit Warachan",
//         "date":  exampleDate,
//         "content": "This is an example message",
//         "replies": replies,
//     }
// ]; 

// // init the discussion input and the container and the post button
// const discussionInput = document.getElementById("discussionInput");
// const discussionContainer = document.getElementById("discussionContainer");
// const postButton = document.getElementById("postButton");

// // if you click the post buttion, you post a discussion
postButton.addEventListener("click", addNewDiscussion); //change to postDiscussion for therapy


// function postDiscussion() {
//     // if the discussion input is not empty
//     if (discussionInput.value != "") {
//         // get the current date and formati it
//         let current = new Date();
//         let discussion = {
//             "user" : exampleUser,
//             "date" : current,
//             "content" : discussionInput.value,
//             "replies" : [],
//         }
//         discussions.push(discussion);
//         // clear the input
//         discussionInput.value = "";
//         updateDiscussionContainer();
//     }
// }

// function updateDiscussionContainer() {
//     // empty the container
//     discussionContainer.innerHTML = "";

//     for (let discussion of discussions) {
//         //format the date
//         let formatDate = { month: 'numeric', day: 'numeric', year: 'numeric'};
//         let formatTime = { hour: '2-digit', minute: '2-digit' };
//         let date = discussion.date.toLocaleDateString('en-US', formatDate);
//         let time = discussion.date.toLocaleTimeString('en-US', formatTime);
        
//         // create a discussion box for discussion and replies
//         let wholeDiscussionBox = document.createElement("div");
//         wholeDiscussionBox.classList.add("column");
//         wholeDiscussionBox.classList.add("card");
//         wholeDiscussionBox.classList.add("whole-discussion-box");

//         // create a discussion box for user, text, and date
//         let discussionBox = document.createElement("div");
//         discussionBox.classList.add("card");
//         discussionBox.classList.add("discussion");
//         discussionBox.classList.add("discussion-box");
//         discussionBox.classList.add("medium");
//         discussionBox.classList.add("light-highlight");

//         // create the boxes for user, text, and date
//         let dateBox = document.createElement("span");
//         let textBox = document.createElement("span");
//         let userBox = document.createElement("span");
//         dateBox.classList.add("discussion-date-box");
//         textBox.classList.add("discussion-text-box");
//         userBox.classList.add("discussion-user-box");

//         // add date, text, and user to the discussion box
//         dateBox.innerText = date + ", " + time;
//         textBox.innerText = discussion.content;
//         userBox.innerText = discussion.user;

//         discussionBox.appendChild(userBox);
//         discussionBox.appendChild(dateBox);
//         discussionBox.appendChild(textBox);
        
//         // create a container for the input and the post reply button
//         let replyInputContainer = document.createElement("div");
//         replyInputContainer.classList.add("root");
//         replyInputContainer.classList.add("row");
//         let replyInput = document.createElement("textarea");
//         let replyButton = document.createElement("span");
//         replyInput.placeholder = "Enter a Reply . . .";
//         replyInput.classList.add("small");
//         replyButton.innerText = "Reply";
//         replyButton.classList.add("small");
//         replyButton.classList.add("post-button");

//         // when clicking the post reply button, add the value of the input to the replies 
//         replyButton.addEventListener("click", function () {
//             let current = new Date();
//             discussion.replies.push(
//                 {
//                     "user": exampleUser,
//                     "date": current,
//                     "content": replyInput.value,
//                 }
//             );
//             replyInput.value = "";
//             updateDiscussionContainer();
//         });

//         // add the reply input and the reply post button to the container
//         replyInputContainer.appendChild(replyInput);
//         replyInputContainer.appendChild(replyButton);

//         // add the discussion to the whole discussion box
//         wholeDiscussionBox.appendChild(discussionBox);

//         // Display replies for the current discussion
//         if (discussion.replies) { // if there are replies
//             for (let reply of discussion.replies) {
//                 console.log(reply);
//                 // create a container for all replies
//                 let replyContainer = document.createElement("div");
//                 replyContainer.classList.add("column");
//                 replyContainer.classList.add("whole-discussion-box");
//                 replyContainer.classList.add("reply-container");
//                 replyContainer.classList.add("root");

//                 //create reply box for one reply
//                 let replyBox = document.createElement("div");
//                 replyBox.classList.add("discussion");
//                 replyBox.classList.add("discussion-box");
//                 replyBox.classList.add("small");
//                 replyBox.classList.add("card");

//                 // create element for the reply user, date, and text
//                 let replyDateElement = document.createElement("span");
//                 let replyUser = document.createElement("span");
//                 let replyTextBox = document.createElement("span");
//                 replyDateElement.classList.add("discussion-date-box");
//                 replyTextBox.classList.add("discussion-text-box");
//                 replyUser.classList.add("discussion-user-box");

//                 // format the date
//                 let formatDate = { month: 'numeric', day: 'numeric', year: 'numeric'};
//                 let formatTime = { hour: '2-digit', minute: '2-digit' };
//                 let date = reply.date.toLocaleDateString('en-US', formatDate);
//                 let time = reply.date.toLocaleTimeString('en-US', formatTime);

//                 replyDateElement.innerText = date + ", " + time;
//                 replyUser.innerText = reply.user;
//                 replyTextBox.innerText = reply.content;

//                 replyBox.appendChild(replyUser);
//                 replyBox.appendChild(replyDateElement);
//                 replyBox.appendChild(replyTextBox);
//                 replyContainer.appendChild(replyBox);
//                 wholeDiscussionBox.appendChild(replyContainer);
//             }
//         } else {
//             discussion.replies = [];
//         }
//         discussionContainer.appendChild(wholeDiscussionBox);
//         wholeDiscussionBox.appendChild(replyInputContainer);
//     }
// }
