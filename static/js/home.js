document.addEventListener("DOMContentLoaded", function () {
    const userElement = document.getElementById("user-data");
    let user = userElement.getAttribute("data");

    fetch(`/students/${user}`)
        .then(response => response.json())
        .then(user => {
            console.log(user);
            role = user.role;
            if (user.role === "student") {
                initForStudent(user);
            } else if (user.role === "teacher"){
                initForTeacher(user);
            }
            updateAssignment(user);
            // updateClasses(user);
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });

    const dateElement = document.getElementById("date");
    const timeElement = document.getElementById("time");
    const timetableElement = document.getElementById("timetable");
    const assignmentsElement = document.getElementById("assignments");

    function updateAssignment(userData) {
        assignmentsElement.innerHTML = "";

        if (!userData || !userData.id) {
            return;
        }
        let user_id = userData.id;
        let enrolls = userData.enrolls;
        let enrollments = enrolls["data"];

        for (let enrollment of enrollments) {
            console.log(enrollment);
            let course_name = enrollment["course"]["name"];
            let course_id = enrollment["course"]["id"];
            let assignments = enrollment["course"]["assignments"]["data"];

            if (Array.isArray(assignments)) {
                for (let assignment of assignments) {
                    let assignment_id = assignment["id"];
                    let a = document.createElement("a");
                    a.href = `/${user_id}/course/${course_id}/assignment/${assignment_id}`;
                    a.className = "assignment-bar";
                    a.id = course_name;
                    let div1 = document.createElement("div");
                    let div2 = document.createElement("div");

                    let span1 = document.createElement("span");
                    span1.className = "medium";
                    span1.textContent = assignment["title"];

                    let span2 = document.createElement("span");
                    span2.textContent = course_name;
                    span2.className = "small";

                    let divhighlight = document.createElement("div");
                    divhighlight.className = "highlight";

                    let spantime = document.createElement("span");
                    spantime.className = "small";

                    let dueDate = new Date(assignment["due_date"]);
                    let dueTime = assignment["due_time"];

                    if (isToday(dueDate)) {
                        spantime.textContent = `Today, ${dueTime}`;
                    } else if (isUpcoming(dueDate)) {
                        spantime.textContent = `${getDayOfWeek(dueDate)}, ${dueTime}`;
                    } else {
                        // If overdue, don't create anything
                        continue;
                    }

                    div1.appendChild(span1);
                    div1.appendChild(span2);

                    divhighlight.appendChild(spantime);
                    div2.appendChild(divhighlight);

                    a.appendChild(div1);
                    a.appendChild(div2);

                    assignmentsElement.appendChild(a);
                }
            }
        }
    }

    function initForStudent(user) {
        console.log("initing for student");
        console.log(user.id + " " + user.name + " " + user.role);
        let userRoleElement = document.getElementById("userRole")
        userRoleElement.innerText = "Student";
        let profileCard = document.getElementById("profile-card");
        profileCard.style.display = "flex";
    }

    function initForTeacher(user) {
        let courses = user.enrolls.data;
        console.log(courses);
        
        let courseSelection = document.getElementById("courseSelection");
        let userRoleElement = document.getElementById("userRole");
        let gradeCard = document.getElementById("grading");

        let assignmentWeight = document.getElementById("assignmentWeight");
        let labWeight = document.getElementById("labWeight");
        let projectWeight = document.getElementById("projectWeight");
        let midtermWeight = document.getElementById("midtermWeight");
        let finalWeight = document.getElementById("finalWeight");

        assignmentWeight.addEventListener("click", function(e) {
            editGradeWeight(e);
        })
        labWeight.addEventListener("click", function(e) {
            editGradeWeight(e);
        })
        projectWeight.addEventListener("click", function(e) {
            editGradeWeight(e);
        })
        midtermWeight.addEventListener("click", function(e) {
            editGradeWeight(e);
        })
        finalWeight.addEventListener("click", function(e) {
            editGradeWeight(e);
        })

        function populateGradeTable() {
            let courseSelectedIndex = courseSelection.selectedIndex;
            let courseSelected = courseSelection.options[courseSelectedIndex];
            let gradeTableBody = document.getElementById("gradeTableBody");
            gradeTableBody.innerHTML = "";
            console.log(courseSelected.value);
            console.log(courseSelected.text);
            if (courses && courses.length > 0) {
                for (let course of courses) {
                    if(course.course.id == courseSelected.value) {
                        console.log("course found");
                        let students = course.course.students.data;
                        console.log(students);
                        if (students && students.length > 0) {
                            for (let student of students) {
                                console.log(student);
                                let infoRow = gradeTableBody.insertRow(-1);
                                infoRow.classList.add("small");
                                
                                let infoCell = infoRow.insertCell(-1);
                                infoCell.classList.add("grade-table-body-cell");

                                let infoSpan = document.createElement("span");
                                infoCell.appendChild(infoSpan);
                                infoSpan.innerText = student.id;

                                for (let i = 1; i < 8; i++) {
                                    infoCell = infoRow.insertCell(i);
                                    infoCell.classList.add("grade-table-body-cell");
                                    infoCell.classList.add("grade-cell-score")
                                    let scoreSpan = document.createElement("span");
                                    scoreSpan.addEventListener("click", editGrade);
                                    let separatorSpan = document.createElement("span");
                                    let totalScoreSpan = document.createElement("span");
                                    totalScoreSpan.classList.add("small-bold");
                                    scoreSpan.innerText = 0;
                                    separatorSpan.innerText = " / ";
                                    totalScoreSpan.innerText = 30
                                    infoCell.appendChild(scoreSpan);
                                    infoCell.appendChild(separatorSpan);
                                    infoCell.appendChild(totalScoreSpan);
                                }
                            }
                        }
                    }
                }
            }
        }

        function editGradeWeight(e) {
            let toEdit = e.target;
            let weightInput = document.createElement("input");
            toEdit.parentNode.replaceChild(weightInput, toEdit);
            weightInput.focus();
            weightInput.style.height = "1rem";
            weightInput.style.width = "3rem";
            weightInput.addEventListener("keydown", function(e) {
                if (e.key === "Enter") {
                    let weightOutput = document.createElement("span");
                    weightOutput.innerText = weightInput.value + "%";
                    weightOutput.addEventListener("click", editGradeWeight);
                    e.target.parentNode.replaceChild(weightOutput, e.target);
                }
            });
        }

        function editGrade(e) {
            let toEdit = e.target;
            let weightInput = document.createElement("input");
            toEdit.parentNode.replaceChild(weightInput, toEdit);
            weightInput.focus();
            weightInput.style.height = "1rem";
            weightInput.style.width = "2rem";
            weightInput.addEventListener("keydown", function(e) {
                if (e.key === "Enter") {
                    let weightOutput = document.createElement("span");
                    weightOutput.innerText = weightInput.value;
                    weightOutput.addEventListener("click", editGrade);
                    e.target.parentNode.replaceChild(weightOutput, e.target);
                }
            });
        }

        // populate options to choose to populate grade table
        if (courses && courses.length > 0) {
            for (let course of courses) {
                let courseOption = document.createElement("option");
                courseOption.value = course.course.id;
                courseOption.innerText = course.course.name;
                courseSelection.appendChild(courseOption);
            }
    
            // Event listener for dropdown change
            courseSelection.addEventListener("change", populateGradeTable);
    
            // Initial call to populate grade table with the default selected option
            populateGradeTable();
        }
        // Set user role and display the grade card
        userRoleElement.innerText = "Teacher";
        gradeCard.style.display = "flex";
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

    function updateDateTime() {
        let current = new Date();
        let formatDate = { weekday: 'long', day: 'numeric', month: 'long' };
        let formatTime = { hour: '2-digit', minute: '2-digit' };

        let date = current.toLocaleDateString('en-US', formatDate);
        let time = current.toLocaleTimeString('en-US', formatTime);

        dateElement.textContent = date;
        timeElement.textContent = time;

        let currentDay = current.getDay();
        // Sunday - Saturday : 0 - 6
        if (currentDay == 0 || currentDay == 6) {
            timetableElement.innerHTML = "";
            let div = document.createElement("div");
            let span = document.createElement("span");
            div.className = "classes-bar-small";
            span.className = "medium";
            span.innerHTML = "No Classes Today";
            div.style.borderBottom = "none";
            div.appendChild(span);
            timetableElement.appendChild(div);
        }
        else if (currentDay == 1) {

        }
    }
    updateAssignment();
    updateDateTime();
    setInterval(updateDateTime, 60000);

    const gradeCourseTitle = document.getElementById("gradeCourseTitle");



});
