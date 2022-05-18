'use strict';

const defaultFilename = "text.json";

// Main container for all content in the imported file
var jsonObj;

// Current selected index of the subchunk to edit
var subchunkIndex;

// Filename to use when exporting
var filename = defaultFilename;

// Map of event to the subchunk it belongs to
var eventToSubchunkMap = {};

// Map of subchunk name to the tags it contains
var subchunkToTagsMap = {};

// Map of event to the lines (object) it contains
var eventToLinesMap = {};

// Map of subchunk to stats
var subchunkAnalyticsTable = {};

// Map of topics to stats
var topicAnalyticsTable = {};

// Sorted list of events in current file
var sortedEvents;

// Column order
const columnList = ["Actions", "LineId", "Clr", "Evt", "Txt", "Wgt", "Cool", "Spkr", "Trgt", "Dscr", "Snd", "Cmt", "Obj1", "Obj2", "Id", "Loc"];

const iconDupeSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M11,17H4A2,2 0 0,1 2,15V3A2,2 0 0,1 4,1H16V3H4V15H11V13L15,16L11,19V17M19,21V7H8V13H6V7A2,2 0 0,1 8,5H19A2,2 0 0,1 21,7V21A2,2 0 0,1 19,23H8A2,2 0 0,1 6,21V19H8V21H19Z" /></svg>`;
const iconAddRowAfterSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M22,10A2,2 0 0,1 20,12H4A2,2 0 0,1 2,10V3H4V5H8V3H10V5H14V3H16V5H20V3H22V10M4,10H8V7H4V10M10,10H14V7H10V10M20,10V7H16V10H20M11,14H13V17H16V19H13V22H11V19H8V17H11V14Z" /></svg>`;
const iconAddRowBeforeSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M22,14A2,2 0 0,0 20,12H4A2,2 0 0,0 2,14V21H4V19H8V21H10V19H14V21H16V19H20V21H22V14M4,14H8V17H4V14M10,14H14V17H10V14M20,14V17H16V14H20M11,10H13V7H16V5H13V2H11V5H8V7H11V10Z" /></svg>`;
const iconRemoveRowSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M9.41,13L12,15.59L14.59,13L16,14.41L13.41,17L16,19.59L14.59,21L12,18.41L9.41,21L8,19.59L10.59,17L8,14.41L9.41,13M22,9A2,2 0 0,1 20,11H4A2,2 0 0,1 2,9V6A2,2 0 0,1 4,4H20A2,2 0 0,1 22,6V9M4,9H8V6H4V9M10,9H14V6H10V9M16,9H20V6H16V9Z" /></svg>`;
const iconSortSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M18 21L14 17H17V7H14L18 3L22 7H19V17H22M2 19V17H12V19M2 13V11H9V13M2 7V5H6V7H2Z" /></svg>`;
const iconAddSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>`;
const iconRemoveSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M19,13H5V11H19V13Z" /></svg>`;


// Map of column id to readable header name
const columnNames = {
  "Actions": "Actions",
  "Obj1": "Object 1",
  "Obj2": "Object 2",
  "LineId": "Index",
  "Evt": "Event",
  "Txt": "Text",
  "Spkr": "Speaker",
  "Trgt": "Target",
  "Id": "Localization ID",
  "Dscr": "Actions",
  "Snd": "Sound",
  "Cmt": "Comment",
  "Loc": "Loc",
  "Clr": "Color",
  "Wgt": "Weight",
  "Cool": "Cool"
};

const csvColumns = ["Spkr", "Trgt", "Dscr"];

function setActiveTab(tabId) {
  localStorage.setItem("activeTab", tabId);
}

