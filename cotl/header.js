const cultNameInputId = "cult-name-input";
const cultistNameDivId = "cultist-names";
const cultistNameDeadDivId = "cultist-names-dead";

const cotlCultNameKey = "CultName";
const cotlFollowersArrKey = "Followers";
const cotlFollowersDeadArrKey = "Followers_Dead";
const cotlFollowersNameKey = "Name";
const cotlDoctrineUpgradesKey = "DoctrineUnlockedUpgrades";
const cotlUpgradesKey = "UnlockedUpgrades";
const cotlCultTraitsKey = "CultTrait";

const doctrineIds = new Map([
  [6, 'r-insp'],
  [7, 'r-inti'],
  [8, 'r-glor'],
  [9, 'r-enli'],
  [10, 'r-fait'],
  [11, 'r-indu'],
  [12, 'r-toil'],
  [13, 'r-holy'],
  [14, 'r-exto'],
  [15, 'r-brib'],
  [16, 'r-arch'],
  [17, 'r-devo'],
  [18, 'r-mate'],
  [19, 'r-fals'],
  [20, 'r-alms'],
  [21, 'r-enri'],
  [22, 'r-fast'],
  [23, 'r-feas'],
  [24, 'r-subt'],
  [25, 'r-proh'],
  [26, 'r-cann'],
  [27, 'r-gras'],
  [28, 'r-harv'],
  [29, 'r-ocea'],
  [30, 'r-bsac'],
  [31, 'r-baft'],
  [32, 'r-resu'],
  [33, 'r-fune'],
  [34, 'r-resp'],
  [35, 'r-good'],
  [36, 'r-retu'],
  [37, 'r-grie'],
  [38, 'r-murd'],
  [39, 'r-asce'],
  [40, 'r-figh'],
  [41, 'r-wedd'],
  [42, 'r-loya'],
  [43, 'r-taxe'],
  [44, 'r-orig'],
  [45, 'r-abso'],
  [47, 'r-sacr'],
  [49, 'r-read'],
  [50, 'r-bonf'],
]);

const doctrineIdsToCultTraits = new Map([
  [30, 9],
  [31, 3],
  [34, 30],
  [35, 31],
  [10, 11],
  [11, 24],
  [18, 18],
  [19, 18],
  [16, 27],
  [17, 26],
  [44, 7],
  [45, 8],
  [26, 5],
  [27, 6],
  [24, 28],
  [25, 29]
]);

const doctrineIdsToUpgrades = new Map([
  [32, 110],
  [33, 111],
  [36, 53],
  [37, 57],
  [8, 100],
  [9, 101],
  [12, 102],
  [13, 103],
  [20, 104],
  [21, 105],
  [39, 154],
  [40, 112],
  [41, 113],
  [44, 7],
  [45, 8],
  [42, 114],
  [43, 115],
  [22, 106],
  [23, 107],
  [28, 108],
  [29, 109],
]);

function setDoctrineCheckbox(doctrineId) {
  let checkboxId = doctrineIds.get(doctrineId);
  let checkboxElement = document.getElementById(checkboxId);
  checkboxElement.setAttribute("checked", "true");
}

function applyDoctrineCheckboxes() {
  // Clear the existing array of doctrines
  let newDoctrines = [];
  let newCultTraits = new Set(jsonObj[cotlCultTraitsKey]);
  let newUpgrades = new Set(jsonObj[cotlUpgradesKey]);

  for (var i = 6; i < 51; i++) {
    let checkboxId = doctrineIds.get(i);
    if (!checkboxId) {
      continue;
    }
    let isChecked = document.getElementById(checkboxId).checked;
    let cultTrait = doctrineIdsToCultTraits.get(i);
    let upgrade = doctrineIdsToUpgrades.get(i);
    if (isChecked) {
      newDoctrines.push(i);
      // add cult traits / upgrades if possible
      if (cultTrait && !newCultTraits.has(cultTrait)) {
        newCultTraits.add(cultTrait);
      }
      if (upgrade && !newUpgrades.has(upgrade)) {
        newUpgrades.add(upgrade);
      }
    } else {
      // remove cult traits / upgrades if possible
      if (cultTrait && newCultTraits.has(cultTrait)) {
        newCultTraits.delete(cultTrait);
      }
      if (upgrade && newUpgrades.has(upgrade)) {
        newUpgrades.delete(upgrade);
      }
    }
  }
  jsonObj[cotlDoctrineUpgradesKey] = newDoctrines;
  jsonObj[cotlCultTraitsKey] = Array.from(newCultTraits);
  jsonObj[cotlUpgradesKey] = Array.from(newUpgrades);
}

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
  // Cultist names (living)
  let cultistDiv = document.getElementById(cultistNameDivId);
  let cultistNames = "";
  jsonObj[cotlFollowersArrKey].forEach(follower => {
    cultistNames += `<p>${follower[cotlFollowersNameKey]}: <input class="mdl-textfield__input" type="text" value="${follower[cotlFollowersNameKey]}"></p>`;
  });
  cultistDiv.innerHTML = cultistNames;
  // Cultist names (dead)
  let cultistDeadDiv = document.getElementById(cultistNameDeadDivId);
  let cultistNamesDead = "";
  jsonObj[cotlFollowersDeadArrKey].forEach(follower => {
    cultistNamesDead += `<p>${follower[cotlFollowersNameKey]}: <input class="mdl-textfield__input" type="text" value="${follower[cotlFollowersNameKey]}"></p>`;
  });
  cultistDeadDiv.innerHTML = cultistNamesDead;

  // Doctrines
  jsonObj[cotlDoctrineUpgradesKey].forEach(doctrineId => setDoctrineCheckbox(doctrineId));
}

function updateJson() {
  // Cult name
  jsonObj[cotlCultNameKey] = document.getElementById(cultNameInputId).value;
  // Cultist names (living)
  let cultistNameTextFields = Array.from(document.getElementById(cultistNameDivId).children);
  for (let i = 0; i < cultistNameTextFields.length; i++) {
    let newFollowerName = cultistNameTextFields[i].firstElementChild.value;
    jsonObj[cotlFollowersArrKey][i][cotlFollowersNameKey] = newFollowerName;
  }
  // Cultist names (dead)
  let cultistNameDeadTextFields = Array.from(document.getElementById(cultistNameDeadDivId).children);
  for (let i = 0; i < cultistNameDeadTextFields.length; i++) {
    let newFollowerName = cultistNameDeadTextFields[i].firstElementChild.value;
    jsonObj[cotlFollowersDeadArrKey][i][cotlFollowersNameKey] = newFollowerName;
  }

  // Doctrines
  applyDoctrineCheckboxes();
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
    timeout: 2000
  };
  notification.MaterialSnackbar.showSnackbar(data);
}

//#endregion Snackbar