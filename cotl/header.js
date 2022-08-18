const cultNameInputId = "cult-name-input";
const cultistNameDivId = "cultist-names";
const downloadButtonId = "download-button";


const cotlCultNameKey = "CultName";
const cotlFollowersArrKey = "Followers";
const cotlFollowersNameKey = "Name";

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
  // Cult name
  document.getElementById(cultNameInputId).value = jsonObj[cotlCultNameKey]
  // Cultist names
  let cultistDiv = document.getElementById(cultistNameDivId);
  let cultistNames = "";
  jsonObj[cotlFollowersArrKey].forEach(follower => {
    cultistNames += `<p>${follower[cotlFollowersNameKey]}: <input class="mdl-textfield__input" type="text" value="${follower[cotlFollowersNameKey]}"></p>`;
  });
  cultistDiv.innerHTML = cultistNames;
}

function updateJson() {
  // Cult name
  jsonObj[cotlCultNameKey] = document.getElementById(cultNameInputId).value;
  // Cultist names
  let cultistNameTextFields = Array.from(document.getElementById(cultistNameDivId).children);
  for (let i = 0; i < cultistNameTextFields.length; i++) {
    let newFollowerName = cultistNameTextFields[i].firstElementChild.value;
    jsonObj[cotlFollowersArrKey][i][cotlFollowersNameKey] = newFollowerName;
  }
}

function exportJson() {
  if (jsonObj) {
    updateJson();
    snackbar("Saving " + filename);
    textToSet = JSON.stringify(jsonObj);
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
  jsonObj = "";
  filename = "";
  snackbar("Parsing... may take a while for large files");
  if (event.dataTransfer.items) {
    // Access only the first item dropped
    if (event.dataTransfer.items[0].kind === 'file') {
      let file = event.dataTransfer.items[0].getAsFile();
      console.log(`Getting contents of file ${file.name}`);
      filename = file.name;
      file.arrayBuffer().then(buffer => {
        try {
          decryptOrGetJson(buffer);
        } catch (e) {
          snackbar("Unable to parse save file")
        }
        populatePage(jsonObj);
        snackbar("Finished parsing file");
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
    jsonObj = JSON.parse(decryptText(buffer));
  } catch (e) {
    let enc = new TextDecoder("utf-8");
    jsonObj = JSON.parse(enc.decode(buffer));
  }
}

// Decrypts text in a save file
// Copied from https://pentalex.github.io/COTL-SaveDecryptor/
function decryptText(buffer) {
  let bytes = new Uint8Array(buffer);

  let keyBytes = bytes.slice(1, 17)
  let IVBytes = bytes.slice(17, 33)

  let newBytes = bytes.slice(1, bytes.length)
  let aesCbc = new aesjs.ModeOfOperation.cbc(keyBytes, IVBytes);
  let decryptedBytes = aesCbc.decrypt(newBytes);

  // Convert our bytes back into text
  let newDecryptedBytes = decryptedBytes.slice(32, decryptedBytes.length)
  let unpaddedBytes = aesjs.padding.pkcs7.strip(newDecryptedBytes)
  let decryptedText = aesjs.utils.utf8.fromBytes(unpaddedBytes);
  return decryptedText
}

//#endregion Handlers/listeners

//#region Snackbar

function snackbar(msg) {
  let notification = document.querySelector('.mdl-js-snackbar');
  let data = {
    message: msg,
    timeout: 5000
  };
  notification.MaterialSnackbar.showSnackbar(data);
}

//#endregion Snackbar