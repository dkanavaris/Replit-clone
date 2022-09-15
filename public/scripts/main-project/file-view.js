/* =========================================================================== 
 * Code used for file view actions .
 *=========================================================================== */
let sharedb = require('sharedb/lib/client');
let current_file_open = ""
// Open WebSocket connection to ShareDB server
let ReconnectingWebSocket = require('reconnecting-websocket');
let otText = require('ot-text');

let xterm = require('xterm');
let fitaddon = require('xterm-addon-fit');
let attachAddon = require('xterm-addon-attach');
const { default: axios } = require('axios');

let doc; // Doc must be global. This doc is used by the editor
let file_view_doc;

sharedb.types.map['json0'].registerSubtype(otText.type);

const project_files = document.querySelector(".file_view");
CodeMirror.modeURL = "/codemirror/codemirror-5.64.0/mode/%N/%N.js"

let myCodeMirror = null;
let last_visited = project_files; // Holds the element that was last clicked.
const HOVER_COLOR = "grey" // The hover color 

/* Erase the data from file view */
project_files.innerHTML = "";

function send_size_to_server(term, sock){
    let cols = term.cols.toString();
    let rows = term.rows.toString();
    while (cols.length < 3) {
        cols = "0"+cols;
    }
    while (rows.length < 3) {
        rows = "0"+rows;
    }
    sock.send("ESCAPED|-- RESIZE:"+cols+";"+rows);
}

create_terminal();

async function create_terminal(){

    let data = await axios({
        method: 'get',
        url: window.location.href + "/get_terminal",
    });

    let term = new xterm.Terminal({cols:80, rows:24});
    let fit_addon = new fitaddon.FitAddon();

    term.loadAddon(fit_addon);

    term.open(document.getElementById('terminal'));

    fit_addon.fit();


    let sock = new WebSocket("ws://localhost:" + data.data);
    sock.addEventListener("open", (event) =>{
        let attach_addon = new attachAddon.AttachAddon(sock);
        term.loadAddon(attach_addon);
    });

    setTimeout(() =>{
        send_size_to_server(term, sock);
    }, 1000);
}

let url = window.location.href.split("/");
let user = url[url.length - 2];
let project = url[url.length - 1];




//TODO: maybe use keyboardevent.key
/*
term.onKey((key, ev) => {

    console.log(key)
    if(key.key == '\n')
        term.write("\n");
    term.write(key.key);
});*/

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

    // Close the old file
    if(current_file_open !== ""){
        await axios({
            method: 'post',
            url: window.location.href + "/close_file/" + current_file_open,
        });
    }

    //TODO: close old file
    let data = await axios({
        method: 'get',
        url: window.location.href + "/get_file/" + filepath,
    });

    return data;
}

