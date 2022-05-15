'use strict';

var jsonObj;
var subchunkIndex;
var columnVisibility = {};

// Column order
const columnList = ["Dupe", "AddAbove", "AddBelow", "Del", "LineId", "Clr", "Evt", "Txt", "Spkr", "Trgt", "Dscr", "Snd", "Cmt", "Obj1", "Obj2", "Id", "Loc"];

const iconDupeSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M11,17H4A2,2 0 0,1 2,15V3A2,2 0 0,1 4,1H16V3H4V15H11V13L15,16L11,19V17M19,21V7H8V13H6V7A2,2 0 0,1 8,5H19A2,2 0 0,1 21,7V21A2,2 0 0,1 19,23H8A2,2 0 0,1 6,21V19H8V21H19Z" /></svg>`;
const iconAddRowAfterSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M22,10A2,2 0 0,1 20,12H4A2,2 0 0,1 2,10V3H4V5H8V3H10V5H14V3H16V5H20V3H22V10M4,10H8V7H4V10M10,10H14V7H10V10M20,10V7H16V10H20M11,14H13V17H16V19H13V22H11V19H8V17H11V14Z" /></svg>`;
const iconAddRowBeforeSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M22,14A2,2 0 0,0 20,12H4A2,2 0 0,0 2,14V21H4V19H8V21H10V19H14V21H16V19H20V21H22V14M4,14H8V17H4V14M10,14H14V17H10V14M20,14V17H16V14H20M11,10H13V7H16V5H13V2H11V5H8V7H11V10Z" /></svg>`;
const iconRemoveRowSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M9.41,13L12,15.59L14.59,13L16,14.41L13.41,17L16,19.59L14.59,21L12,18.41L9.41,21L8,19.59L10.59,17L8,14.41L9.41,13M22,9A2,2 0 0,1 20,11H4A2,2 0 0,1 2,9V6A2,2 0 0,1 4,4H20A2,2 0 0,1 22,6V9M4,9H8V6H4V9M10,9H14V6H10V9M16,9H20V6H16V9Z" /></svg>`;
const iconSortSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M18 21L14 17H17V7H14L18 3L22 7H19V17H22M2 19V17H12V19M2 13V11H9V13M2 7V5H6V7H2Z" /></svg>`;

// Map of column id to readable header name
const columnNames = {
  "Dupe": "",
  "AddBelow": "",
  "AddAbove": "",
  "Del": "",
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
  "Clr": "Color"
};

// Shamelessly copied from stackoverflow, determines if a string is valid JSON
function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

// Restores cached state on load
window.onload = function () {
  var cached = localStorage.getItem("jsonObj");
  if (cached != null) {
    document.getElementById("textarea").value = cached;
  }
  var cachedSubchunkIndex = localStorage.getItem("subchunkIndex");
  if (cachedSubchunkIndex != null) {
    subchunkIndex = cachedSubchunkIndex;
  }
  populateColToggles();
  if (isJsonString(cached)) {
    populateSelector();
  }
}

// Adds a cell to the header
function insertHeaderCell(row, name) {
  let cell = document.createElement("th");
  cell.setAttribute("class", "mdc-data-table__header-cell");
  cell.setAttribute("role", "columnheader");
  cell.setAttribute("scope", "col");
  cell.setAttribute("aria-sort", "none");
  cell.setAttribute("style", "font-weight: bold;");
  cell.setAttribute("data-column-id", name);

  let headerCellWrapper = document.createElement("div");
  headerCellWrapper.setAttribute("class", "mdc-data-table__header-cell-wrapper");

  let headerCellLabel = document.createElement("div");
  headerCellLabel.setAttribute("class", "mdc-data-table__header-cell-label");
  headerCellLabel.innerHTML = name;

  cell.appendChild(headerCellWrapper);
  headerCellWrapper.appendChild(headerCellLabel);
  row.appendChild(cell);
}

// Adds the table header
function insertHeader() {
  var headerRow = document.getElementById("headerrow");
  headerRow.innerHTML = "";
  columnList.forEach(e => {
    if (columnVisibility[e]) {
      insertHeaderCell(headerRow, columnNames[e]);
    }
  });
}

