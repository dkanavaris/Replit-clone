const modal = document.querySelector(".modal");
const button = document.querySelector("#create-button");
const close = document.querySelector(".close-modal");

button.addEventListener("click", open_modal);

/* Display the modal */
function open_modal() {
	console.log("Modal");
	modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
close.onclick = function() {
	modal.style.display = "none";
}

  // When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
}