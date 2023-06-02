async function downloadFile(file) {
  if (file.type === "dir") {
    let j = new JSZip();
    console.log(file);
    let files = Object.keys(file.files);
    function fs(parent) {
      const l = [];
        if (parent.type === "dir") {
          Object.keys(parent).forEach((f) => {
            if(f === "files") {
              console.log(f);
              Object.keys(parent[f]).forEach(filee => {
                l.push(parent[f][filee]);
              })
            } else if(f === "type"){

            } else {
              if (parent[f].type === "dir") {
                l.push(fs(parent[f]))
              } else {
                l.push(f);
              }
            }
          });
        } else {
          l.push(parent);
        }
        return l;
    }
    for (let i = 0; i < files.length; i++) {
      let f = files[i];
      console.log(f, file.files[f]);
      const tree = fs(file.files[f]).flat(100);
      console.log(tree);
      tree.forEach(element => {
        if(typeof element === 'object') {
          j.file(element.path, element.parts[0][0])
        }
      })
      // j.file(f.webkitRelativePath, str);
      // console.log(f.name);
    }
    j.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content, file.name);
    });
  } else if (file.name.endsWith(".zip")) {
    console.log(file);
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
    const blob = new Blob([str], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    link.remove();
  }
}