// Inserts a special cell that contains the index of the current line
function insertLineIdCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.setAttribute("style", "text-align: center");
  cell.setAttribute("class", "mdc-data-table__cell");
  cell.innerHTML = lineIndex;
}

// Inserts a special cell that duplicates the current row when clicked
function insertDuplicateCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");
  cell.innerHTML = iconDupeSvg;
  cell.title = "Duplicate this row";
  cell.addEventListener('click', () => mutateTable(subchunkIndex, lineIndex, "Dupe"));
}

// Inserts a special cell that inserts a new row when clicked
function insertAddAboveCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");
  cell.innerHTML = iconAddRowBeforeSvg;
  cell.title = "Add row above";
  cell.addEventListener('click', () => mutateTable(subchunkIndex, lineIndex, "AddAbove"));
}

// Inserts a special cell that inserts a new row when clicked
function insertAddBelowCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");
  cell.innerHTML = iconAddRowAfterSvg;
  cell.title = "Add row below";
  cell.addEventListener('click', () => mutateTable(subchunkIndex, lineIndex, "AddBelow"));
}

// Inserts a special cell that removes the current row when clicked
function insertRemoveCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");
  cell.innerHTML = iconRemoveRowSvg;
  cell.title = "Delete row";
  cell.addEventListener('click', () => mutateTable(subchunkIndex, lineIndex, "Del"));
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
      var currLine = jsonObj.SubChunks[subchunkIndex].Lines[lineIndex];
      jsonObj.SubChunks[subchunkIndex].Lines.splice(lineIndex, 0, currLine);
      break;
  }
  populateTable();
}

// Inserts a checkbox cell
function insertCheckboxCell(row, lineIndex, getFromJsonObjHelper, updateJsonObjHelper) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");
  const input = document.createElement("input");
  input.setAttribute("type", "checkbox");
  input.checked = getFromJsonObjHelper(subchunkIndex, lineIndex);
  input.addEventListener('change', () => {
    let value = input.checked;
    updateJsonObjHelper(subchunkIndex, lineIndex, value);
    populateTable();
  });
  cell.appendChild(input);
}

// Inserts a special color selector cell
function insertColorCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");
  const input = document.createElement("input");
  var value = jsonObj.SubChunks[subchunkIndex].Lines[lineIndex]["Clr"];
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

    populateTable();
  });
  cell.appendChild(input);
}

// Inserts an editable cell
function insertEditableCell(row, lineIndex, fieldName) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");

  var labelWrapper = document.createElement("label");
  labelWrapper.setAttribute("class", "mdc-text-field mdc-text-field--outlined mdc-text-field--textarea mdc-text-field--no-label");

  var spanOutline = document.createElement("span");
  spanOutline.setAttribute("class", "mdc-notched-outline");
  spanOutline.innerHTML = `<span class="mdc-notched-outline__leading"></span>
  <span class="mdc-notched-outline__trailing"></span>`;

  var spanResizer = document.createElement("span");
  spanResizer.setAttribute("class", "mdc-text-field__resizer");

  var input = document.createElement("textarea");
  input.setAttribute("rows", 3);
  var value = jsonObj.SubChunks[subchunkIndex].Lines[lineIndex][fieldName];
  input.value = value == undefined ? "" : value;
  input.setAttribute("class", "mdc-text-field__input")

  switch (fieldName) {
    case "Evt":
    case "Trgt":
    case "Spkr":
    case "Dscr":
      input.style = "width:300px";
      break;
    case "Loc":
      input.style = "width:25px";
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
  spanResizer.appendChild(input);
  labelWrapper.appendChild(spanOutline);
  labelWrapper.appendChild(spanResizer);
  cell.appendChild(labelWrapper);
}

