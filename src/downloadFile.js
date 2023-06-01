
async function downloadFile(file) {
  if (file.type === "dir") {
    console.log(file)
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
