document.addEventListener("DOMContentLoaded", function () {
    const userElement = document.getElementById("user-data");
    var user = userElement.getAttribute("data");

    var userData;
    fetch(`/students/${user}`)
        .then(response => response.json())
        .then(user => {
            userData = user;
            updateAssignment(user);
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });

    const dateElement = document.getElementById("date");
    const timeElement = document.getElementById("time");
    const timetableElement = document.getElementById("timetable");
    const assignmentsElement = document.getElementById("assignments");

    function updateAssignment(userData) {
        // assignmentsElement.innerHTML = "";

        if (!userData || !userData.id) {
            return;
        }
        //console.log(userData);
        let enrolls = userData.enrolls;
        //console.log(enrolls);
        let enrollments = enrolls["data"];
        for (enrollment of enrollments) {
            let course_name = enrollment["course"]["name"];

            let assignments = enrollment["course"]["assignments"]["data"];

            if (Array.isArray(assignments)) {
                for (let assignment of assignments) {
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
                    spantime.textContent = "haha";

                    div1.appendChild(span1);
                    div1.appendChild(span2);

                    divhighlight.appendChild(spantime);
                    div2.appendChild(divhighlight);
                    
                    divbar.appendChild(div1);
                    divbar.appendChild(div2);

                    assignmentsElement.appendChild(divbar);


                    //console.log(assignment);
                    console.log(assignment["title"]);
                    console.log(assignment["assign_date"]);
                    console.log(assignment["assign_time"]);
                }
            }

        }



        let divbar = document.createElement("div");
        divbar.className = "assignment-bar";
        let div1 = document.createElement("div");
        let div2 = document.createElement("div");
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
