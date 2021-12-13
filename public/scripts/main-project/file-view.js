/* =========================================================================== 
 * Code used for file view actions .
 *=========================================================================== */
const project_files = document.querySelector(".file_view");
CodeMirror.modeURL = "/codemirror/codemirror-5.64.0/mode/%N/%N.js"

let myCodeMirror = null;
let last_visited = null; // Holds the element that was last clicked.
const HOVER_COLOR = "grey" // The hover color 

/* Erase the data from file view */
project_files.innerHTML = "";

/* Event listener to choose the main project file */
const project_view = document.querySelector(".project-view");
project_view.addEventListener("click", function(e){
    if(last_visited && last_visited != project_view)
        last_visited.style.backgroundColor = "transparent";
    last_visited = document.querySelector(".project-view");
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
        {update_file_view(project_files, "", response.data.children, "block");})
};

function update_file_view(parent_div, parent_dir,  data, display){
    
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
            sub_div.id = "sub_test"
            item.appendChild(sub_div);
            

            //Call update_file_view on the sub div and children data
            update_file_view(sub_div, item.id + "\\", entry.children, "none");

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
        
        item.style.display = display;
        parent_div.appendChild(item);
    });
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
    if(last_visited && last_visited != project_view)
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
    if(last_visited && last_visited != project_view)
        last_visited.style.backgroundColor = "transparent";
    last_visited = contents;
    contents.style.backgroundColor = HOVER_COLOR;

    let filepath = contents.id;

    const text_editor = document.querySelector("#editor");

    get_file_data(filepath).then(response => {

        if(myCodeMirror != null)
            myCodeMirror.toTextArea();

        text_editor.value =  response.data.file_data;
        
        myCodeMirror = CodeMirror.fromTextArea(text_editor,{
            lineNumbers: true,
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

}

/* =========================================================================== 
 * Code used for file or folder creation.
 *=========================================================================== */
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
create_button.addEventListener("click", create_request);

async function create_request(){

    let text = input_text.value;
    if(type == "file"){
        const data = await axios({
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