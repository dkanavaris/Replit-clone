const Project = require("../../mongoose-models/project_model");
const fs = require("fs");
const path = require('path');
const ws = require("ws").Server;
const pty = require('node-pty');
const stripAnsi = require('strip-ansi');
const pathExists = require('path-exists');

//TODO: add semaphores so multiple users cannot save,create,delete togethen

const TERMINAL_JSON = require("../../terminal.json");
const BACKEND_PATH = TERMINAL_JSON.BACKEND_PATH;
const UNAUTHORIZED_COMMANDS = TERMINAL_JSON.UNAUTHORIZED_COMMANDS;
const CWD = process.cwd();

async function get_path(req){
    const project_name = req.params.project_name
    const username = req.params.username.replace("@", "");
    const project_path = await Project.findOne({name: project_name, owner: username});
    return project_path.path;
}

exports.file_create = async function(req, res){

    let path = await get_path(req);

    const filepath =  path + "\\" +
                    req.params.filepath + req.params[0];

    fs.writeFileSync(filepath, "");

    res.json({return:"success"});
}

exports.folder_create = async function(req, res){

    let path = await get_path(req);

    path = path + "\\" +
    req.params.folderpath + req.params[0];

    fs.mkdirSync(path);
    res.json({return:"success"});

}

exports.save_file = async function(req, res){

    let path = await get_path(req);

    const filepath =  path + "\\" +
        req.params.filepath + req.params[0];

    fs.writeFileSync(filepath, req.body.data);
    console.log("File saved! at " + filepath);
}

exports.get_file = async function(req, res){

    let path = await get_path(req);

    const filepath = path + "\\" +
                        req.params.path + req.params[0];

    let file_data = fs.readFileSync(filepath, 'utf-8');

    res.json({file_data: file_data});
}

exports.get_project_files = async function(req, res){

    let path = await get_path(req);
    res.json(dirTree(path));
}


function is_subdir(dir, parent){
    // const relative = path.relative(parent, dir);
    // console.log("relative ", relative)
    // return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    return !dir.includes(parent);
}

