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
        let first_course_id = enrollments[0]["course"]["id"];

        for (let enrollment of enrollments) {
            console.log(enrollment);
            let course_name = enrollment["course"]["name"];
            let course_id = enrollment["course"]["id"];
            let assignments = enrollment["course"]["assignments"]["data"];

            const courseElement = document.getElementById("course");
            courseElement.href = `/${user_id}/course/${first_course_id}`;

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
        // get all enrolled course
        let courses = user.enrolls.data;
        console.log(courses);
        
        // select which course to display
        let courseSelection = document.getElementById("courseSelection");
        let userRoleElement = document.getElementById("userRole");
        let gradeCard = document.getElementById("grading");

        // get the weights of the courses from the db
        let courseWeights = {
            "attendance" : 10,
            "assignment" : 10,
            "lab" : 10,
            "project": 10,
            "midterm": 30,
            "final": 30
        }
        
        // populate the weight table depending on which course is selected
        function populateWeightTable(courseSelection) {
            
            //check which course is selected and get the weights from course selected
            let courseSelectedIndex = courseSelection.selectedIndex;
            let courseSelected = courseSelection.options[courseSelectedIndex];

            let attendanceWeight = document.getElementById("attendanceWeight");
            let assignmentWeight = document.getElementById("assignmentWeight");
            let labWeight = document.getElementById("labWeight");
            let projectWeight = document.getElementById("projectWeight");
            let midtermWeight = document.getElementById("midtermWeight");
            let finalWeight = document.getElementById("finalWeight");

            attendanceWeight.innerText = courseWeights.attendance;
            assignmentWeight.innerText = courseWeights.assignment;
            labWeight.innerText = courseWeights.lab;
            projectWeight.innerText = courseWeights.project;
            midtermWeight.innerText = courseWeights.midterm;
            finalWeight.innerText = courseWeights.final;

            attendanceWeight.addEventListener("click", function(e) {
                editGradeWeight(e, "attendance");
            });
            assignmentWeight.addEventListener("click", function(e) {
                editGradeWeight(e, "assignment");
            });
            labWeight.addEventListener("click", function(e) {
                editGradeWeight(e, "lab");
            });
            projectWeight.addEventListener("click", function(e) {
                editGradeWeight(e, "project");
            });
            midtermWeight.addEventListener("click", function(e) {
                editGradeWeight(e, "midterm");
            });
            finalWeight.addEventListener("click", function(e) {
                editGradeWeight(e, "final");
            });

            function editGradeWeight(e, name) {
                let toEdit = e.target;
                let newInput = document.createElement("input");
                let positiveFloatPattern = /^[0-9]*\.?[0-9]+$/;
            
                newInput.type = "text";
                newInput.style.width = "3rem";
                newInput.style.height = "1rem";
            
                toEdit.parentNode.replaceChild(newInput, toEdit);
                newInput.focus();
            
                newInput.addEventListener("keydown", function (e) {
                    if (e.key == "Enter") {
                        let newWeight = e.target.value;
                        if (positiveFloatPattern.test(newWeight)) {

                            let newWeightOutput = document.createElement("span");
                            newWeightOutput.innerText = newWeight;

                            courseWeights[name] = parseFloat(newWeight);
                            console.log(courseWeights);

                            newWeightOutput.addEventListener("click", function(e) {
                                editGradeWeight(e, name, courseWeights);
                            });
                            e.target.parentNode.replaceChild(newWeightOutput, e.target);
                            
                            populateGradeTable(courseSelection);
                        } else {
                            alert("Invalid Weight");
                        }
                    }
                });
            }
            
        }

        function populateGradeTable(courseSelection) {
            console.log(courseSelection);

            // see which course is selected
            let courseSelectedIndex = courseSelection.selectedIndex;
            let courseSelected = courseSelection.options[courseSelectedIndex];
            let gradeTableBody = document.getElementById("gradeTableBody");

            // empty the grade table
            gradeTableBody.innerHTML = "";

            // check the course id and course name
            console.log(courseSelected.value);
            console.log(courseSelected.text);

            // if there are enrolled courses
            if (courses && courses.length > 0) {

                // loop through each course
                for (let course of courses) {

                    // find the course that matches the selected course
                    if(course.course.id == courseSelected.value) {
                        console.log("course found");
                        
                        // get the students enrolled in that course
                        let students = course.course.students.data;
                        console.log(students);

                        // if there are students enrolled
                        if (students && students.length > 0) {

                            // get each student's scores
                            for (let student of students) {
                                let scores = {
                                    "attendance" : 0,
                                    "assignment" : 0,
                                    "lab" : 0,
                                    "project" : 0,
                                    "midterm" : 0,
                                    "final" : 0
                                }
                                console.log(student);

                                // function for making cell
                                function makeCell(name, parent, index) {
                                    // get the weight and the score for the category
                                    let weight = courseWeights[name];
                                    let score = scores[name];
                                    console.log("score" + score);
                                    console.log("weight" + weight);

                                    // make a new cell
                                    let newCell = parent.insertCell(index);
                                    newCell.classList.add("grade-table-body-cell");
                                    newCell.classList.add("grade-cell-score");
                                
                                    // make a span for the score that can be edited
                                    let scoreSpan = document.createElement("span");
                                    scoreSpan.innerText = score;

                                    scoreSpan.addEventListener("click", function(e) {
                                        editScore(e, name);
                                    });
                                
                                    // make a span for displaying the weight
                                    let weightSpan = document.createElement("span");
                                    weightSpan.classList.add("small-bold");
                                    weightSpan.innerText = " / " + weight;
                                
                                    newCell.appendChild(scoreSpan);
                                    newCell.appendChild(weightSpan);
                                }
                                // function for editing student score in grade table
                                function editScore(e, name) {
                                    let toEdit = e.target;
                                    let weight = courseWeights[name];
                                
                                    // create an input for the score and focus it
                                    let scoreInput = document.createElement("input");
                                    scoreInput.style.height = "1rem";
                                    scoreInput.style.width = "2rem";
                                    scoreInput.type = "text";
                                
                                    // replace the score with the input
                                    toEdit.parentNode.replaceChild(scoreInput, toEdit);
                                    scoreInput.focus();
                                
                                    // if key down on the input and it is enter
                                    scoreInput.addEventListener("keydown", function (e) {
                                        if (e.key === "Enter") {
                                            // pattern for positive floats
                                            let pattern = /^[0-9]+(\.[0-9]+)?$/;
                                
                                            // check if the input is a positive float
                                            if (pattern.test(scoreInput.value)) {
                                                // get the float of the result
                                                let result = parseFloat(scoreInput.value);
                                                if (result <= weight) {
                                                    let score = result.toFixed(2);
                                                    scores[name] = score; 
                                
                                                    // Update the corresponding score cell directly
                                                    let parentCell = scoreInput.parentNode;
                                                    let newScoreSpan = document.createElement("span");
                                                    newScoreSpan.innerText = score;
                                                    newScoreSpan.addEventListener("click", function (e) {
                                                        editScore(e, name);
                                                    });

                                                    parentCell.innerHTML = "";
                                                    parentCell.appendChild(newScoreSpan);
                                                    let newWeightSpan = document.createElement("span");
                                                    newWeightSpan.innerText = " / " + weight;

                                                    parentCell.appendChild(newScoreSpan);
                                                    parentCell.appendChild(newWeightSpan);

                                                    // Add event listener to the new score span
                                                    newScoreSpan.addEventListener("click", function (e) {
                                                        editScore(e, name);
                                                    });
                                
                                                    // Recalculate and update the total score
                                                    let totalCell = parentCell.parentNode.cells[7];
                                                    let totalScore = calculateTotalScore(parentCell.parentNode);
                                                    totalCell.innerHTML = `<span>${totalScore}</span> / 100`;

                                                    // Update the grade cell
                                                    // let gradeCell = parentCell.parentNode.cells[8];
                                                    // let grade = calculateGrade(totalScore);
                                                    // gradeCell.innerHTML = `<span>${grade}</span>`;
                                
                                                } else { // if result is more than the max
                                                    alert("Invalid! Score cannot exceed weight ");
                                                }
                                            } else {
                                                alert("Invalid input! Please enter a valid float value.");
                                            }
                                        }
                                    });
                                }

                                function calculateTotalScore(parent) {
                                    let total = 0;
                                    for (let i = 1; i < 6; i++) {
                                        let cur = parent.cells[i];
                                        let score = cur.querySelectorAll("span")[0].innerText;
                                        total += parseFloat(score);
                                    }
                                    return total;
                                }
                                

                                // make an info row at the end of the table
                                let infoRow = gradeTableBody.insertRow(-1);
                                infoRow.classList.add("small");
                                
                                // make the first cell for the student id
                                let infoCell = infoRow.insertCell(-1);
                                infoCell.classList.add("grade-table-body-cell");

                                // info is put into span
                                let infoSpan = document.createElement("span");
                                infoCell.appendChild(infoSpan);
                                infoSpan.innerText = student.id;

                                // make cells for the different categories
                                makeCell("attendance", infoRow, 1);
                                makeCell("assignment", infoRow, 2);
                                makeCell("lab", infoRow, 3);
                                makeCell("project", infoRow, 4);
                                makeCell("midterm", infoRow, 5);
                                makeCell("final", infoRow, 6);

                                // get the scoresum by adding all the scores
                                let scoreSum = 0;
                                for (let i = 1; i < 6; i++) {
                                    let cur = infoRow.cells[i];
                                    let score = cur.querySelectorAll("span")[0].innerText;
                                    scoreSum += parseFloat(score);
                                }

                                // make the total score cell
                                totalCell = infoRow.insertCell(7);
                                totalCell.classList.add("grade-table-body-cell");
                                totalCell.classList.add("grade-cell-score");
                                gradeSpan = document.createElement("span");
                                gradeSpan.innerText = scoreSum;
                                totalCell.appendChild(gradeSpan);
                                gradeSpan = document.createElement("span");
                                gradeSpan.classList.add("small-bold");
                                gradeSpan.innerText = " / 100";
                                totalCell.appendChild(gradeSpan);

                                // the grade cell
                                gradeCell = infoRow.insertCell(8);
                                gradeCell.classList.add("grade-table-body-cell");
                                gradeCell.classList.add("grade-cell-score");
                                gradeSpan = document.createElement("span");
                                gradeSpan.addEventListener("click", editGrade);
                                gradeSpan.innerText = "A";
                                gradeCell.appendChild(gradeSpan);
                            }
                        }
                    }
                }
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
                        inputValue = weightInput.value.toUpperCase();
                        if (inputValue == "A" || inputValue == "B+" || inputValue == "B" || inputValue == "C+" || inputValue == "C" || inputValue == "D+" || inputValue == "D" || inputValue == "F") {
                            let weightOutput = document.createElement("span");
                            weightOutput.innerText = inputValue;
                            weightOutput.addEventListener("click", editGrade);
                            e.target.parentNode.replaceChild(weightOutput, e.target);
                        } else {
                            alert("Invalid input! Please enter a valid grade.")
                        }
                    }
                });
            }
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
            courseSelection.addEventListener("change", function () {
                populateGradeTable(courseSelection, courseWeights);
                populateWeightTable(courseSelection, courseWeights);
            });
    
            // Initial call to populate grade table with the default selected option
            populateGradeTable(courseSelection, courseWeights);
            populateWeightTable(courseSelection, courseWeights);
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
