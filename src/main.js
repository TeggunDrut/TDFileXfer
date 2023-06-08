let done = false;
let loading = document.querySelector("#loading");

setInterval(() => {
  if (document.querySelector("#fileList").children.length > 1 && done === false) {
    if(done === false)
      loading.style.display = "none";
    done = true;
  }
  listFiles();
}, 500);

function openFilePicker() {
  var filePicker = document.getElementById("fileButton");
  filePicker.click();
}

function handleFileChange() {
  var filePicker = document.getElementById("fileButton");
  var fileName = document.getElementById("fileName");

  if (filePicker.files.length > 0) {
    fileName.innerHTML = filePicker.files[0].name;
  } else {
    fileName.innerHTML = "Upload File";
  }
}
