const project_files = document.querySelector(".file_view");
const data =  JSON.parse(project_files.innerHTML);

/* Erase the data from file view */
project_files.innerHTML = "";

data.forEach(entry => {
    console.log(entry.name);
    
    let file = document.createElement("div");
    file.className = "file";
    file.id = "test";
    
    let img = document.createElement("img");

    if(entry.type == 'file')
        img.src = "/images/project-contents/tabler-icon-file.svg"
    else
        img.src = "/images/project-contents/tabler-icon-folder.svg"

    let a = document.createElement("a");
    a.href = "";
    a.text = entry.name;

    file.appendChild(img);
    file.appendChild(a);

    project_files.appendChild(file)
});