// Restores cached state on load
window.onload = function () {
  let activeTab = localStorage.getItem("activeTab");
  let activePanel = "";
  switch (activeTab) {
    case "tab-import":
      activePanel = "import-panel";
      break;
    case "tab-analytics":
      activePanel = "analytics-panel";
      break;
    case "tab-viz":
      activePanel = "viz-panel";
      break;
  }
  if (activeTab != undefined && activePanel != "") {
    document.getElementById("tab-import").classList.remove("is-active");
    document.getElementById("import-panel").classList.remove("is-active");
    document.getElementById(activeTab).classList.add("is-active");
    document.getElementById(activePanel).classList.add("is-active");
  }

  let cached = localStorage.getItem("jsonObj");
  if (cached != null) {
    document.getElementById("textarea").value = cached;
  }
  let cachedSubchunkIndex = localStorage.getItem("subchunkIndex");
  if (cachedSubchunkIndex != null) {
    subchunkIndex = cachedSubchunkIndex;
  }
  filename = localStorage.getItem("filename");
  document.getElementById("title-filename").innerHTML = `: ${filename}`;
  renderSubchunkSelector();
}

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 's') {
    console.log("save keypress detected");
    snackbar("Updated JSON text");
    e.preventDefault();
    populateTextArea();
  }

  if (e.ctrlKey && e.key === 'e') {
    snackbar("Exporting to file");
    e.preventDefault();
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
});

// Loads JSON from the textarea and parses it into an object
function getJsonObjFromTextarea() {
  let jsonInput = document.getElementById("textarea").value;
  jsonObj = {};
  try {
    jsonObj = JSON.parse(jsonInput);
  } catch (e) {
    jsonObj = {};
    analytics();
    return;
  }

  if (subchunkIndex == undefined || subchunkIndex < 0 || subchunkIndex > jsonObj.SubChunks.length) {
    // Reset the current subchunk index
    subchunkIndex = 0;
  }

  // Run analytics
  analytics();
}

function getTagsFromCsv(csvStr, preserveOperator = false) {
  if (csvStr == undefined) {
    return [];
  }
  return csvStr.split(',').map(e => {
    e = e.trim();
    if (!preserveOperator && e.startsWith("-")) {
      e = e.substr(1);
    }
    return e;
  });
}

function getEventName(eventStr) {
  if (eventStr.includes(":")) {
    let index = eventStr.indexOf(":");
    return eventStr.substr(0, index);
  }
  return eventStr;
}

// In-place case-insensitive sort, shamelessly copied from stackoverflow
function arrCaseInsensitiveSort(arr) {
  if (arr.length <= 1) {
    return;
  }
  arr.sort(function (a, b) {
    if (a.toLowerCase() < b.toLowerCase()) return -1;
    if (a.toLowerCase() > b.toLowerCase()) return 1;
    return 0;
  });
}

//#region Cell operations

// Adds a cell to the header
function insertHeaderCell(row, name) {
  let cell = document.createElement("th");
  cell.setAttribute("style", "font-weight: bold; position: sticky;");
  cell.setAttribute("class", "mdl-data-table__cell--non-numeric");
  let headerCellWrapper = document.createElement("div");
  let headerCellLabel = document.createElement("div");
  headerCellLabel.innerHTML = name;

  cell.appendChild(headerCellWrapper);
  headerCellWrapper.appendChild(headerCellLabel);
  row.appendChild(cell);
}

// Inserts a special cell that contains the index of the current line
function insertLineIdCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.innerHTML = lineIndex;
}

// Adds a special cell that performs actions
function insertActionsCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdl-data-table__cell--non-numeric");

  let dupeDiv = document.createElement("button");
  dupeDiv.setAttribute("class", "mdl-button mdl-js-button mdl-button--icon");
  dupeDiv.innerHTML = iconDupeSvg;
  dupeDiv.title = "Duplicate this row";
  dupeDiv.addEventListener('click', () => mutateTable(subchunkIndex, lineIndex, "Dupe"));

  let insertAboveDiv = document.createElement("button");
  insertAboveDiv.setAttribute("class", "mdl-button mdl-js-button mdl-button--icon");
  insertAboveDiv.innerHTML = iconAddRowBeforeSvg;
  insertAboveDiv.title = "Add row above";
  insertAboveDiv.addEventListener('click', () => mutateTable(subchunkIndex, lineIndex, "AddAbove"));

  let insertBelowDiv = document.createElement("button");
  insertBelowDiv.setAttribute("class", "mdl-button mdl-js-button mdl-button--icon");
  insertBelowDiv.innerHTML = iconAddRowAfterSvg;
  insertBelowDiv.title = "Add row below";
  insertBelowDiv.addEventListener('click', () => mutateTable(subchunkIndex, lineIndex, "AddBelow"));

  let removeDiv = document.createElement("button");
  removeDiv.setAttribute("class", "mdl-button mdl-js-button mdl-button--icon");
  removeDiv.innerHTML = iconRemoveRowSvg;
  removeDiv.title = "Delete row";
  removeDiv.addEventListener('click', () => mutateTable(subchunkIndex, lineIndex, "Del"));

  cell.appendChild(insertAboveDiv);
  cell.appendChild(dupeDiv);
  cell.appendChild(document.createElement("br"));
  cell.appendChild(insertBelowDiv);
  cell.appendChild(removeDiv);
}

