const project_files = document.querySelector(".file_view");


/* Erase the data from file view */
project_files.innerHTML = "";


async function get_data(){
    let data = await axios({
        method: 'post',
        url: window.location.href + "/get_files",
    });

    /* Return a promise with the data */
    return data;
}

window.onload = (event) => {
    get_data().then(response => 
        {update_file_view(project_files, response.data.children, "block");})
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
        
        if(entry.children){

            let chevron = document.createElement("img");
            chevron.src = "/images/project-contents/tabler-icon-chevron-right.svg";
            item.appendChild(chevron);
            item.appendChild(img);
            item.appendChild(name_span);

            
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
            chevron.addEventListener("click", toggle_children);
        }

        else{
            item.appendChild(img);
            item.appendChild(name_span);
            //Add an event listener for the file
            //img.addEventListener("click", display_children);
            //name_span.addEventListener("click", display_children);
        }
        
        item.style.display = display;
        parent.appendChild(item);
    });
}

/* Event listener function use to toggle on and off the display of a directory contents */
function toggle_children(e){

    e.stopPropagation();

    /* The 4 child of a folder is the sub directory hence the index 3 */
    let sub_div = e.target.parentNode.children[3].children;

    /* Rotate the chevron to indicate that a directory was clicked */
    let chevron = e.target.parentNode.children[0];
    if(chevron.style.transform == "rotate(90deg)")
        chevron.style.transform = `rotate(0deg)`;
    else
        chevron.style.transform = `rotate(90deg)`;

    /* Toggle on or off the display of the children */
    for(let j = 0; j < sub_div.length; j++){
        if(sub_div[j].style.display == "none")
                sub_div[j].style.display = "block";
        else
            sub_div[j].style.display = "none";
    }
}

/**TODO: Create an event listener on files that make a post request to fetch the file contents. */