exports.get_terminal = async function(req, res){

    // Change the working directory to this project
    process.chdir(CWD + "\\users\\" + req.params.username + "\\" + req.params.project_name);

    const tty = pty.spawn("wsl.exe", [], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: process.cwd(),
        env: process.env
    });
    

    let clear = Buffer.from("15", 'hex');
    let newline = Buffer.from("0d", 'hex');
    let tab = Buffer.from("09", "hex");

    let keyup = Buffer.alloc(3);
    let keydown = Buffer.alloc(3);
    let keyright = Buffer.alloc(3);
    let keyleft = Buffer.alloc(3);

    keyup[0] = "27";
    keyup[1] = "91";
    keyup[2] = "65";
    
    keydown[0] = "27";
    keydown[1] = "91";
    keydown[2] = "66";

    keyright[0] = "27";
    keyright[1] = "91";
    keyright[2] = "67";

    keyleft[0] = "27";
    keyleft[1] = "91";
    keyleft[2] = "68";

    tty.write("export PS1='Replit Clone > '\r\n"); // Change the terminal name
    tty.write("history -c \r\n"); // Delete the history for this terminal
    tty.write("clear" + newline)

    let server = new ws({port: 0});
    let keypressed = false;
    let tab_pressed = false;
    let cursor_pos = -1;

    let print_custom = false;
    let print_path = false;
    let custom_message = "";

    const project_name = req.params.project_name;
    const username = req.params.username.replace("@", "");
    
    const root_path = process.cwd();
    let curr_path = root_path;

    server.on('connection', (ws) => {

        let command = "";
        ws.on('message', (msg) => {
        
            let recv = msg.toString();
            if(recv.startsWith("ESCAPED|-- ")){
                console.log("Resizing");
                recv = recv.substr(18);
                let cols = recv.slice(0, -4);
                let rows = recv.substr(4);
                tty.resize(Number(cols), Number(rows));
            }
        
            else{

                let obj = JSON.parse(JSON.stringify(msg));

                //console.log("MSG : ", obj); //TODO: helpful uncommenct it
                //console.log("My buffer : ", clear);
                //console.log(msg);
                
                //tty.write(msg);

                // FIXME: Collpase keyup and keydown
                if(msg.equals(keyup)){ // KEYUP handler
                    keypressed = true;
                    // Set the flag that the key was pressed
                    console.log("KEYUP==========================================");
                    tty.write(msg);
                }
                
                else if(msg.equals(keydown)){ // KEYDOWN handler
                    // Set the flag that the key was pressed
                    keypressed = true;
                    console.log("KEYDOWN==========================================");
                    tty.write(msg);
                }

                else if(msg.equals(keyright)){ // RIGHTKEY handler
                    // Move the cursor
                    if(cursor_pos < command.length)
                        cursor_pos++;
                    tty.write(msg);
                }

                else if(msg.equals(keyleft)){ // LEFTKEY handler
                    // Move the cursor
                    if(cursor_pos >= 0)
                        cursor_pos--;
                    tty.write(msg);
                }

                else if(msg.equals(tab)){

                    console.log("Tab was pressed when command was ", command)
                    tab_pressed = true;
                    tty.write(msg);
                }

                // ASCII used to determine if characters are printable check ASCII.png
                else if(obj.data >= 32 && obj.data <= 126){
                    cursor_pos++;
                    // Add the input at cursor position
                    command = command.slice(0, cursor_pos) + msg.toString() + command.slice(cursor_pos)
                    tty.write(msg);
                }

                else if(obj.data == 127){ //Backspace

                    if(cursor_pos >= 0){
                        console.log("Cursor at ", cursor_pos)
                        console.log("Before ", JSON.stringify(command));
                        command = command.substring(0, cursor_pos) + command.substring(cursor_pos + 1, command.length);
                        console.log("After ", JSON.stringify(command));
                        cursor_pos--;
                        tty.write(msg);
                    }
                }

                else if(obj.data == 13){ //Enter, newline
                    //console.log("newline-====================");
                    
                    command = stripAnsi(command); // Remove ANSI characters
                    command = command.replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove unicode characters
                    command = command.replace(/\s{2,}/g, ' ').trim(); // Remove exccess whitespace
            
                    console.log("Will execute ", command);

                    // Check for valid navigation
                    if(command.includes("cd")){
                        command = command.split(" ");

                        let temp_path = `${curr_path}/`;
                        
                        for(let i = 1; i < command.length - 1; i++){
                            let index = command[i].indexOf("\\");
                            let sub_dir = command[i].substring(0, index);
                            temp_path += `${sub_dir} `;
                        }

                        temp_path += `${command[command.length - 1]}/`;
                        console.log(command)
                        
                        console.log(path.resolve(curr_path));
                        temp_path = path.resolve(temp_path);
                        console.log(temp_path);

                        console.log(`Curr ${curr_path}\nTemp ${temp_path}\nRoot ${root_path}`);

                        if(is_subdir(temp_path, root_path) || command.length == 1 || command[command.length - 1].startsWith("/") || command[command.length - 1].startsWith("~")){
                            custom_message = (Buffer.from(`\x1b[91mCannot navigate\x1b[m`));
                            print_custom = true;
                            // If the cursor is not at the end of the command move it there so the
                            // clear takes affect.
                            for(let i = cursor_pos; i <= (command.length - cursor_pos) + 1; i++)
                                tty.write(keyright)
                            
                            tty.write(clear + newline + newline)
                        }

                        else if(pathExists.sync(temp_path)){
                            curr_path = temp_path;
                            tty.write(msg)
                        }
                        
                        else{
                            tty.write(msg);
                        }
                    }

                    // Check for unauthorized commandss
                    else if(UNAUTHORIZED_COMMANDS.some(substring=>command.includes(substring))){
                        custom_message = (Buffer.from(`\x1b[91mCannot execute ${command}\x1b[m`));
                        print_custom = true;
                        // If the cursor is not at the end of the command move it there so the
                        // clear takes affect.
                        for(let i = cursor_pos; i <= (command.length - cursor_pos) + 1; i++)
                            tty.write(keyright);
                        
                        tty.write(clear + newline + newline)
                    }

                    // Check if pwd was entered
                    else if(command == "pwd"){
                        print_path = true
                        let index = curr_path.indexOf(`${project_name}`);
                        console.log("Index is ", index);
                        let pwd_path = curr_path.substring(index, curr_path.length);
                        custom_message = Buffer.from(pwd_path);    
                        tty.write(newline);
                    }


                    else{

                        let error = false;

                        console.log(command);
                        let sub_commands = command.split(" ");
                        console.log(sub_commands);

                        
                        for(let i = 0; i < sub_commands.length; i++){
                            sub_command = sub_commands[i];

                            if(sub_command == ".." || sub_command.includes("/") || sub_command.includes("~")){

                                if(sub_command.startsWith("/") || sub_command.startsWith("~")){
                                    console.log("AT IF");
                                    custom_message = (Buffer.from(`\x1b[91mInvalid Path\x1b[m`));
                                    print_custom = true;
                                    // If the cursor is not at the end of the command move it there so the
                                    // clear takes affect.
                                    for(let i = cursor_pos; i <= (command.length - cursor_pos) + 1; i++)
                                        tty.write(keyright)
                                    
                                    tty.write(clear + newline + newline)
                                    error = true;
                                    break;
                                }
                                else{
                                    console.log("At ELSE");
                                    let temp_path = `${curr_path}/`;
                            
                                    
                                    temp_path += `${sub_command}`;
                                    temp_path = path.resolve(temp_path);
                                    
                                    if(is_subdir(temp_path, root_path)){
                                        custom_message = (Buffer.from(`\x1b[91mInvalid Path\x1b[m`));
                                        print_custom = true;
                                        // If the cursor is not at the end of the command move it there so the
                                        // clear takes affect.
                                        for(let i = cursor_pos; i <= (command.length - cursor_pos) + 1; i++)
                                            tty.write(keyright)
                                        
                                        tty.write(clear + newline + newline)
                                        error = true;
                                        break;
                                    }
                                }
                            }
                        }

                        if(!error)
                            tty.write(msg);
                    }
                    
                    command = "";
                    cursor_pos = -1;
                    
                }

                else if(obj.data == 3){ // Ctrl-C
                    command = "";
                    cursor_pos = -1;
                    tty.write(msg);
                }
                else{
                    tty.write(msg);
                }
            }  
        });
        
        tty.onData((data) => {
            try{

                //console.log(JSON.stringify(data));

                console.log(JSON.stringify(data));

                // Up or down arrow was pressed so get the new command
                if(keypressed){
                    keypressed = false;
                    command = stripAnsi(data.toString('utf-8'));
                    command.replace(`Replit Clone >`, "");
                    cursor_pos = command.length - 1;
                    console.log("Command to be exec ", command);
                    ws.send(data);
                }
                
                // Tab was pressed and the command was filled
                else if(tab_pressed){
                    tab_pressed = false;
                    let added = stripAnsi(data.toString('utf-8'));
                    added = added.replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove unicode characters

                    if(!data.includes("\r\n")){
                        command += added;
                        cursor_pos = command.length - 1;
                        ws.send(data);
                    }
                }
                
                // Handle pwd
                else if(print_path){
                    if(data.includes(BACKEND_PATH)){
                        print_path = false;

                        //data = data.replace(`${BACKEND_PATH}/${username}/${custom_message}`, custom_message);
                        backend_index = data.indexOf(BACKEND_PATH);
                        end_index = data.indexOf("\u001b[K", backend_index);
                        
                        if(end_index == -1){
                            end_index = data.indexOf("\r\n", backend_index);
                            if(end_index == -1)
                                end_index = data.length;
                        }

                        console.log(backend_index);
                        console.log(end_index);
                        
                        data = data.replace(data.substring(backend_index, end_index), custom_message);
                        ws.send(data)
                    }
                    else{
                        ws.send(data);
                    }
                }

                // Custom error message
                else if(print_custom && data.includes(`Replit Clone >`)){
                    console.log("Here1\n")
                    ws.send(data);
                    ws.send(`\x1b[s\x1b[1F\x1b[2K${custom_message}\x1b[u`);
                    print_custom = false;
                }
                

                else
                    ws.send(data);
                
                
            }catch(e){
            }
        })
    });

    res.json(server.address().port);
}

exports.main_page_project = async function(req, res){

    /* If user is not logged in redirect him to log in */
    if(!req.isAuthenticated()){
        res.redirect("/login");
        return;
    }

    /* Check if project and username exist in DB*/
    const project_name = req.params.project_name
    const username = req.params.username.replace("@", "");
    const project_path = await Project.findOne({name: project_name, owner: username});

    /* If project does not exist redirect to main-page*/
    if(!project_path){
        res.redirect("/main-page");
        return;
    }

    /* Else store the current project path to a local 
     * variable and redirect to project page. */
    //req.app.locals.currentProjectPath = project_path.path;
    res.render("project", {url: req.url, project_name: project_name});
}

/* Returns the contents of filename if filename is a directory ,or the
 * the info of the file otherwise */
function dirTree(filename) {
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename)
        };
 
    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function(child) {
            return dirTree(filename + '\\' + child);
        });
    } else {
        info.type = "file";
    }
 
    return info;
}