// Populates a row
function insertRow(row, lineIndex) {
  columnList.forEach(e => {
    if (!columnVisibility[e]) {
      return;
    }
    switch (e) {
      case "Dupe":
        insertDuplicateCell(row, lineIndex);
        break;
      case "AddAbove":
        insertAddAboveCell(row, lineIndex);
        break;
      case "AddBelow":
        insertAddBelowCell(row, lineIndex);
        break;
      case "Del":
        insertRemoveCell(row, lineIndex);
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

// Loads JSON from the textarea and parses it into an object
function loadJsonObj() {
  var jsonInput = document.getElementById("textarea").value;
  jsonObj = JSON.parse(jsonInput);

  if (subchunkIndex == undefined || subchunkIndex < 0 || subchunkIndex > jsonObj.SubChunks.length) {
    // Reset the current subchunk index
    subchunkIndex = 0;
  }
}

// Populates the subchunk dropdown selector
function populateSelector() {
  loadJsonObj();
  var selector = document.getElementById("subchunkSelector");
  selector.innerHTML = "";
  for (var i = 0; i < jsonObj.SubChunks.length; i++) {
    var subchunk = jsonObj.SubChunks[i];
    var option = document.createElement("option");
    option.subchunkIndex = i;
    option.text = subchunk.Name;
    selector.add(option);
  }
  if (subchunkIndex != undefined) {
    selector.selectedIndex = subchunkIndex;
  }
  selectorListener();
}

// Listener updating the current global subchunk index and cached subchunk index every time the selector is updated
function selectorListener() {
  var selector = document.getElementById("subchunkSelector");
  subchunkIndex = selector.selectedIndex;
  localStorage.setItem("subchunkIndex", subchunkIndex);
  populateTable();
}

function populateColToggles() {
  const colToggles = document.getElementById("column-toggles");
  colToggles.innerHTML = "";
  columnList.forEach(e => {
    var visibilityName = "Visible" + e;
    var cachedVisibility = localStorage.getItem(visibilityName);
    if (cachedVisibility != undefined) {
      columnVisibility[e] = cachedVisibility == "true";
    } else {
      columnVisibility[e] = true;
    }

    let name = columnNames[e];
    if (name == undefined || name == "") {
      return;
    }
    let spanWrapper = document.createElement("li");
    let toggle = document.createElement("input");
    toggle.setAttribute("type", "checkbox");
    toggle.setAttribute("id", e);
    toggle.colName = e;
    toggle.checked = columnVisibility[e];

    toggle.addEventListener("click", () => {
      console.log(`updating checkbox ${e} to ${toggle.checked}`)
      columnVisibility[e] = toggle.checked;
      localStorage.setItem("Visible" + e, toggle.checked);
      populateTable();
    });
    let label = document.createElement("label");
    label.setAttribute("for", e);
    label.innerHTML = name;
    spanWrapper.appendChild(toggle);
    spanWrapper.appendChild(label);
    colToggles.appendChild(spanWrapper);
  });
}

function dropHandler(event) {
  event.preventDefault();
  console.log(event);
  console.log("drag detected");
  if (event.dataTransfer.items) {
    // Access only the first item dropped
    if (event.dataTransfer.items[0].kind === 'file') {
      var file = event.dataTransfer.items[0].getAsFile();
      console.log("Is a file");
      console.log(file.name);
      file.text().then(text => {
        document.getElementById("textarea").value = text;
        populateSelector();
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
  var jsonInput = document.getElementById("textarea").value;
  localStorage.setItem("jsonObj", jsonInput);
  populateSelector();
}

// Populates the table with what is currently in the global jsonObj variable
function populateTable() {
  const nameElement = document.getElementById("jsonName");
  nameElement.innerHTML = jsonObj.Name;

  const locElement = document.getElementById("locInfo");
  if (jsonObj.LocalizationDisabled) {
    locElement.innerHTML = "Localization DISABLED";
  }

  const table = document.getElementById("datatablebody");
  table.innerHTML = "";

  var subchunk = jsonObj.SubChunks[subchunkIndex];
  insertHeader();
  for (var j = 0; j < subchunk.Lines.length; j++) {
    var line = subchunk.Lines[j];
    let row = table.insertRow();
    row.setAttribute("class", "mdc-data-table__row");
    row.setAttribute("data-row-id", line.Id);
    insertRow(row, j);
  }

}

// Populates the text area with what is currenly in the global jsonObj variable
function populateTextArea() {
  var textbox = document.getElementById("textarea");
  var textToSet = JSON.stringify(jsonObj, null, 2);
  textbox.value = textToSet;
  localStorage.setItem("jsonObj", textToSet);
}

