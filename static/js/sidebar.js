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
        let circle;
        let container;
    
        for (let enrollment of enrollments) {
            container = document.createElement("div");
            container.style.display = "flex";
            container.style.flexDirection = "row";

            circle = document.createElement("div");
            circle.style.width = "8px";
            circle.style.height = "8px";
            circle.style.borderRadius = "50%";
            circle.style.backgroundColor = "orange";
            circle.style.marginRight = "1rem";
            circle.style.marginTop = "0.5rem";

            container.appendChild(circle);

            let course_id = enrollment["course"]["id"];
            let course_name = enrollment["course"]["name"];
    
            let list = document.createElement("li");
            list.className = "small";
    
            let a = document.createElement("a");
            a.classList.add("nav-items");
            a.href = `/${id}/course/${course_id}`;
            a.textContent = `${course_name}`;
    
            container.appendChild(a);
            list.appendChild(container);  
            sidebarElement.appendChild(list);
        }
        let logout = document.createElement("a");
        logout.classList.add("nav-items");
        logout.classList.add("small-bold");
        logout.classList.add("btn_logout");
        logout.style.marginTop = "auto";
        logout.style.marginLeft = "0.5rem";
        logout.innerText = "Log Out";
        logout.href = "/logout";

        sidebarElement.appendChild(logout);
    }

    updateSidebar();
});