// Performs the given action on the underlying json and redraws the data table
function mutateTable(subchunkIndex, lineIndex, action) {
  console.log(`Mutating w/ action ${action} on ${subchunkIndex}, ${lineIndex}`);
  switch (action) {
    case "AddAbove":
      jsonObj.SubChunks[subchunkIndex].Lines.splice(lineIndex, 0, {});
      break;
    case "AddBelow":
      jsonObj.SubChunks[subchunkIndex].Lines.splice(lineIndex + 1, 0, {});
      break;
    case "Del":
      jsonObj.SubChunks[subchunkIndex].Lines.splice(lineIndex, 1);
      break;
    case "Dupe":
      let currLine = jsonObj.SubChunks[subchunkIndex].Lines[lineIndex];
      let dupeLine = JSON.parse(JSON.stringify(currLine));
      jsonObj.SubChunks[subchunkIndex].Lines.splice(lineIndex, 0, dupeLine);
      break;
  }
  renderTable();
}

// Inserts a checkbox cell
function insertCheckboxCell(row, lineIndex, getFromJsonObjHelper, updateJsonObjHelper) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdl-data-table__cell--non-numeric");
  const input = document.createElement("input");
  input.setAttribute("type", "checkbox");
  input.checked = getFromJsonObjHelper(subchunkIndex, lineIndex);
  input.addEventListener('change', () => {
    let value = input.checked;
    updateJsonObjHelper(subchunkIndex, lineIndex, value);
    renderTable();
  });
  cell.appendChild(input);
}

// Inserts a special color selector cell
function insertColorCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdl-data-table__cell--non-numeric");
  const input = document.createElement("input");
  let value = jsonObj.SubChunks[subchunkIndex].Lines[lineIndex]["Clr"];
  input.setAttribute("type", "color");
  input.value = value;
  input.addEventListener('change', input => {
    let value = input.target?.value;
    if (value == undefined || value == "#000000") {
      console.log(`removing color of subchunk ${subchunkIndex} line ${lineIndex}`);
      delete jsonObj.SubChunks[subchunkIndex].Lines[lineIndex]["Clr"];
    } else {
      console.log(`updating color of subchunk ${subchunkIndex} line ${lineIndex} to ${value}`);
      jsonObj.SubChunks[subchunkIndex].Lines[lineIndex]["Clr"] = value;
    }
    renderTable();
  });
  cell.appendChild(input);
}

// Inserts an editable cell
function insertEditableCell(row, lineIndex, fieldName) {
  let cell = row.insertCell();
  let formWrapper = document.createElement("form");
  formWrapper.setAttribute("class", "#");
  let divWrapper = document.createElement("div");
  divWrapper.setAttribute("class", "mdl-textfield mdl-js-textfield");
  let input = document.createElement("textarea");
  input.setAttribute("class", "mdl-textfield__input");
  input.setAttribute("type", "text");
  input.setAttribute("rows", 3);
  let id = `${subchunkIndex}-${lineIndex}-${fieldName}`;
  input.setAttribute("id", id)
  input.setAttribute("placeholder", fieldName);
  let value = jsonObj.SubChunks[subchunkIndex].Lines[lineIndex][fieldName];
  input.value = value == undefined ? "" : value;

  switch (fieldName) {
    case "Evt":
    case "Trgt":
    case "Spkr":
    case "Dscr":
      input.style = "width:300px";
      break;
    case "Loc":
    case "Wgt":
    case "Cool":
      input.style = "width:35px";
      break;
    case "Txt":
    case "Cmt":
    case "Id":
      input.style = "width:500px";
      break;
    default:
      input.style = "width:200px";
  }

  input.addEventListener('change', input => {
    let newValue = input.target?.value;
    console.log(`updating subchunk index ${subchunkIndex}, line index ${lineIndex}, field name ${fieldName} from "${value}" to "${newValue}"`);
    // Delete the field from the JSON if the cell is cleared
    if (newValue == "undefined" || newValue == "") {
      delete jsonObj.SubChunks[subchunkIndex].Lines[lineIndex][fieldName];
    }
    else {
      jsonObj.SubChunks[subchunkIndex].Lines[lineIndex][fieldName] = newValue;
    }
  });
  formWrapper.appendChild(input);
  cell.appendChild(formWrapper);
}

