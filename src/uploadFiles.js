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

