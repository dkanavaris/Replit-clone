const file_add_button = document.querySelector("#file_plus");
const folder_add_button = document.querySelector("#folder_plus");
const create_button = document.querySelector("#create");
const input_text = document.querySelector("#input_text");
const input_container = document.querySelector(".input-container");
//Type holds the information if there is a file or
// a directory created
let type = "";
//TODO: add check if filename and foldername exist?


file_add_button.addEventListener("click", add_file);
folder_add_button.addEventListener("click", add_folder);
create_button.addEventListener("click", make_request);

function make_request(){
    console.log("Axios clicked");
    let text = input_text.value;
    if(type == "file"){
        axios({
            method: 'post',
            url: window.location.href + "/file_create/" + text,
        });
    }
    else{
        axios({
            method: 'post',
            url: window.location.href + "/folder_create/" + text,
        });
    }
    input_container.style.display = "none";
}

function add_file(){
    input_container.style.display = "block"
    type = "file";
}

function add_folder(){
    input_container.style.display = "block"
    type = "folder";
}