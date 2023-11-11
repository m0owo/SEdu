const descriptionEdit = document.getElementById("editButton");
const descriptionTextArea = document.getElementById("descriptionTextArea");
const descriptionText = document.getElementById("description");

descriptionEdit.addEventListener("click", showDescriptionTextArea);

let editing = false;
descriptionText.innerText = "Enter a brief description."

// add text editing features, like tab
function showDescriptionTextArea() {
    descriptionTextArea.style.transition = "0.1s ease-in";
    if (editing == false) {
        descriptionTextArea.value = descriptionText.innerText;
        descriptionText.innerText = "";
        descriptionTextArea.style.width = "100%";
        descriptionTextArea.style.height = "200px";
        descriptionEdit.innerText = "Done"
        editing = true;
    } else if (editing = true){
        // descriptionTextArea.style.transition = "none";
        descriptionText.innerText = descriptionTextArea.value;
        descriptionTextArea.value = "";
        descriptionTextArea.style.width = "0px";
        descriptionTextArea.style.height = "0px";
        descriptionEdit.innerText = "Edit";
        editing = false;
    }

}
