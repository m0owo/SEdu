// assignment ---Description--- code
const descriptionEdit = document.getElementById("editButton");
const descriptionTextArea = document.getElementById("descriptionTextArea");
const descriptionText = document.getElementById("description");

descriptionEdit.addEventListener("click", showDescriptionTextArea);

let editing = false;
descriptionTextArea.value = "";
descriptionText.innerText = "Enter a brief description"

// add text editing features, like tab
function showDescriptionTextArea() {
    descriptionTextArea.style.transition = "0.1s ease-in";
    if (editing == false) {
        descriptionTextArea.style.visibility = "visible";
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
        descriptionTextArea.style.visibility = "hidden";
        descriptionEdit.innerText = "Edit";
        editing = false;
    }

}

// assignment ---Additional Resources--- code
let files = [];
const fileInput = document.getElementById("fileInput");
const fileInputButton = document.getElementById("fileInputButton");
const resourceFrames = document.getElementById("resourceFrames");
fileInputButton.addEventListener('click', function () {
    fileInput.click();
})
fileInput.addEventListener('change', function() {
    const selectedFile = fileInput.files[0];
    if (selectedFile) {
        files.push(selectedFile);
        updateFileFrame();
    }
})

function updateFileFrame() {
    files.forEach(function(file) {
        let iframe = document.createElement("iframe");
        resourceFrames.appendChild(iframe);
        const fileURL = URL.createObjectURL(file);
        iframe.classList.add("fileFrame");
        iframe.style.pointerEvents = "auto";
        iframe.setAttribute("src", fileURL);
        iframe.addEventListener('click', function() {
            console.log("clicked");
            let downloadLink = document.createElement("a");
            downloadLink.href = fileURL;
            downloadLink.download = file.name;
            downloadLink.click();
        });
    });
}

