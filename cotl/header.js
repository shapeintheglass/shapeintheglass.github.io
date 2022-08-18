const cultNameInputId = "cult-name-input";
const downloadButtonId = "download-button";

// Main container for all content in the imported file
var jsonObj;
// Filename to use when exporting
var filename = "slot_0.json";

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    console.log("save keypress detected");
    exportJson();
  }
});

function populatePage(jsonObj) {
  // 
}

function exportJson() {
  if (jsonObj) {
    snackbar("Exporting to file");
    let textToSet = localStorage.getItem(localStorageJsonObjKey);
    saveToFile(filename, textToSet, 'text');
  }
}

function saveToFile(fileNameToSave, fileContents, type) {
  let file = new Blob([fileContents], { type: type });
  if (window.navigator.msSaveOrOpenBlob) // IE10+
    window.navigator.msSaveOrOpenBlob(file, fileNameToSave);
  else { // Others
    let a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = fileNameToSave;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

//#region Handlers/Listeners 

// Handles drag & drop events
function dropHandler(event) {
  event.preventDefault();
  console.log("drag detected");
  if (event.dataTransfer.items) {
    // Access only the first item dropped
    if (event.dataTransfer.items[0].kind === 'file') {
      let file = event.dataTransfer.items[0].getAsFile();
      console.log(`Getting contents of file ${file.name}`);
      filename = file.name;
      localStorage.setItem(localStorageFilenameKey, filename);
      file.arrayBuffer().then(buffer => {
        try {
          localStorage.setItem(localStorageJsonObjKey, decryptOrGetJson(buffer));
        } catch (e) {
          snackbar("Unable to parse save file")
        }
      });

    }
  } else {
    console.log("Not a file");
    console.log(event.dataTransfer.files[0].name);
  }
}

// Attempts to decrypt or parse into JSON
function decryptOrGetJson(buffer) {
  try {
    return decryptText(buffer);
  } catch (e) {
    var enc = new TextDecoder("utf-8");
    return enc.decode(buffer);
  }
}

// Decrypts text in a save file
// Copied from https://pentalex.github.io/COTL-SaveDecryptor/
function decryptText(buffer) {
  var bytes = new Uint8Array(buffer);

  var keyBytes = bytes.slice(1, 17)
  var IVBytes = bytes.slice(17, 33)

  var newBytes = bytes.slice(1, bytes.length)
  var aesCbc = new aesjs.ModeOfOperation.cbc(keyBytes, IVBytes);
  var decryptedBytes = aesCbc.decrypt(newBytes);

  // Convert our bytes back into text
  var newDecryptedBytes = decryptedBytes.slice(32, decryptedBytes.length)
  var unpaddedBytes = aesjs.padding.pkcs7.strip(newDecryptedBytes)
  var decryptedText = aesjs.utils.utf8.fromBytes(unpaddedBytes);
  return decryptedText
}

//#endregion Handlers/listeners

//#region Snackbar

function snackbar(msg) {
  let notification = document.querySelector('.mdl-js-snackbar');
  let data = {
    message: msg,
    timeout: 1000
  };
  notification.MaterialSnackbar.showSnackbar(data);
}

//#endregion Snackbar