document.addEventListener("DOMContentLoaded", function () {
    const userElement = document.getElementById("user-data");
    var user = userElement.getAttribute("data");

    var userData;
    fetch(`/students/${user}`)
        .then(response => response.json())
        .then(user => {
            userData = user;
            updateSidebar(user);
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });

    const sidebarElement = document.getElementById("sidebar");

    function updateSidebar(userData) {
        sidebarElement.innerHTML = "";
    
        if (!userData || !userData.id) {
            return;
        }
    
        let id = userData.id;
        let enrolls = userData.enrolls;
        let enrollments = enrolls["data"];
    
        for (let enrollment of enrollments) {
            let course_id = enrollment["course"]["id"];
            let course_name = enrollment["course"]["name"];
    
            let list = document.createElement("li");
            list.className = "small";
    
            let a = document.createElement("a");
            a.classList.add("nav-items");
            a.href = `/${id}/course/${course_id}`;
            a.textContent = `${course_name}`;
    
            list.appendChild(a);
            sidebarElement.appendChild(list);
        }
    }

    updateSidebar();
});
