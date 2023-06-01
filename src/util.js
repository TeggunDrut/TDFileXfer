async function getFiles() {
  let files = [];
  let query = window.ref(window.db, "home");
  await window
    .get(query)
    .then((snapshot) => {
      if (snapshot.exists()) {
        files = snapshot.val();
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
  return files;
}

async function listFiles() {
  // The object containing the files
  var files = await getFiles();

  // Get the div element to display the file list

  // Get the div element to display the file list
  var fileDiv = document.getElementById("fileList");
  fileDiv.innerHTML = "";

  for (var key in files) {
    if (files.hasOwnProperty(key)) {
      var file = files[key];
      var fileDetails = document.createElement("div");
      fileDetails.setAttribute("class", "row");
      fileDetails.textContent =
        "Name: " +
        file.name +
        " | Size: " +
        file.size +
        " | Type: " +
        file.type;

      var downloadButton = document.createElement("button");
      downloadButton.textContent = "Download";
      downloadButton.setAttribute("class", "btn btn-primary");
      downloadButton.addEventListener(
        "click",
        (function (file) {
          return function () {
            downloadFile(file);
          };
        })(file)
      );
      var deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.setAttribute("class", "btn btn-danger");
      deleteButton.addEventListener(
        "click",
        (function (file) {
          return function () {
            deleteFile(file);
          };
        })(file)
      );

      fileDetails.appendChild(downloadButton);
      fileDetails.appendChild(deleteButton);
      fileDiv.appendChild(fileDetails);
    }
  }
  let childs = fileDiv.children;
  for (let i = 0; i < childs.length; i++) {
    if (i % 2 !== 0) {
      childs[i].classList.add("gray");
    }
  }
}
async function deleteFile(file) {
  let ref, ref2;
  if(file.type === "dir") {
    ref = window.ref(window.db, "home/" + file.name.split("|")[1].replace(" ", ""));
    ref2 = window.ref(window.db, "home/" + file.id);
  } else {
    ref = window.ref(window.db, "home/" + file.id);
  }
  try {
    await window.remove(ref);
  } catch (error) {
    try {
      await window.remove(ref2);
      
    } catch (error) {
      console.log("Couldnt delete file(s)", error);
    }
  }
  
  listFiles();
}
function removeEmptyStrings(array) {
  return array.filter((element) => element !== "");
}
function getTime() {
  const d = new Date();
  return (
    d.getMonth() +
    "-" +
    d.getDay() +
    "-" +
    d.getFullYear() +
    ":" +
    d.getHours() +
    "-" +
    d.getMinutes() +
    "-" +
    d.getSeconds()
  );
};
function partitionData(data, partitionSize) {
  const partitions = [];
  const length = data.length;

  for (let i = 0; i < length; i += partitionSize) {
    partitions.push(data.slice(i, i + partitionSize));
  }

  return partitions;
}
