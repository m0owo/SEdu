let currentTime = new Date();
document.addEventListener("DOMContentLoaded", function () {
    const userElement = document.getElementById("user-data");
    let user = userElement.getAttribute("data");


    fetch(`/students/${user}`)
        .then(response => response.json())
        .then(user => {
            console.log("fetched user");
            console.log(user);
            if (user.role === "student") {
                initForStudent(user);
            } else if (user.role === "teacher"){
                initForTeacher(user);
            }
            updateAssignment(user);
            updateClasses(user);
            setInterval(function () {
                currentTime = new Date();
                // Update classes with the latest current time
                updateClasses(user);
            }, 60000); // 60000 milliseconds = 1 minute
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

    function updateClasses(user){
        timetableElement.textContent = ""
        let user_id = user.id;
        let enrolls = user.enrolls;
        let enrollments = enrolls["data"];
        console.log("Enrollments" + enrollments);
        let allTodayClass = []

        for (let enrollment of enrollments) {
            let course_name = enrollment["course"]["name"];
            let course_id = enrollment["course"]["id"];
            let timeLists = enrollment["course"]["timeList"]["data"];

            if (Array.isArray(timeLists)){
                for (let timeList of timeLists){
                    let day = timeList["day"];
                    let starttime =  timeList["starttime"];
                    let endtime = timeList["endtime"]
                    let type = timeList["type"];
                
                    if(isDay(day)){
                        console.log("Today learn this", course_name);
                        let existingEnrollment = allTodayClass.find(e => e.course.id === enrollment.course.id);
                         if (!existingEnrollment) {
                            console.log(course_name)
                            allTodayClass.push({"course": course_name, "day": day, "starttime": starttime, "endtime": endtime, "type":type});
                        }
                    }
                }
            }
        }

        console.log("All start time for today", allTodayClass);
        let classes = checkClasses(allTodayClass);
        console.log("near ", classes.nearestClass);
        console.log("rest" , classes.remainingClasses);

        if (classes.nearestClass != null){
        //Nearest Class
            let div = document.createElement("div");
            div.className = "classes-bar"
            let div1 = document.createElement("div");
            let div2 = document.createElement("div")
            div2.className = "highlight"

            let span1 = document.createElement("span");
            span1.className = "medium";
            span1.textContent = `${classes.nearestClass.name} (${classes.nearestClass.type})`;

            let span2 = document.createElement("span")
            span2.className = "small"
            span2.textContent = `${classes.nearestClass.starttime} - ${classes.nearestClass.endtime}`
            div2.appendChild(span2)
            div1.appendChild(div2);

            div.appendChild(span1);
            div.appendChild(div1)

            timetableElement.appendChild(div)
        }

        if (Array.isArray(classes.remainingClasses)){
        //Upcoming class
            for(let remainingclasss of classes.remainingClasses){
                div1 = document.createElement("div")
                div1.className = "classes-bar-small"

                span1 = document.createElement("span")
                span1.className = "medium"
                span1.textContent = `${remainingclasss.name} (${remainingclasss.type})`;

                span2 = document.createElement("span")
                span2.className = "small"
                span2.textContent = `${remainingclasss.starttime} - ${remainingclasss.endtime}`

                div1.appendChild(span1)
                div1.appendChild(span2)
                
                timetableElement.appendChild(div1)
            }
        }
    }

    function checkClasses(timeLists) {
        console.log("current time",currentTime)
        var nearestClass = null;
        var remainingClasses = [];
        var smallestDiff = Infinity;
    
        for (let timeList of timeLists) {
            let starttime = parseTimeAMPM(timeList.starttime);
            let endtime = parseTimeAMPM(timeList.endtime);
            console.log("fenoifniwe", starttime)
            
            // Check if the class start time is in the future
            if (currentTime < starttime) {
                // Check if this is the nearest upcoming class
                var timeDiff = starttime - currentTime;
                console.log("DIFFFF", timeDiff)
                if (timeDiff < smallestDiff) {
                    smallestDiff = timeDiff;
                    nearestClass = {
                        name: timeList.course,
                        starttime: timeList.starttime,
                        endtime: timeList.endtime,
                        type: timeList.type
                    };
                }else{
                    remainingClasses.push({
                        name: timeList.course,
                        starttime: timeList.starttime,
                        endtime: timeList.endtime,
                        type: timeList.type
                    });
                }
            }

        }
        console.log("Nearest Class:", nearestClass);
        console.log("Remaining Classes:", remainingClasses);
        // Sort the remaining classes by start time
        remainingClasses.sort((a, b) => parseTimeAMPM(a.starttime) - parseTimeAMPM(b.starttime));
        return {nearestClass, remainingClasses};
    }
    

    function parseTimeAMPM(timeStr) {
        var [time, modifier] = timeStr.split(' ');
        var [hours, minutes] = time.split(':').map(Number);
    
        var date = new Date();
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
    
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    function initForStudent(user) {
        console.log("initing for student");
        console.log(user.id + " " + user.name + " " + user.role);

        let userRoleElement = document.getElementById("userRole")
        userRoleElement.innerText = "Student";

        let profileCard = document.getElementById("profile-card");
        profileCard.style.display = "flex";

        let unofficialGradesDisplay = document.getElementById("unofficialGrades");
        unofficialGradesDisplay.style.display = "flex";

        let unofficialGradesTable = document.getElementById("unofficialGradesTable");

        let enrolls = user.enrolls.data;

        let totalCredits = 0;
        let totalWeightedGrades = 0;

        if (enrolls && enrolls.length > 0) {
            for (let enroll of enrolls) {
                //populate the grades table
                let newRow = unofficialGradesTable.insertRow(-1);
                let newHead = newRow.insertCell(0);
                newHead.classList.add("small-bold");
                newHead.classList.add("grade-table-body-cell");
                newHead.style.textAlign = "left";
                newHead.innerText = enroll.course.name;
                
                let newGrade = newRow.insertCell(1);
                newGrade.classList.add("small-bold");
                newGrade.classList.add("grade-table-body-cell");
                newGrade.innerText = enroll.grade;

                // calculate the unofficial GPA
                totalCredits += enroll.course.credit;
                totalWeightedGrades += (enroll.course.credit * toNumber(enroll.grade));
            }
        }

        let unofficialGPA = document.getElementById("unofficialGPA");
        let unofficialGPAValue = totalWeightedGrades/totalCredits
        unofficialGPA.innerText = unofficialGPAValue.toFixed(1);

        let gpaGrade = document.getElementById("gpaGrade");
        gpaGrade.innerText = toGrade(unofficialGPAValue);

        function toNumber(grade) {
            switch(grade) {
                case "A":
                    return 4;
                case "B+":
                    return 3.5;
                case "B":
                    return 3;
                case "C+":
                    return 2.5;
                case "C":
                    return 2;
                case "D+":
                    return 1.5;
                case "D":
                    return 1;
                case "F":
                    return 0
                default:
                    return -1;
            }
        }
        function toGrade(number) { 
            if (number > 3.5) {
                return "A";
            } else if (number >= 3) {
                return "B+";
            } else if (number >= 2.5) {
                return "B";
            } else if (number >= 2) {
                return "C+"
            } else if (number >= 1.5) {
                return "C";
            } else if (number >= 1) {
                return "D+";
            } else if (number >= 0.5) {
                return "D"
            } else {
                return "F"
            }
        } 
    }

    function getSelection() {
        let courseSelection = document.getElementById("courseSelection");
        let currentIndex = courseSelection.selectedIndex;
        let courseSelected = courseSelection.options[currentIndex];
        return courseSelected;
    }

    function initForTeacher(user) {
        console.log("initing for teacher");
        console.log(user.id + " " + user.name + " " + user.role);

        let courses = user["enrolls"].data;

        //populate the selection
        let userRoleElement = document.getElementById("userRole");
        let gradeCard = document.getElementById("grading");
        userRoleElement.innerText = "Teacher";
        gradeCard.style.display = "flex";

        // populate options to choose to populate grade table
        if (courses && courses.length > 0) {
            for (let course of courses) {
                let courseOption = document.createElement("option");
                courseOption.value = course.course.id;
                courseOption.innerText = course.course.name;
                courseSelection.appendChild(courseOption);
            }
            //initial call using the initial selection
            populateGradeTable();
            populateWeightTable();
            populateGradeSchemeTable();

            // Event listener for dropdown change
            courseSelection.addEventListener("change", function () {
                populateGradeTable();
                populateWeightTable();
                populateGradeSchemeTable();
            });
        }

        function updateStatusDisplay(totalWeight) {
            let status = document.getElementById("statusDisplay");
            status.innerText = "Total: " + totalWeight + "%";
            if (parseFloat(totalWeight) == 100) {
                status.style.color = "green";
            } else if (parseFloat(totalWeight) > 100) {
                status.style.color = "red";
            } else if (parseFloat(totalWeight) < 100) {
                status.style.color = "orange";
            }
        }

        function populateWeightTable() {
            let selected = getSelection();
            console.log("Populating weight Table");
            let courseWeights;
            let courseSelected;
            // if there are enrolled courses
            if (courses && courses.length > 0) {
                // loop through each course
                for (let course of courses) {
                    // find the course that matches the selected course
                    if (course.course.id == selected.value) {
                        courseWeights = course.course.courseWeights;
                        courseSelected = course;
                    }
                }
            }

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

            updateStatusDisplay(calculateTotalWeight(attendanceWeight.parentNode.parentNode));

            attendanceWeight.addEventListener("click", function(e) {
                editGradeWeight(e, courseSelected, "attendance");
                populateGradeTable();
                populateWeightTable();
            });
            assignmentWeight.addEventListener("click", function(e) {
                editGradeWeight(e, courseSelected,  "assignment");
                populateGradeTable();
                populateWeightTable();
            });
            labWeight.addEventListener("click", function(e) {
                editGradeWeight(e, courseSelected, "lab");
                populateGradeTable();
                populateWeightTable();
            });
            projectWeight.addEventListener("click", function(e) {
                editGradeWeight(e, courseSelected, "project");
                populateGradeTable();
                populateWeightTable();
            });
            midtermWeight.addEventListener("click", function(e) {
                editGradeWeight(e, courseSelected, "midterm");
                populateGradeTable();
                populateWeightTable();
            });
            finalWeight.addEventListener("click", function(e) {
                editGradeWeight(e, courseSelected, "final");
                populateGradeTable();
                populateWeightTable();
            });

            function editGradeWeight(e, course, category) {
                let courseWeights = course.course.courseWeights;
                let toEdit = e.target;
                let originalWeight = toEdit.innerText;
                let newInput = document.createElement("input");
                let positiveFloatPattern = /^[0-9]*\.?[0-9]+$/;
                            
                newInput.type = "text";
                newInput.style.width = "3rem";
                newInput.style.height = "1rem";

                toEdit.parentNode.replaceChild(newInput, toEdit);
                newInput.focus();
                            
                newInput.addEventListener("keyup", function (e) {
                    if (e.key == "Enter") {
                        let newWeight = e.target.value;
                        if (positiveFloatPattern.test(newWeight)) {
                    
                            let newWeightOutput = document.createElement("span");
                            newWeightOutput.innerText = newWeight;
                    
                            courseWeights[category] = parseFloat(newWeight);
                    
                            newWeightOutput.addEventListener("click", function(e) {
                                editGradeWeight(e, course, category);
                            });
                            newWeightOutput.id = category + "Weight";
                            e.target.parentNode.replaceChild(newWeightOutput, e.target);
                            newWeightOutput.id = category + "Weight";

                            let totalWeight = calculateTotalWeight(newWeightOutput.parentNode.parentNode);
                            updateStatusDisplay(totalWeight);
                                            
                            if (totalWeight == 100) {
                                postCourseWeightsToDB(course.course.id, courseWeights);

                            } else if (totalWeight > 100) {
                                alert("Invalid Weight Scheme ! Total Weight Exceeds 100%");
                            }
                        } else {
                            alert("Invalid Weight");
                        }
                    }
                });
            }       
        }   

        function populateGradeSchemeTable() {
            let selected = getSelection();
            let course;
            let courseGradeScheme;
            // if there are enrolled courses
            if (courses && courses.length > 0) {
                // loop through each course
                for (let course of courses) {
                    // find the course that matches the selected course
                    if (course.course.id == selected.value) {
                        courseSelected = course.course;
                        courseGradeScheme = course.course.gradeScheme;
                    }
                }
            }
            let a = document.getElementById("A");
            let bPlus = document.getElementById("B+");
            let b = document.getElementById("B");
            let cPlus = document.getElementById("C+");
            let c = document.getElementById("C");
            let dPlus = document.getElementById("D+");
            let d = document.getElementById("D");
            let f = document.getElementById("F");

            a.innerText = courseGradeScheme["A"];
            bPlus.innerText = courseGradeScheme["B+"];
            b.innerText = courseGradeScheme["B"];
            cPlus.innerText = courseGradeScheme["C+"];
            c.innerText = courseGradeScheme["C"];
            dPlus.innerText = courseGradeScheme["D+"];
            d.innerText = courseGradeScheme["D"];
            f.innerText = courseGradeScheme["F"];

            a.addEventListener("click", function(e) {
                editGradeScheme(e, courseSelected, "A");
            });
            bPlus.addEventListener("click", function(e) {
                editGradeScheme(e, courseSelected, "B+");
            });
            b.addEventListener("click", function(e) {
                editGradeScheme(e, courseSelected, "B");
            });
            cPlus.addEventListener("click", function(e) {
                editGradeScheme(e, courseSelected, "C+");
            });
            c.addEventListener("click", function(e) {
                editGradeScheme(e, courseSelected, "C");
            });
            dPlus.addEventListener("click", function(e) {
                editGradeScheme(e, courseSelected, "D+");
            });
            d.addEventListener("click", function(e) {
                editGradeScheme(e, course, "D");
            });
            f.addEventListener("click", function(e) {
                editGradeScheme(e, courseSelected, "F");
            });

            function editGradeScheme(e, course, category) {
                let courseId = course.id;
                let courseGradeScheme = course.gradeScheme;
                // get input to edit
                let toEdit = e.target;

                let gradeValueInput = document.createElement("input");
                gradeValueInput.style.height = "1rem";
                gradeValueInput.style.width = "2rem";
                gradeValueInput.type = "text"

                toEdit.parentNode.replaceChild(gradeValueInput, toEdit);

                gradeValueInput.focus();

                gradeValueInput.addEventListener("keyup", function(e) {
                    if (e.key === "Enter") {
                        let pattern = /^[0-9]+(\.[0-9]+)?$/;
                        let gradeValue = parseFloat(gradeValueInput.value);
                        if (pattern.test(gradeValue) && gradeValue <= 100 && gradeValue >= 0) {
                            let gradeSchemeOutput = document.createElement("span");
                            let below = -1;
                            let above = 100;
                            // [above, below)
                            switch(category) {
                                case "A":
                                    above = 100;
                                    below = courseGradeScheme["B+"];
                                    break;
                                case "B+":
                                    above = courseGradeScheme["A"];
                                    below = courseGradeScheme["B"];
                                    break;
                                case "B":
                                    above = courseGradeScheme["B+"];
                                    below = courseGradeScheme["C+"];
                                    break;
                                case "C+":
                                    above = courseGradeScheme["B"];
                                    below = courseGradeScheme["C"];
                                    break;
                                case "C":
                                    above = courseGradeScheme["C+"];
                                    below = courseGradeScheme["D+"];
                                    break;
                                case "D+":
                                    above = courseGradeScheme["C"];
                                    below = courseGradeScheme["D"];
                                    break;
                                case "D":
                                    above = courseGradeScheme["D+"];
                                    below = courseGradeScheme["F"];
                                    break;
                                case "F":
                                    above = courseGradeScheme["D"];
                                    below = -1;
                                    break;
                                default:
                                    below = -1;
                                    above = 100;
                                    break;
                            }
                            if (gradeValue <= above && gradeValue > below) {

                                gradeSchemeOutput.innerText = gradeValue;

                                gradeSchemeOutput.addEventListener("click", function(e) {
                                    editGradeScheme(e, course, category);
                                });

                                e.target.parentNode.replaceChild(gradeSchemeOutput, e.target);
                                courseGradeScheme[category] = gradeValue;
                                postGradeSchemeToDB(courseId, courseGradeScheme);
                            } else {

                                gradeSchemeOutput.innerText = courseGradeScheme[category];

                                gradeSchemeOutput.addEventListener("click", function(e) {
                                    editGradeScheme(e, course, category);
                                });

                                e.target.parentNode.replaceChild(gradeSchemeOutput, e.target);
                                alert("Invalid Grade Value");
                            }
                        } else {
                            alert("Invalid input! Please enter a valid grade scheme.")
                        }
                    }
                });
            }
        }

        function populateGradeTable() {
            let selected = getSelection();
            // see which course is selected
            let gradeTableBody = document.getElementById("gradeTableBody");
            // empty the grade table
            gradeTableBody.innerHTML = "";
            // if there are enrolled courses
            if (courses && courses.length > 0) {
                // loop through each course
                for (let course of courses) {
                    // find the course that matches the selected course
                    if(course.course.id == selected.value) {
                        // get the course weights and grade scheme
                        let courseWeights = course.course.courseWeights;
                        let courseGradeScheme = course.course.gradeScheme;

                        // fetch all students
                        fetch (`/students/`)
                            .then(response => response.json())
                            .then(fetchedStudents => {
                                console.log(fetchedStudents);
                                populateStudentsInfo(fetchedStudents);
                            })

                        newStudentRow = gradeTableBody.insertRow(-1);

                        // populate students info in the grade-table from the fetched students
                        function populateStudentsInfo(fetched) {
                            let students = [];
                            for (let fetchedStudent of fetched) {
                                let enrolls = fetchedStudent["enrolls"].data;
                                for (let enroll of enrolls) {
                                    if (enroll.course.id == selected.value) {
                                        students.push(fetchedStudent);
                                    }
                                }
                            }
                            // if there are students enrolled in this course
                            if (students && students.length > 0) {
                                // get each student's scores
                                for (let student of students) {
                                    // create a new row for each student
                                    let newStudentRow = gradeTableBody.insertRow(-1);

                                    let scores;
                                    let courseId;

                                    // make a new cell for the student id
                                    let studentIdCell = newStudentRow.insertCell(0);
                                    studentIdCell.classList.add("grade-table-body-cell");
                                    studentIdCell.innerText = "650" + student.id;

                                    let enrolls = student.enrolls.data;
                                    
                                    // find the course in the student's enrolls
                                    for (let enroll of enrolls) {
                                        if (enroll.course.id == selected.value) {
                                            
                                            grade = enroll.grade;
                                            scores = enroll.scores;
                                            courseId = enroll.course.id;
                                            
                                            // populate the cells with the student's scores
                                            populateScoreCell(student, enroll, scores, "attendance", newStudentRow, 1);
                                            populateScoreCell(student, enroll, scores, "assignment", newStudentRow, 2);
                                            populateScoreCell(student, enroll, scores, "lab", newStudentRow, 3);
                                            populateScoreCell(student, enroll, scores, "project", newStudentRow, 4);
                                            populateScoreCell(student, enroll, scores, "midterm", newStudentRow, 5);
                                            populateScoreCell(student, enroll, scores, "final", newStudentRow, 6);
                                        }
                                    }

                                    //get the scoresum by adding all the scores
                                    let scoreSum = 0;
                                    scoreSum = calculateTotalScore(newStudentRow);
    
                                    // make the total score cell
                                    let totalCell = newStudentRow.insertCell(7);
                                    totalCell.classList.add("grade-table-body-cell");
                                    totalCell.classList.add("small-bold");
                                    let gradeSpan = document.createElement("span");
                                    gradeSpan.innerText = scoreSum;
                                    totalCell.appendChild(gradeSpan);
                                    gradeSpan = document.createElement("span");
                                    gradeSpan.classList.add("small-bold");
                                    gradeSpan.innerText = " / 100";
                                    totalCell.appendChild(gradeSpan);
                                    
                                    // the grade cell
                                    let gradeCell = newStudentRow.insertCell(8);
                                    gradeCell.classList.add("grade-table-body-cell");
                                    gradeCell.classList.add("small-bold");
                                    gradeSpan = document.createElement("span");
                                    let calGrade = calculateGrade(scoreSum, courseGradeScheme);
                                    if (calGrade != grade) {
                                        postNewScoresToDB(student.id, courseId, scores, calGrade);
                                    } else {
                                        gradeSpan.innerText = grade;
                                        gradeCell.appendChild(gradeSpan);
                                    }
                                }
                            }
                            // function for populating score cells
                            function populateScoreCell(student, enroll, scores, category, parent, index) {
                                //get the weight and score for the category
                                let weight = courseWeights[category];
                                if (scores[category] > weight) {
                                    scores[category] = 0;
                                }
                                let score = scores[category];

                                //make a new cell
                                let newCell = parent.insertCell(index);
                                newCell.classList.add("grade-table-body-cell");
                                newCell.classList.add("grade-cell-score");

                                //make a span for the score that can be edited
                                let scoreSpan = document.createElement("span");
                                scoreSpan.classList.add("small");
                                
                                scoreSpan.innerText = score;

                                scoreSpan.addEventListener("click", function(e) {
                                    editScore(e, student, enroll, category);
                                });
                                                            
                                // make a span for displaying the weight
                                let weightSpan = document.createElement("span");
                                weightSpan.classList.add("small-bold");
                                weightSpan.innerText = " / " + weight;
                                                            
                                newCell.appendChild(scoreSpan);
                                newCell.appendChild(weightSpan);
                            }
                        }
                    }
                }
            }
        }
            // function for editing student score in grade table
            function editScore(e, student, enroll, category) {
                let courseId = enroll.course.id;
                let courseWeights;
                let gradeScheme;
                let newScores;
                let studentId = student.id;

                //find the course in student's enrolls
                let studentEnrolls = student.enrolls.data;
                if (studentEnrolls && studentEnrolls.length > 0) {
                    for (studentEnroll of studentEnrolls){
                        if (studentEnroll.course.id == courseId) {
                            //find the current scores
                            newScores = studentEnroll.scores;
                            courseWeights = studentEnroll.course.courseWeights;
                            gradeScheme = studentEnroll.course.gradeScheme;
                        }
                    }
                }
                
                let toEdit = e.target;
                let weight = courseWeights[category];
                                        
                // create an input for the score and focus it
                let scoreInput = document.createElement("input");
                scoreInput.style.height = "1rem";
                scoreInput.style.width = "2rem";
                scoreInput.type = "text";
                                        
                // replace the score with the input
                toEdit.parentNode.replaceChild(scoreInput, toEdit);
                scoreInput.focus();
                                        
                // if key up on the input and it is enter
                scoreInput.addEventListener("keyup", function (e) {
                if (e.key === "Enter") {
                    // pattern for positive floats
                    let pattern = /^[0-9]+(\.[0-9]+)?$/;
        
                    // pattern for a/b
                    let patternExpression = /^[0-9]*\.?[0-9]+\/[0-9]*\.?[0-9]+$/;
                                        
                    // check if the input is a positive float
                    if (pattern.test(scoreInput.value)) {
                        // get the float of the result
                        let result = parseFloat(scoreInput.value);
                        if (result <= weight) {
                            let score = result.toFixed(2);
                            newScores[category] = score; 
                                        
                            // Update the corresponding score cell directly
                            let parentCell = scoreInput.parentNode;
                            let newScoreSpan = document.createElement("span");
                            newScoreSpan.classList.add("small");
                            newScoreSpan.innerText = score;
                            newScoreSpan.addEventListener("click", function (e) {
                                editScore(e, student, enroll, category);
                            });

                            parentCell.replaceChild(newScoreSpan, e.target);
                                        
                            // Recalculate and update the total score
                            let totalCell = parentCell.parentNode.cells[7];
                            let totalScore = calculateTotalScore(parentCell.parentNode);
                            totalCell.innerHTML = `<span>${totalScore}</span> / 100`;
        
                            // Update the grade cell
                            let gradeCell = parentCell.parentNode.cells[8];
                            let grade = calculateGrade(totalScore, gradeScheme);
                            gradeCell.innerHTML = `<span>${grade}</span>`;

                            postNewScoresToDB(studentId, courseId, newScores, grade);
                        } else { // if result is more than the max
                            alert("Invalid! Score cannot exceed weight ");
                        }
                    } else if (patternExpression.test(scoreInput.value)) {
                        let result = parseFloat(eval(scoreInput.value) * weight);
                        if (result <= weight) {
                            let score = result.toFixed(2);
                            newScores[category] = score; 
                                
                            // Update the corresponding score cell directly
                            let parentCell = scoreInput.parentNode;
                            let newScoreSpan = document.createElement("span");
                            newScoreSpan.classList.add("small");
                            newScoreSpan.innerText = score;
                            newScoreSpan.addEventListener("click", function (e) {
                                editScore(e, student, enroll, category);
                            });
                            parentCell.appendChild(newScoreSpan);
        
                            // Add event listener to the new score span
                            newScoreSpan.addEventListener("click", function (e) {
                                editScore(e, student, enroll, category);
                            });
                                        
                            // Recalculate and update the total score
                            let totalCell = parentCell.parentNode.cells[7];
                            let totalScore = calculateTotalScore(parentCell.parentNode);
                            totalCell.innerHTML = `<span>${totalScore}</span> / 100`;
        
                            // Update the grade cell
                            let gradeCell = parentCell.parentNode.cells[8];
                            let grade = calculateGrade(totalScore, gradeScheme);
                            gradeCell.innerHTML = `<span>${grade}</span>`;

                            postNewScoresToDB(studentId, courseId, newScores, grade);
                        }
                    } else {
                        alert("Invalid input! Please enter a valid float value.");
                    }
                }
            });
        }

        function calculateTotalScore(parent) {
            let total = 0;
            for (let i = 1; i < 7; i++) {
                let cur = parent.cells[i];
                let score = cur.querySelectorAll("span")[0].innerText;
                total += parseFloat(score);
            }
            return total;
        }

        function calculateTotalWeight(parent) {
            let total = 0;
            for (let i = 0; i < 6; i++) {
                let cur = parent.cells[i];
                let score = cur.querySelectorAll("span")[0].innerText;
                total += parseFloat(score);
            }
            return total;
        }

        function calculateGrade(score, scheme) {
            if (score > scheme["A"]){
                return "A";
            } else if (score <= scheme["A"] && score > scheme["B+"]) {
                return "B+";
            } else if (score <= scheme["B+"] && score > scheme["B"]) {
                return "B";
            } else if (score <= scheme["B"] && score > scheme["C+"]) {
                return "C+";
            } else if (score <= scheme["C+"] && score > scheme["C"]) {
                return "C";
            } else if (score <= scheme["C"] && score > scheme["D+"]) {
                return "D+";
            } else if (score <= scheme["D+"] && score > scheme["D"]) {
                return "D";
            } else if (score <= scheme["D"] && score > scheme["F"]) {
                return "F";
            } else {
                return "F";
            }

        }

        function postCourseWeightsToDB(courseId, weights) {
            fetch(`/set-course-weights/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "course_id": courseId,
                    "weights": weights,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    populateGradeTable();
                    populateWeightTable();
                })
                .catch(error => {
                    console.error('Error editing course weights:', error);
                });
        }

        function postNewScoresToDB(studentId, courseId, newScores, newGrade) {
            fetch(`/set-student-scores/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "student_id": studentId,
                    "course_id": courseId,
                    "new_scores": newScores,
                    "new_grade": newGrade,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    populateGradeTable();
                    populateGradeSchemeTable();
                })
                .catch(error => {
                    console.error('Error editing student scores:', error);
                });
        }

        function postGradeSchemeToDB(courseId, gradeScheme) {
            fetch(`/set-course-grade-scheme/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "course_id": courseId,
                    "scheme": gradeScheme,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Course grade scheme edited:', data);
                    populateGradeTable();
                    populateGradeSchemeTable();
                })
                .catch(error => {
                    console.error('Error editing grade scheme:', error);
                });
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

    function isDay(someDay) {
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var date = new Date();
        var dayIndex = date.getDay();
        return days[dayIndex] === someDay;
    }

    function getCurrentTimeAMPM() {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
    
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
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
    

});
