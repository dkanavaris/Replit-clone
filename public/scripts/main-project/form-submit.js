const file_add_button = document.querySelector("#file_plus");
const folder_add_button = document.querySelector("#folder_plus");
const create_button = document.querySelector("#create");
const input_text = document.querySelector("#input_text");
const input_container = document.querySelector(".input-container");
/* Type holds the information if there is a file or
 * a directory created */
let type = "";
/* Variables that state in input fields are visible */
let file_input_visible = false;
let folder_input_visible = false;
let prev_visible;
//TODO: add check if filename and foldername exist?


file_add_button.addEventListener("click", add_file);
folder_add_button.addEventListener("click", add_folder);
create_button.addEventListener("click", make_request);

async function make_request(){

    let text = input_text.value;
    if(type == "file"){
        const data = await axios({
            method: 'post',
            url: window.location.href + "/file_create/" + text,
        });

        console.log(data);
    }
    else{
        axios({
            method: 'post',
            url: window.location.href + "/folder_create/" + text,
        });
    }

    input_text.value = "";
    input_container.style.display = "none";
}

function add_file(){

    /* If last time the folder icon was click then 
     * the file add should now be visible */
    if(prev_visible == "folder")
        file_input_visible = true;
    else // Else switch state
        file_input_visible = !file_input_visible;
    
    /* Update the prev_visible variable */
    prev_visible = "file";

    if(file_input_visible)
        input_container.style.display = "flex";
    else
        input_container.style.display = "none";


    type = "file";
}

function add_folder(){

    /* If last time the file icon was click then 
     * the file add should now be visible */
    if(prev_visible == "file")
        folder_input_visible = true;
    else // Else switch state
        folder_input_visible = !folder_input_visible;
    
    /* Update the prev_visible variable */
    prev_visible = "folder";    

    if(folder_input_visible)
        input_container.style.display = "flex";
    else
        input_container.style.display = "none";
    
    type = "folder";
}