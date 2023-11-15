document.addEventListener("DOMContentLoaded", function () {

    var userData;
    const userElement = document.getElementById("user-data");
    var user = userElement.getAttribute("data");
    const token = localStorage.getItem('userToken');


    
    if (token) {
        fetch('/home/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })  
        .then(response => {
            response.text().then(text => {
                //set page html  
                console.log(text);
                document.write(text);
                
                
                fetch('/getUser/', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                }).then(response => {
                    response.json().then(data =>{
                        console.log(data)
                        userData = data
                        test(userData)
                        updateAssignment(userData)
                    });
                });
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        console.error('Token not found in local storage');
    }

    
    
    
    
    function test(data){
        const time = document.getElementById("date");
        userData = data["data"]
        console.log("This: ", userData.id)
        document.getElementById("date").textContent = userData.id
    }
    function updateAssignment(userData) {
        const assignmentsElement = document.getElementById("assignments");
        console.log("Update assignment function", userData.id)
        assignmentsElement.innerHTML = "";

        if (!userData || !userData.id) {
            return;
        }

        let enrolls = userData.enrolls;
        let enrollments = enrolls["data"];

        for (let enrollment of enrollments) {
            let course_name = enrollment["course"]["name"];
            let assignments = enrollment["course"]["assignments"]["data"];

            if (Array.isArray(assignments)) {
                for (let assignment of assignments) {
                    console.log(assignment["title"]);
                    console.log(assignment["due_date"]);
                    console.log(assignment["due_time"]);
                    
                    let divbar = document.createElement("div");
                    divbar.className = "assignment-bar";
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

                    divbar.appendChild(div1);
                    divbar.appendChild(div2);

                    assignmentsElement.appendChild(divbar);
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

    // Function to get the day of the week
    function getDayOfWeek(someDate) {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return daysOfWeek[someDate.getDay()];
    }

    function updateDateTime() {
        const dateElement = document.getElementById("date");
        const timeElement = document.getElementById("time");
        const timetableElement = document.getElementById("timetable");
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
