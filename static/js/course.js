document.addEventListener("DOMContentLoaded", initCoursePage);

function initCoursePage() {
    // get user info and display role
    const userElement = document.getElementById("user-data");
    const user = userElement.getAttribute("data");
    const userName = userElement.getAttribute("name");
    const course_id = userElement.getAttribute("course");
    const role = userElement.getAttribute("role");
    const roleSpan = document.getElementById("userRole");
    if (role == "student") {
        roleSpan.innerText = "Student";
    } else if (role == "teacher") {
        roleSpan.innerText = "Teacher";
    }

    // alternate between showing discussion, upcoming, and complete assignments
    const discussionEl = document.getElementById("discussion");
    const upcomingEl = document.getElementById("upcoming");
    const completedEl = document.getElementById("completed");
    const newButton = document.getElementById("new-assignment");

    discussionButton.addEventListener("click", showDiscussion);
    upcomingButton.addEventListener("click", showUpcoming);
    completedButton.addEventListener("click", showCompleted);
    newButton.addEventListener("click", addNewAssignment);

    // dont show add element button if user is student
    if (role == "student") {
        newButton.style.display = "none";
    }

    // alternating display functions
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

    fetchDBtoUpdate()

    const postButton = document.getElementById("postButton");
    postButton.addEventListener("click", addNewDiscussion);

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
                    "course_id": course_id,
                    "commenter": userName,
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
                    "author": userName,
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
    // update display using DB depending on the current course
    function fetchDBtoUpdate() {
        // fetch user data from database
        fetch(`/students/${user}`)
            .then(response => response.json())
            .then(user => {
                pullAssignmentsFromDB(user, course_id);
                pullDiscussionsFromDB(user, course_id)
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    
        // display the discussions
        function pullDiscussionsFromDB(userData, course_id_focus) {
            // get the discussions element
            const discussionContainer = document.getElementById("discussionContainer");
            discussionContainer.innerHTML = "";
    
            // if user doesn't exist, exit
            if (!userData || !userData.id) {
                return;
            }
    
            // get enrolled courses
            let enrolls = userData.enrolls;
            let enrollments = enrolls["data"];
    
            // for each enrollment, get the discussions of the course by comparing the course id
            for (let enrollment of enrollments) {
                let course_id = enrollment["course"]["id"];
                let posts = enrollment["course"]["posts"]["data"];
    
                if (Array.isArray(posts) && course_id == course_id_focus) {
                    // loop in reverse to display latest post
                    for (let i = (posts.length - 1); i >= 0; i--) {
                        let post = posts[i];
                        console.log(post);
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
                        replyInputContainer.style.padding = "0.5rem";
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
        function pullAssignmentsFromDB(userData, course_id_focus) {
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
            let first_course_id = enrollments[0]["course"]["id"];
        
            for (let enrollment of enrollments) {
                console.log(enrollment["course"]);
                let course_id = enrollment["course"]["id"];
                let assignments = enrollment["course"]["assignments"]["data"];
                console.log(enrollment["course"]["assignments"]);

                const courseElement = document.getElementById("course");
                courseElement.href = `/${user_id}/course/${first_course_id}`;
    
                if (Array.isArray(assignments) && course_id == course_id_focus) {
                    for (let assignment of assignments) {
                        console.log(assignment);
                        let assignment_id = assignment["id"];
    
                        let divcard = document.createElement("div");
                        divcard.className = "card";
                        divcard.style.height = "9rem";
                        divcard.style.justifyContent = "center";
    
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
                        } else if (isUpcoming(dueDate) > 0) {
                            if (isUpcoming(dueDate) <= 7) {
                                spantime.textContent = `${getDayOfWeek(dueDate)}, ${dueTime}`;
                            } else if (isUpcoming(dueDate) > 7) {
                                let formatOptions = {
                                    month: 'numeric',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                };
                                let formattedDateTime = dueDate.toLocaleString('en-US', formatOptions);
                                spantime.textContent = formattedDateTime;
                            }
    
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
    return someDate - today;
}

function getDayOfWeek(someDate) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return daysOfWeek[someDate.getDay()];
}
