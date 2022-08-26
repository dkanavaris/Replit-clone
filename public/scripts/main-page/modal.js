const modal = document.querySelector(".modal");
const button = document.querySelector("#create-button");
const close = document.querySelector(".close-modal");
button.addEventListener("click", open_modal);

const delete_modal = document.querySelector(".delete-modal");
const delete_button = document.querySelector("#delete-button");
const delete_close = document.querySelector(".delete-close-modal");
delete_button.addEventListener("click", open_delete_modal);

/* Display the modal */
function open_modal() {
	console.log("Modal");
	modal.style.display = "block";
}

/* Display the modal */
function open_delete_modal() {
	console.log("Modal");
	delete_modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
close.onclick = function() {
	delete_modal.style.display = "none";
}

  // When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal || event.target == delete_modal) {
      modal.style.display = "none";
      delete_modal.style.display = "none";
    }
}