//#endregion Cell operations

//#region Row operations

// Adds the table header
function insertHeader() {
  let headerRow = document.getElementById("headerrow");
  headerRow.innerHTML = "";
  if (jsonObj.SubChunks == undefined || jsonObj.SubChunks.length == 0) {
    return;
  }
  columnList.forEach(e => {
    insertHeaderCell(headerRow, columnNames[e]);

  });
}

// Populates a row in the table
function insertRow(table, lineIndex) {
  let row = table.insertRow();
  columnList.forEach(e => {
    switch (e) {
      case "Actions":
        insertActionsCell(row, lineIndex);
        break;
      case "LineId":
        insertLineIdCell(row, lineIndex);
        break;
      case "Clr":
        insertColorCell(row, lineIndex);
        break;
      case "Loc":
        insertCheckboxCell(row, lineIndex, (subchunkIndex, lineIndex) => {
          return jsonObj.SubChunks[subchunkIndex].Lines[lineIndex]["Loc"] == "1";
        }, (subchunkIndex, lineIndex, value) => {
          if (value) {
            console.log(`setting loc checkbox for subchunk ${subchunkIndex} line ${lineIndex}`);
            jsonObj.SubChunks[subchunkIndex].Lines[lineIndex]["Loc"] = "1";
          } else {
            console.log(`removing loc checkbox for subchunk ${subchunkIndex} line ${lineIndex}`);
            delete jsonObj.SubChunks[subchunkIndex].Lines[lineIndex]["Loc"];
          }
        });
        break;
      default:
        insertEditableCell(row, lineIndex, e);
    }
  });
}

//#endregion Row operations

//#region analytics

function getEventIdInSubchunk(eventStr, subchunkName) {
  return "(" + subchunkName + ") " + getEventName(eventStr);
}

