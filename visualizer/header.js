// Main container for all content in the imported file
var jsonObj;

// Filename to use when exporting
var filename = defaultFilename;

// Map of subchunk to stats
var subchunkAnalyticsTable = {};

function setActiveTab(tabId) {
  localStorage.setItem(localStorageActiveTabKey, tabId);
}

// Restores cached state on load
window.onload = function () {
  // Active tab state
  let activeTab = localStorage.getItem(localStorageActiveTabKey);
  let activePanel = "";
  switch (activeTab) {
    case htmlIdTabImport:
      activePanel = htmlIdPanelImport;
      break;
    case htmlIdTabAnalytics:
      activePanel = htmlIdPanelAnalytics;
      break;
    case htmlIdTabViz:
      activePanel = htmlIdPanelViz;
      break;
  }

  if (activeTab && activePanel) {
    document.getElementById(htmlIdTabImport).classList.remove("is-active");
    document.getElementById(htmlIdPanelImport).classList.remove("is-active");
    document.getElementById(activeTab).classList.add("is-active");
    document.getElementById(activePanel).classList.add("is-active");
  }

  // Set textarea to json obj
  let cached = localStorage.getItem(localStorageJsonObjKey);
  if (cached) {
    document.getElementById(htmlIdTextAreaInput).value = cached;
    onTextAreaChanged(/* skip render */ true);
  }

  // Edit tab - Selected subchunk
  let cachedSubchunkIndex = localStorage.getItem(localStorageTableSubchunkIndexKey);
  if (cachedSubchunkIndex) {
    editorSubchunkIndex = cachedSubchunkIndex;
  }

  // Filename
  filename = localStorage.getItem(localStorageFilenameKey);
  if (filename) {
    document.getElementById(htmlIdFilename).innerHTML = `: ${filename}`;
  }

  renderAllTabs();
}

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    console.log("save keypress detected");
    populateTextArea();
  }
  if (e.ctrlKey && e.key === 'e') {
    e.preventDefault();
    console.log("export keypress detected");
    exportJson();
  }
});

function exportJson() {
  if (jsonObj) {
    snackbar("Exporting to file");
    let textToSet = populateTextArea();
    let file = new Blob([textToSet], { type: "text" });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
      let a = document.createElement("a"),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
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
      if (filename) {
        document.getElementById(htmlIdFilename).innerHTML = `: ${filename}`;
      }
      localStorage.setItem(localStorageFilenameKey, filename);
      // Copy file contents into textarea, then read json from textarea
      // Reset the index of the analytics tab
      setVizSubchunkAndTopicIndeces(0, 0);
      file.text().then(text => {
        document.getElementById(htmlIdTextAreaInput).value = text;
        document.getElementById(htmlIdTextAreaWrapperInput).classList.add("is-dirty");
        onTextAreaChanged();
      });
    }
  } else {
    console.log("Not a file");
    console.log(event.dataTransfer.files[0].name);
  }
}

// Listener for updating the cache and UI every time the textarea is changed
function onTextAreaChanged(skipRender = false) {
  console.log("updating cache")
  let jsonInput = document.getElementById(htmlIdTextAreaInput).value;

  jsonObj = {};
  try {
    jsonObj = JSON.parse(jsonInput);
  } catch (e) {
    console.log("invalid JSON detected")
    clearAll();
    return;
  }

  localStorage.setItem(localStorageJsonObjKey, jsonInput);

  if (!skipRender) {
    renderAllTabs();
  }
}

// Populates the text area with what is currenly in the global jsonObj variable
function populateTextArea() {
  if (jsonObj) {
    snackbar("Updated text area");
    let textbox = document.getElementById(htmlIdTextAreaInput);
    let textToSet = JSON.stringify(jsonObj, null, 2);
    textbox.value = textToSet;
    localStorage.setItem(localStorageJsonObjKey, textToSet);
    return textToSet;
  }
}

function clearAll() {
  console.log("clearing");
  localStorage.clear();
  clearGlobalVars();
  clearHtmlFields();
  clearAllTabs();
}

function clearGlobalVars() {
  filename = defaultFilename;
  jsonObj = undefined;
  eventToSubchunkMap = {};
  subchunkToTagsMap = {};
  eventToLinesMap = {};
  subchunkAnalyticsTable = {};
  sortedEvents = [];
}

function clearHtmlFields() {
  document.getElementById(htmlIdFilename).innerHTML = "";
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