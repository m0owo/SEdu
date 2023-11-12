document.addEventListener("DOMContentLoaded", function () {
    const dateElement = document.getElementById("date");
    const timeElement = document.getElementById("time");
    const timetableElement = document.getElementById("timetable");
    let classes = {"Professional Communication": "9:00 AM - 12:00 PM",
    "Web Programming (Lecture)": "1:00 PM - 4.15 PM",
    "Web Programming (Lab)": "4.30 PM - 6:00 PM"
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
        if (currentDay == 0 || currentDay == 6){
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
        else if (currentDay == 1){

        }
    }
    updateDateTime();
    setInterval(updateDateTime, 60000);
});