function analytics() {
  let analyticsSubchunk = document.getElementById("analytics-num-subchunks");
  let analyticsLine = document.getElementById("analytics-num-lines");
  let analyticsTags = document.getElementById("analytics-num-tags");
  let analyticsEvents = document.getElementById("analytics-num-events");

  analyticsSubchunk.innerHTML = "";
  analyticsLine.innerHTML = "";
  analyticsTags.innerHTML = "";
  analyticsEvents.innerHTML = "";

  eventToSubchunkMap = {};
  subchunkToTagsMap = {};
  eventToLinesMap = {};

  subchunkAnalyticsTable = {};
  topicAnalyticsTable = {};

  if (jsonObj.SubChunks == undefined) {
    updateAnalyticsTables();
    return;
  }
  let numSubChunks = jsonObj.SubChunks.length;

  let numLines = 0;
  let tags = new Set();
  let allEventsSet = new Set();

  // Populate cached analytics
  jsonObj.SubChunks.forEach(subchunk => {
    numLines += subchunk.Lines.length;
    let subchunkName = subchunk.Name;
    subchunkToTagsMap[subchunkName] = new Set();
    subchunkAnalyticsTable[subchunkName] = {};
    let eventsInSubchunkSet = new Set();
    let linesInSubchunk = 0;
    subchunk.Lines.forEach(line => {
      linesInSubchunk++;
      let eventName = line['Evt'];

      // Split out event index and add to event lines map
      let tokens = eventName.split(":");
      let shortEventName = tokens[0].toLowerCase(); // Topic name
      let eventSubTag = tokens.length > 0 ? tokens[1] : ""; // Sequence index, if any
      let longEventName = combineEventAndSubchunkName(shortEventName, subchunkName);
      eventsInSubchunkSet.add(longEventName);

      if (subchunkAnalyticsTable[subchunkName][longEventName] == undefined) {
        subchunkAnalyticsTable[subchunkName][longEventName] = {};
        subchunkAnalyticsTable[subchunkName][longEventName]["numLines"] = 0;
      }

      if (subchunkAnalyticsTable[subchunkName][longEventName][eventSubTag] == undefined) {
        subchunkAnalyticsTable[subchunkName][longEventName][eventSubTag] = new Array();
      }

      subchunkAnalyticsTable[subchunkName][longEventName][eventSubTag].push(line);
      subchunkAnalyticsTable[subchunkName][longEventName]["numLines"]++;


      allEventsSet.add(longEventName);
      eventToSubchunkMap[longEventName] = subchunkName;

      // Get all tags invoked in the speaker/target columns
      let spkrTags = getTagsFromCsv(line['Spkr']);
      let trgtTags = getTagsFromCsv(line['Trgt']);

      spkrTags.forEach(tag => {
        let sanitized = tag.toLowerCase();
        tags.add(sanitized);
        subchunkToTagsMap[subchunkName].add(sanitized);
      });
      trgtTags.forEach(tag => {
        let sanitized = tag.toLowerCase();
        tags.add(sanitized)
        subchunkToTagsMap[subchunkName].add(sanitized);
      });

      subchunkAnalyticsTable[subchunkName][longEventName]["numTags"] = tags.size;
    });
    subchunkAnalyticsTable[subchunkName].numTopics = eventsInSubchunkSet.size;
    subchunkAnalyticsTable[subchunkName].numLines = linesInSubchunk;
  });

  analyticsSubchunk.innerHTML = numSubChunks;
  analyticsLine.innerHTML = numLines;
  analyticsTags.innerHTML = tags.size;
  analyticsEvents.innerHTML = allEventsSet.size;

  sortedEvents = new Array();

  sortedEvents = Array.from(allEventsSet);
  //arrCaseInsensitiveSort(sortedEvents);

  updateAnalyticsTables();
}

function combineEventAndSubchunkName(event, subchunk) {
  return `${subchunk} - ${event}`;
}

function updateAnalyticsTables() {
  let subchunkTable = document.getElementById("analytics-subchunk-body");
  let topicTable = document.getElementById("analytics-topic-body");
  subchunkTable.innerHTML = "";
  topicTable.innerHTML = "";

  if (jsonObj.SubChunks == undefined) {
    return;
  }
  for (let i = 0; i < jsonObj.SubChunks.length; i++) {
    let subchunk = jsonObj.SubChunks[i];
    let row = document.createElement("tr");

    let indexCell = document.createElement("td");
    let subchunkNameCell = document.createElement("td");
    subchunkNameCell.setAttribute("class", "mdl-data-table__cell--non-numeric");
    let numTopicsCell = document.createElement("td");
    let numLinesCell = document.createElement("td");

    indexCell.innerHTML = i;
    subchunkNameCell.innerHTML = subchunk.Name;
    numTopicsCell.innerHTML = subchunkAnalyticsTable[subchunk.Name].numTopics;
    numLinesCell.innerHTML = subchunkAnalyticsTable[subchunk.Name].numLines;

    row.appendChild(indexCell);
    row.appendChild(subchunkNameCell);
    row.appendChild(numTopicsCell);
    row.appendChild(numLinesCell);

    subchunkTable.appendChild(row);
  };

  for (let i = 0; i < sortedEvents.length; i++) {
    let event = sortedEvents[i];
    let subchunk = eventToSubchunkMap[event];
    let row = document.createElement("tr");

    let indexCell = document.createElement("td");
    let topicNameCell = document.createElement("td");
    topicNameCell.setAttribute("class", "mdl-data-table__cell--non-numeric");
    let numSeqCell = document.createElement("td");
    let numLinesCell = document.createElement("td");
    let numTagsCell = document.createElement("td");

    indexCell.innerHTML = i;
    topicNameCell.innerHTML = event;
    // Subtract two keys because we store the number of lines and number of tags as keys
    numSeqCell.innerHTML = Object.keys(subchunkAnalyticsTable[subchunk][event]).length - 2;
    numLinesCell.innerHTML = subchunkAnalyticsTable[subchunk][event].numLines;
    numTagsCell.innerHTML = subchunkAnalyticsTable[subchunk][event].numTags;

    row.appendChild(indexCell);
    row.appendChild(topicNameCell);
    row.appendChild(numSeqCell);
    row.appendChild(numLinesCell);
    row.appendChild(numTagsCell);
    topicTable.appendChild(row);
  }
}

