function getParent(path) {
  let split = path.split("/");
  let parent = "";
  let current = "";
  if (split[split.length - 1] === "") {
    parent = split[split.length - 3];
    current = split[split.length - 2];
  } else {
    parent = split[split.length - 2];
    current = split[split.length - 1];
  }
  return {
    parent: parent,
    parentPath: path.replace(current, "").replace("//", "/"),
  };
}
console.log(getParent("root/subdir/currentFile/"));
async function uploadFiles(e) {
  const files = e.target.files;
  let folderName = getParent(
    e.target.files[0].webkitRelativePath
  ).parentPath.split("/")[0];
  let id = getTime();
  window.set(window.ref(window.db, "home/" + id + "/type"), "dir");
  window.set(
    window.ref(window.db, "home/" + id + "/name"),
    folderName + " | " + getTime()
  );
  let size = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    let obj = {};
    obj["name"] = file.name;
    obj["type"] = file.type;
    obj["size"] = file.size;
    obj["path"] = file.webkitRelativePath;
    
    size += file.size;
    reader.onerror = function (error) {
      console.log("Could not load file", error);
    };
    
    if (file.type.startsWith("image")) {console.log(file); reader.readAsDataURL(file);}
    else reader.readAsText(file);
    
    reader.onload = async function (event) {
      obj["parts"] = [partitionData(event.target.result, 10_000)];
      console.log(file.webkitRelativePath.replace(".", "_"));
      // window.set(
      //   window.ref(
      //     window.db,
      //     "home/" + id + "/files/" + file.webkitRelativePath.replace(".", "_")
      //   ),
      //   obj
      // );
      window.set(
        window.ref(
          window.db,
          ("home/" +
            id +
            "/files/" +
            getParent(file.webkitRelativePath).parentPath +
            "/files/" +
            file.name).replace(".", "_").replace("//", "/")
        ),
        obj
      );
      window.set(
        window.ref(
          window.db,
          "home/" +
            id +
            "/files/" +
            getParent(file.webkitRelativePath).parentPath +
            "/type"
        ),
        "dir"
      );
    };

  }
  window.set(window.ref(window.db, "home/" + id + "/size"), size);

  listFiles();
}
