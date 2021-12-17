/* =========================================================================== 
 * Code used for file view actions .
 *=========================================================================== */
const project_files = document.querySelector(".file_view");
CodeMirror.modeURL = "/codemirror/codemirror-5.64.0/mode/%N/%N.js"

let myCodeMirror = null;
let last_visited = project_files; // Holds the element that was last clicked.
const HOVER_COLOR = "grey" // The hover color 

/* Erase the data from file view */
project_files.innerHTML = "";

/* Event listener to choose the main project file */
project_files.addEventListener("click", function(e){
    if(last_visited && last_visited != project_files)
        last_visited.style.backgroundColor = "transparent";
    last_visited = project_files;
});

async function get_project_data(){
    let data = await axios({
        method: 'get',
        url: window.location.href + "/get_project_files",
    });

    /* Return a promise with the data */
    return data;
}

async function get_file_data(filepath){

    let data = await axios({
        method: 'get',
        url: window.location.href + "/get_file/" + filepath,
    });

    return data;
}

window.onload = (event) => {
    get_project_data().then(response => 
        {update_file_view(project_files, "", response.data.children, "block", 0);})
};

function update_file_view(parent_div, parent_dir,  data, display, margin_left){
    
    data.forEach(entry => {
    
        let item = document.createElement("div");
        let contents = document.createElement("div");
        contents.className = "contents";

        if(entry.type == 'file')
            item.className = "file";
        else
            item.className = "folder";

        item.id = parent_dir  +  entry.name;

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
            contents.appendChild(chevron);
            contents.appendChild(img);
            contents.appendChild(name_span);

            item.appendChild(contents);
            
            /* Create a sub-div*/

            let sub_div = document.createElement("div");
            sub_div.className = "sub_div";
            sub_div.id = item.id;
            item.appendChild(sub_div);
            

            //Call update_file_view on the sub div and children data
            // Change margin left to 30 to add some spacing between parents and children
            update_file_view(sub_div, item.id + "\\", entry.children, "none", 30);

            //Add an event listener for the folder
            contents.addEventListener("click", toggle_children);
        }

        else{
            contents.appendChild(img);
            contents.appendChild(name_span);
            item.appendChild(contents);

            //Add an event listener for the file
            contents.addEventListener("click", display_data);
        }
        
        contents.addEventListener("mouseenter", on_hover);
        contents.addEventListener("mouseleave", on_hover_exit);
        item.style.display = display;
        item.style.marginLeft = `${margin_left}px`;
        parent_div.appendChild(item);
    });
}

function on_hover(e){
    e.stopPropagation();

    e.target.style.backgroundColor = HOVER_COLOR;
}

function on_hover_exit(e){
    e.stopPropagation();

    /* If you were not last clicked the change bg color*/
    if(last_visited != e.target)
        e.target.style.backgroundColor = "transparent";
}
/* Event listener function use to toggle on and off the display of a directory contents */
function toggle_children(e){

    e.stopPropagation();

    let contents;

    /* Get the div with the contents. If a child of the div was
     * clicked then contents is the parent of element clicked
     * otherwise it's the element clicked */
    if(e.target.className == "contents")
        contents = e.target;
    else
        contents = e.target.parentNode;

    /* Deactivate the previous clicked element and
     * Show the element was clicked and store it to
     * deactivate it on next click */
    if(last_visited && last_visited != project_files)
        last_visited.style.backgroundColor = "transparent";
    last_visited = contents;
    contents.style.backgroundColor = HOVER_COLOR;
    
    /* The 4 child of a folder is the sub directory hence the index 3 */
    let sub_div = contents.parentNode.children[1].children;

    /* Rotate the chevron to indicate that a directory was clicked */
    let chevron = contents.children[0];
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
    console.log(last_visited);

}