//#endregion Analytics


//#region Renderers

// Populates the subchunk dropdown selector
function renderSubchunkSelector() {
  getJsonObjFromTextarea();

  let selector = document.getElementById("subchunkSelector");
  selector.innerHTML = "";

  if (jsonObj.SubChunks == undefined) {
    return;
  }

  for (let i = 0; i < jsonObj.SubChunks.length; i++) {
    let subchunk = jsonObj.SubChunks[i];
    let option = document.createElement("option");
    option.subchunkIndex = i;
    option.text = subchunk.Name;
    selector.add(option);
  }
  if (subchunkIndex != undefined) {
    selector.selectedIndex = subchunkIndex;
  }
  selectorListener();
}

// Populates the table with what is currently in the global jsonObj variable
function renderTable() {
  const nameElement = document.getElementById("jsonName");
  nameElement.innerHTML = jsonObj.Name != undefined ? jsonObj.Name : "";

  const locElement = document.getElementById("locInfo");
  if (jsonObj.LocalizationDisabled) {
    locElement.innerHTML = "Localization DISABLED";
  } else {
    locElement.innerHTML = "";
  }

  const table = document.getElementById("datatablebody");
  table.innerHTML = "";

  insertHeader();
  if (jsonObj.SubChunks == undefined || jsonObj.SubChunks.length == 0) {
    return;
  }
  let subchunk = jsonObj.SubChunks[subchunkIndex];
  for (let j = 0; j < subchunk.Lines.length; j++) {
    insertRow(table, j);
  }

}

//#endregion Renderers

//#region Handlers/Listeners 

// Handles drag & drop events on the textarea
function dropHandler(event) {
  event.preventDefault();
  console.log("drag detected");
  if (event.dataTransfer.items) {
    // Access only the first item dropped
    if (event.dataTransfer.items[0].kind === 'file') {
      let file = event.dataTransfer.items[0].getAsFile();
      console.log(`Getting contents of file ${file.name}`);
      filename = file.name;
      document.getElementById("title-filename").innerHTML = `: ${filename}`;
      localStorage.setItem("filename", filename);
      file.text().then(text => {
        document.getElementById("textarea").value = text;
        document.getElementById("textareawrapper").classList.add("is-dirty");
        textareaListener();
        renderSubchunkSelector();
      });
    }
  } else {
    console.log("Not a file");
    console.log(event.dataTransfer.files[0].name);
  }
}

// Listener for updating the cache every time the textarea is changed
function textareaListener() {
  console.log("updating cache")
  let jsonInput = document.getElementById("textarea").value;
  localStorage.setItem("jsonObj", jsonInput);
  subchunkIndex = 0;
  renderSubchunkSelector();
}

// Populates the text area with what is currenly in the global jsonObj variable
function populateTextArea() {
  let textbox = document.getElementById("textarea");
  let textToSet = JSON.stringify(jsonObj, null, 2);
  textbox.value = textToSet;
  localStorage.setItem("jsonObj", textToSet);
  return textToSet;
}

function clearAll() {
  console.log("clearing");
  localStorage.clear();
  filename = defaultFilename;
  document.getElementById("title-filename").innerHTML = "";
  document.getElementById("textarea").value = "";
  document.getElementById("textareawrapper").classList.remove("is-dirty");
  getJsonObjFromTextarea()
  renderSubchunkSelector();
  renderTable();
  analytics();
}

// Listener updating the current global subchunk index and cached subchunk index every time the selector is updated
function selectorListener() {
  let selector = document.getElementById("subchunkSelector");
  subchunkIndex = selector.selectedIndex;
  localStorage.setItem("subchunkIndex", subchunkIndex);
  renderTable();
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