const file_add_button = document.querySelector("#file_plus");
const folder_add_button = document.querySelector("#folder_plus");
const myform = document.getElementsByClassName("myform")[0];
//TODO: add check if filename and foldername

file_add_button.addEventListener("click", add_file);
folder_add_button.addEventListener("click", add_folder);

function add_file(){
    myform.style.display = "block"
    myform.addEventListener('submit', function(s) {
        s.preventDefault();
        let text = form_input_name.value;
        this.action = window.location.href + "/file_create/" + text;
        this.submit();
        myform.style.display = "none";
    });
}

function add_folder(){
    myform.style.display = "block"
    myform.addEventListener('submit', function(s) {
        s.preventDefault();
        let text = form_input_name.value;
        console.log(window.location.href + "/folder_create/" + text);
        this.action = window.location.href + "/folder_create/" + text;
        this.submit();
        myform.style.display = "none";
    });
}