/* Fetch the data of the file and display them on the editor */
function display_data(e){


    e.stopPropagation();
    let contents;

    /* Get the div with the contents. If a child of the div was
     * clicked then contents is the parent of element clicked
     * otherwise it's the element clicked */
    if(e.target.className == "contents")
        contents = e.target.parentNode;
    else
        contents = e.target.parentNode.parentNode;

    /* Deactivate the previous clicked element and
     * Show the element was clicked and store it to
     * deactivate it on next click */
    if(last_visited && last_visited != project_files)
        last_visited.style.backgroundColor = "transparent";
    last_visited = contents;
    contents.style.backgroundColor = HOVER_COLOR;

    let filepath = contents.id;
    document.querySelector(".open-files").textContent = filepath;

    const text_editor = document.querySelector("#editor");

    get_file_data(filepath).then(response => {

        if(myCodeMirror != null)
            myCodeMirror.toTextArea();

        text_editor.value =  response.data.file_data;
        
        myCodeMirror = CodeMirror.fromTextArea(text_editor,{
            lineNumbers: true,
            extraKeys: {
                "Ctrl-S": function(instance){ // On save make an request to the server
                    axios({
                        method: 'post',
                        url: window.location.href + "/save_file/" + last_visited.id,
                        data: {
                            data : myCodeMirror.getValue()
                        }
                    });
                }
            }
        });
        
        let m, mode, spec;

        if (m = /.+\.([^.]+)$/.exec(filepath)) {
            let info = CodeMirror.findModeByExtension(m[1]);
            if (info) {
                mode = info.mode;
                spec = info.mime;
            }
        } 

        if (mode) {
            myCodeMirror.setOption("mode", spec);
            CodeMirror.autoLoadMode(myCodeMirror, mode);
        }
        
        myCodeMirror.setSize(1000 , 800);
    });

    console.log(last_visited);
}

/* =========================================================================== 
 * Code used for file or folder creation.
 *=========================================================================== */
const file_add_button = document.querySelector("#file_plus");
const folder_add_button = document.querySelector("#folder_plus");
const create_button = document.querySelector("#create");
const input_text = document.querySelector("#input_text");
const input_container = document.querySelector(".input-container");
const input_error_container = document.querySelector(".input-error-container");

/* Type holds the information if there is a file or
 * a directory created */
let type = "";

/* Variables that state in input fields are visible */
let file_input_visible = false;
let folder_input_visible = false;
let prev_visible;



file_add_button.addEventListener("click", add_file);
folder_add_button.addEventListener("click", add_folder);
create_button.addEventListener("click", create_request);
input_text.addEventListener("input", check_input);

function show_input_error(error_msg){
    input_error_container.textContent = error_msg;
    input_error_container.style.display = "flex";

    create_button.disabled = true;
}

function hide_input_error(type){
    input_error_container.style.display = "none";
    create_button.disabled = false;
}

function check_input(e){
    let text = input_text.value;
    let dir;

    if(last_visited.parentNode.id != ""){
        //If a a directory was the last visited element then 
        // get the children of the sub directory.
        if(last_visited.className == "contents")
            dir = last_visited.parentNode.children[1].children;
        else // Else a file of a sub_dir was clicked so get the siblings
            dir = last_visited.parentNode.children;
    }
    else{
        dir = project_files.children;
    }

    for(let i = 0; i < dir.length; i++){
        //Search for the file or folder name.
        let name;
        let index = dir[i].id.lastIndexOf("\\");
        name = dir[i].id.substring(index + 1, dir[i].id.length);
        

        if(name == text && type == dir[i].className){
            show_input_error(`${type}  : ${name} already exists`);
            return;
        }
        else{
            hide_input_error();
        }
    }
}

async function create_request(){

    let text = input_text.value;
    let filepath;

    if(last_visited.parentNode.id != ""){
        filepath = last_visited.parentNode.id + "\\" + text;
    }
    else{
        filepath = text;
    }

    if(type == "file"){ 
        await axios({
            method: 'post',
            url: window.location.href + "/file_create/" + filepath,
        });
    }
    else{
        await axios({
            method: 'post',
            url: window.location.href + "/folder_create/" + filepath,
        });
    }

    input_text.value = "";
    file_input_visible = folder_input_visible = false;
    input_container.style.display = "none";

    /* Since the request was completed update the file-view  */
    /* Erase the data from file view */
    project_files.innerHTML = "";
    get_project_data().then(response => 
        {update_file_view(project_files, "", response.data.children, "block", 1);});
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
    type = "file";

    if(file_input_visible){
        input_container.style.display = "flex";
        check_input(this);
    }
    else
        input_container.style.display = "none";


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
    type = "folder";

    if(folder_input_visible){
        input_container.style.display = "flex";
        check_input(this);
    }
    else
        input_container.style.display = "none";
    
}