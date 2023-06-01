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
    console.log(file);

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