window.onload = (event) => {

    let url = window.location.href.split("/");
    let user = url[url.length - 2];
    let project = url[url.length - 1];
    
    // Unsubscribe from the previous doc to stop listening for changes
    if(typeof file_view_doc !== 'undefined'){
        file_view_doc.unsubscribe();
    }

    // Open a new connection
    let socket = new ReconnectingWebSocket("ws://" + location.host + `/${user}/${project}`);
    let connection = new sharedb.Connection(socket);
    file_view_doc = connection.get(user, project);
    console.log(location.host);
    
    // Fetch the doc's data
    file_view_doc.fetch(function(e){
        // First time we fetch this doc from the server
        if(file_view_doc.version == 0){
            file_view_doc.create({content: ""});
        }
        // Subscribe to the doc to start listening for changes
        file_view_doc.subscribe(function(err) {
        });
    });
    
    // On file_view_doc update the fileview
    file_view_doc.on("op", () =>{
        /* Erase the old data */
        project_files.innerHTML = "";
        get_project_data().then(response => 
            {update_file_view(project_files, "", response.data.children, "block", 0);})
    });

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

    
    /* Open a connection for this file */
    let url = window.location.href.split("/");
    let user = url[url.length - 2];
    let file = filepath;
    
    get_file_data(filepath).then(response => {

        let text_editor = document.querySelector("#editor");
        let url = window.location.href.split("/");
        let user = url[url.length - 2];
        let file = filepath;
        current_file_open = file

        // Unsubscribe from the previous doc to stop listening for changes
        if(typeof doc !== 'undefined'){
            doc.unsubscribe();
        }

        // Open a new connection
        let socket = new ReconnectingWebSocket("ws://" + location.host + `/${user}/${file}`);
        let connection = new sharedb.Connection(socket);
        doc = connection.get(user, file);
        

        if(myCodeMirror != null)
            myCodeMirror.toTextArea();
        

        // Initialize code-mirror
        text_editor.value = response.data.file_data;
        myCodeMirror = CodeMirror.fromTextArea(text_editor,{
            lineNumbers: true,
            autoRefresh:true,
            inputStyle: "textarea",
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

        // Fetch the doc's data
        doc.fetch(function(e){
            // First time we fetch this doc from the server
            console.log(doc);
            if(doc.version == 0){
                doc.create({content: response.data.file_data});
            }
            // Subscribe to the doc to start listening for changes
            doc.subscribe(function(err) {
                if (err) throw err;
                let data = doc.data.content.data ? doc.data.content.data : doc.data.content;
                myCodeMirror.setValue(data);
            });
        });

        let cursor;
        /* On code-mirror change(something was typed) fetch the doc from the server.
         * If the doc's data doesn't match the current data then submit the changes to the
         * doc else return.
        */
       // Use the change object here
        myCodeMirror.on("change", (mirror, change_obj)=>{
            doc.fetch(() => {
                console.log(change_obj);
                if(doc.data){
                    if(doc.data.content.data === myCodeMirror.getValue()){
                        return;
                    }
                    else{
                        // Pass the editor change to the doc
                        let content = {
                            data : myCodeMirror.getValue(),
                            change : change_obj,
                            user : document.querySelector(".username").textContent.trim()
                        }
                        doc.submitOp([{p: ['content'], oi: content}]);
                    }
                }
            })
        });

        /* When an operation is called on the doc update the 
         * code-mirror data. This is done because multiple user's can share
         * a doc and listen for the changes so code-mirror must be updated.
         * This alsos causes a recursion loop with the above listener if not handled
         * correctly and that's why we compare the code-mirror data with the doc data
         * before submiting the operation.
         */
        doc.on("op", ()=>{
            doc.fetch(()=>{
                if(doc.data){
                    if(doc.data.content.data === myCodeMirror.getValue())
                        return;
                    
                    let change = doc.data.content.change;
                    let username = doc.data.content.user;
                    
                    /* Ignore changes by the current user or changes that occured when opening the editor */
                    if(username === document.querySelector(".username").textContent.trim() || change.origin === "setValue")
                        return;
                    
                    console.log(doc.data.content);

                    // Change was a single input
                    if(change.origin == "+input"){
                        if(change.text.length == 2){ // Newline was added
                            myCodeMirror.replaceRange("\n", change.from, change.to);
                        }
                        else{
                            // If line is empty add some spaces before the characters
                            if(myCodeMirror.getDoc().getLine(change.from.line).trim().length == 0){
                                for(let i = 0; i < change.from.ch; i++)
                                    myCodeMirror.replaceRange(" ", change.from, change.to);
                            }
                            myCodeMirror.replaceRange(change.text, change.from, change.to);
                        }
                    }
                    else if(change.origin == "+delete" || change.origin == "paste" || change.origin == "undo"){
                        myCodeMirror.replaceRange(change.text, change.from, change.to);
                    }
                }
            });
        })

        
        setInterval(() => {
            console.log("Assert")
            doc.fetch(()=>{
                if(doc.data.content.data){
                    if(doc.data.content.data !== myCodeMirror.getValue()){
                        cursor = myCodeMirror.getDoc().getCursor();
                        myCodeMirror.setValue(doc.data.content.data);
                        myCodeMirror.focus();
                        myCodeMirror.getDoc().setCursor(cursor);
                    }
                }
            });
        }, 1000000);
        

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
const rename_input_text = document.querySelector("#rename_input_text");

const input_container = document.querySelector(".input-container");
const rename_input_container = document.querySelector(".rename-input-container");
const input_error_container = document.querySelector(".input-error-container");

const rename_input_error_container = document.querySelector(".rename-input-error-container");

const delete_file_button = document.querySelector("#delete_file");

const rename_icon = document.querySelector("#rename-icon");
const rename_button = document.querySelector("#rename");

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
rename_input_text.addEventListener("input", check_rename_input);

delete_file_button.addEventListener("click", delete_file);

rename_icon.addEventListener("click", show_rename_dialog);
rename_button.addEventListener("click", rename_file);

function show_input_error(error_msg){
    input_error_container.textContent = error_msg;
    input_error_container.style.display = "flex";

    create_button.disabled = true;
}

function show_rename_input_error(error_msg){
    rename_input_error_container.textContent = error_msg;
    rename_input_error_container.style.display = "flex";

    rename_button.disabled = true;
}

function hide_rename_input_error(type){
    rename_input_error_container.style.display = "none";
    rename_button.disabled = false;
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
        console.log("Going thourgh")
        //Search for the file or folder name.
        let name;
        let index = dir[i].id.lastIndexOf("\\");
        name = dir[i].id.substring(index + 1, dir[i].id.length);
        

        if(name == text){
            console.log("I will show error")
            show_input_error(`${name} already exists`);
            return;
        }
        else{
            hide_input_error();
        }
    }
}

function check_rename_input(e){

    let text = rename_input_text.value;
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
        console.log("Going thourgh for rename")
        //Search for the file or folder name.
        let name;
        let index = dir[i].id.lastIndexOf("\\");
        name = dir[i].id.substring(index + 1, dir[i].id.length);
        
        if(name == text){
            show_rename_input_error(`${name} already exists`);
            return;
        }
        else{
            hide_rename_input_error();
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

    file_view_doc.submitOp([{p: ['content'], oi: "new"}]);
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

async function delete_file(){
    
    let to_be_deleted;
    let flag =  false;
    console.log("Last visited ", last_visited.id);
    console.log("Currently open ", current_file_open);

    if(current_file_open != "" && current_file_open == last_visited.id){
        console.log("Here")
        flag = true;
        to_be_deleted = last_visited.id;
    }
    else{
        console.log("There")
        to_be_deleted = last_visited.parentElement.id;
    }


    console.log("Requested to delete ", to_be_deleted);

    await axios({
        method: 'post',
        url: window.location.href + "/delete/" + to_be_deleted,
    });

    file_view_doc.submitOp([{p: ['content'], oi: "new"}]);
    last_visited = project_files;

    if(flag){
        let user = url[url.length - 2];
        let socket = new ReconnectingWebSocket("ws://" + location.host + `/${user}/${to_be_deleted}`);
        let connection = new sharedb.Connection(socket);
        doc = connection.get(user, to_be_deleted);
        
        doc.fetch(() => {
            if(doc.data){

            // Pass the editor change to the doc
            let content = {
                data : "",
                change : null,
                user : document.querySelector(".username").textContent.trim()
            }
            doc.submitOp([{p: ['content'], oi: content}]);
        
            }
        })

        current_file_open = "";
        document.querySelector(".open-files").textContent = ""
        const text_editor = document.querySelector("#editor");
        if(myCodeMirror != null)
            myCodeMirror.toTextArea();
        text_editor.value = "";
        myCodeMirror = CodeMirror.fromTextArea(text_editor);
    }
}

async function show_rename_dialog(){
    

    if(rename_input_container.style.display == "none"){
        rename_input_container.style.display = "flex";
        check_rename_input(this);
    }
    else
        rename_input_container.style.display = "none";

    
    
    // let to_be_renamed;
    // console.log("Last visited ", last_visited.id);
    // console.log("Currently open ", current_file_open);

    // if(current_file_open != "" && current_file_open == last_visited.id){
    //     console.log("Here")
    //     to_be_renamed = last_visited.id;
    // }
    // else{
    //     console.log("There")
    //     to_be_renamed = last_visited.parentElement.id;
    // }


    // console.log("Requested to renamed ", to_be_renamed);

    // // await axios({
    // //     method: 'post',
    // //     url: window.location.href + "/rename/" + to_be_renamed,
    // // });
    // // file_view_doc.submitOp([{p: ['content'], oi: "new"}]);
}

async function rename_file(){

    let to_be_renamed;
    let flag = false;
    console.log("Last visited ", last_visited.id);
    console.log("Currently open ", current_file_open);

    if(current_file_open != "" && current_file_open == last_visited.id){
        flag = true;
        to_be_renamed = last_visited.id;
    }
    else{
        to_be_renamed = last_visited.parentElement.id;
    }


    console.log(`"Requested to rename  ${to_be_renamed} to ${rename_input_text.value}`);
    await axios({
        method: 'post',
        url: window.location.href + "/rename/" + rename_input_text.value + "/" + to_be_renamed,
    });
    
    file_view_doc.submitOp([{p: ['content'], oi: "new"}]);

    if(flag){
        document.querySelector(".open-files").textContent = ""
        const text_editor = document.querySelector("#editor");
        if(myCodeMirror != null)
            myCodeMirror.toTextArea();
        text_editor.value = "";
        myCodeMirror = CodeMirror.fromTextArea(text_editor);
    }

    return 0;
}

// Close the file open on page leave
window.addEventListener("beforeunload", async function(e) {

    // Close the old file
    if(current_file_open !== ""){
        await axios({
            method: 'post',
            url: window.location.href + "/close_file/" + current_file_open,
        });
    }
    e.preventDefault(); //per the standard
    e.returnValue = ''; //required for Chrome
});