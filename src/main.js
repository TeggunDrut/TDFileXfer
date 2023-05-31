function partitionData(data, partitionSize) {
  const partitions = [];
  const length = data.length;

  for (let i = 0; i < length; i += partitionSize) {
    partitions.push(data.slice(i, i + partitionSize));
  }

  return partitions;
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
}
async function downloadFile(file) {
  if (file.type === "dir") {
    let j = new JSZip();
    for (let i = 0; i < Object.keys(file.files).length; i++) {
      let f = file.files[Object.keys(file.files)[i]];
      let parts = f.parts;
      let str = "";
      for (let i = 0; i < parts.length; i++) {
        str += parts[i];
      }
      
      j.file(f.webkitRelativePath, str);
      console.log(f.name);
    }
    j.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content);
    });
  } else if (file.name.endsWith(".zip")) {
    const zip = new JSZip();
    zip.file(file.webkitRelativePath, file.parts[0]);
    zip.generateAsync({ type: "blob" }).then(function (content) {
      console.log(content);
      saveAs(content);
    });
  } else if (file.type.startsWith("image")) {
    const image = await fetch(file.parts[0]);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);

    const link = document.createElement("a");
    link.href = imageURL;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    let parts = file.parts;
    let str = "";
    for (let i = 0; i < parts.length; i++) {
      str += parts[i];
    }
    console.log(str);
  }
}
async function deleteFile(file) {
  let ref = window.ref(window.db, "home/" + file.name.split("|")[1]);
  await window.remove(ref);
  listFiles();
}
function removeEmptyStrings(array) {
  return array.filter((element) => element !== "");
}

async function uploadFile(e) {
  let file = e.target.files[0];
  let reader = new FileReader();

  let obj = {};
  reader.onerror = function (error) {
    console.log("Could not load file", error);
  };

  if (file.type.startsWith("image")) {
    reader.readAsDataURL(file);
  } else {
    reader.readAsArrayBuffer(file);
  }

  reader.onload = function (event) {
    let id = getTime();
    obj["id"] = id;
    obj["name"] = file.name;
    obj["type"] = file.type;
    obj["size"] = file.size;
    console.log(file)

    window.set(window.ref(window.db, "home/" + id), obj);

    if (file.name.endsWith("zip")) {
      JSZip.loadAsync(event.target.result)
        .then(function (zip) {
          zip.forEach(function (relativePath, zipEntry) {
            if (!zipEntry.dir) {
              let files = [];
              zipEntry.async("string").then(function (fileData) {
                // Process each file data
                window.set(
                  window.ref(
                    window.db,
                    "home/" + id + "/files/" + relativePath.replace(".", "_")
                  ),
                  fileData
                );
              });
            }
          });
        })
        .catch(function (error) {
          console.error(error);
        });
    } else {
      console.log(event.target.result);

      if (file.type.split("/")[0] === "image") {
        window.set(
          window.ref(window.db, "home/" + id + "/parts/0"),
          event.target.result
        );
      } else {
        let length = event.target.result.length;
        let strs = [];
        if (length > 100000) {
          let cnt = length.toString().split("").reverse();
          let e = event.target.result;
          cnt = Number.parseInt(cnt.join(""));
          for (let i = 0; i < cnt; i += 1) {
            strs.push(
              event.target.result.slice(i * 100000, i * 100000 + 100000)
            );
          }

          obj["data"] = strs;

          const newArr = removeEmptyStrings(strs);
          for (let i = 0; i < newArr.length; i++) {
            window.set(
              window.ref(window.db, "home/" + id + "/parts/" + i),
              newArr[i]
            );
          }
        } else {
          console.log(1, event.target.result);
          window.set(
            window.ref(window.db, "home/" + id + "/parts/0"),
            event.target.result
          );
        }
      }
    }
  };

  listFiles();
}

async function uploadFiles(e) {
  const files = e.target.files;
  let id = getTime();
  window.set(window.ref(window.db, "home/" + id + "/type"), "dir");
  window.set(
    window.ref(window.db, "home/" + id + "/name"),
    "folder|" + getTime()
  );
  let size = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    let obj = {};
    obj["name"] = file.name;
    obj["type"] = file.type;
    obj["size"] = file.size;
    
    size += file.size;
    reader.onerror = function (error) {
      console.log("Could not load file", error);
    };

    reader.onload = async function (event) {
      obj["parts"] = [partitionData(event.target.result, 10_000)];
      console.log(file.webkitRelativePath.replace(".", "_"));
      window.set(
        window.ref(
          window.db,
          "home/" + id + "/files/" + file.webkitRelativePath.replace(".", "_")
        ),
        obj
      );
    };

    if (file.type.startsWith("image")) reader.readAsDataURL(file);
    else reader.readAsText(file);
  }
  window.set(window.ref(window.db, "home/" + id + "/size"), size);

  listFiles();
}

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
