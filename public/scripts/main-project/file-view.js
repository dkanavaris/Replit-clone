const project_files = document.querySelector(".file_view");
const data =  JSON.parse(project_files.innerHTML);

/* Erase the data from file view */
project_files.innerHTML = "";

//FIXME: remove this
console.log(data);

window.onload = (event) => {
    update_file_view(project_files, data, "block");
};

function update_file_view(parent, data, display){
    data.forEach(entry => {
    
        let item = document.createElement("div");
        
        if(entry.type == 'file')
            item.className = "file";
        else
            item.className = "folder";

    
        let img = document.createElement("img");
    
        if(entry.type == 'file')
            img.src = "/images/project-contents/tabler-icon-file.svg"
        else
            img.src = "/images/project-contents/tabler-icon-folder.svg"
        
        
        let name_span = document.createElement("span");
        name_span.textContent = entry.name;
    
        item.appendChild(img);
        item.appendChild(name_span);
        
        item.style.display = display;
        
        /* TODO: if an entry has children create a new sub-div and
         * call update_file_view(new_div, entry.children, "hidden") to 
         * to add the children files and directories under the parent directory.
         * On return add an event listener which toggles the visiblity on and off.
         * */
        if(entry.children){
            /* Create a sub-div*/
            let sub_div = document.createElement("div");
            sub_div.className = "sub_div";
            sub_div.id = "sub_test"
            item.appendChild(sub_div);
            

            //Call update_file_view on the sub div and children data
            update_file_view(sub_div, entry.children, "none");

            //Add an event listener for the folder
            img.addEventListener("click", toggle_children);
            name_span.addEventListener("click", toggle_children);
        }

        else{
            //Add an event listener for the file
            //img.addEventListener("click", display_children);
            //name_span.addEventListener("click", display_children);
        }

        parent.appendChild(item);
    });
}

/* Event listener function use to toggle on and off the display of a directory contents */
function toggle_children(e){
    e.preventDefault();
    e.stopPropagation();

    /* The 3 child of a folder is the sub directory hence the index 2 */
    let sub_div = e.target.parentNode.children[2].children;
    console.log(sub_div);

    for(let j = 0; j < sub_div.length; j++){
        if(sub_div[j].style.display == "none")
                sub_div[j].style.display = "block";
            else
            sub_div[j].style.display = "none";
    }
}

/**TODO: Create an event listener on files that make a post request to fetch the file contents. */
