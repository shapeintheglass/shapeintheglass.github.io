'use strict';

var jsonObj;
var subchunkIndex;
const columnList = ["Dupe", "AddBelow", "AddAbove", "Del", "LineId", "Evt", "Txt", "Spkr", "Trgt", "Id", "Dscr", "Snd", "Cmt", "Loc", "Obj1", "Obj2", "Clr"];

const iconDupeSvg = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M11,17H4A2,2 0 0,1 2,15V3A2,2 0 0,1 4,1H16V3H4V15H11V13L15,16L11,19V17M19,21V7H8V13H6V7A2,2 0 0,1 8,5H19A2,2 0 0,1 21,7V21A2,2 0 0,1 19,23H8A2,2 0 0,1 6,21V19H8V21H19Z" /></svg>`;
const iconAddRowAfterSvg = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M22,10A2,2 0 0,1 20,12H4A2,2 0 0,1 2,10V3H4V5H8V3H10V5H14V3H16V5H20V3H22V10M4,10H8V7H4V10M10,10H14V7H10V10M20,10V7H16V10H20M11,14H13V17H16V19H13V22H11V19H8V17H11V14Z" /></svg>`;
const iconAddRowBeforeSvg = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M22,14A2,2 0 0,0 20,12H4A2,2 0 0,0 2,14V21H4V19H8V21H10V19H14V21H16V19H20V21H22V14M4,14H8V17H4V14M10,14H14V17H10V14M20,14V17H16V14H20M11,10H13V7H16V5H13V2H11V5H8V7H11V10Z" /></svg>`;
const iconRemoveRowSvg = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M9.41,13L12,15.59L14.59,13L16,14.41L13.41,17L16,19.59L14.59,21L12,18.41L9.41,21L8,19.59L10.59,17L8,14.41L9.41,13M22,9A2,2 0 0,1 20,11H4A2,2 0 0,1 2,9V6A2,2 0 0,1 4,4H20A2,2 0 0,1 22,6V9M4,9H8V6H4V9M10,9H14V6H10V9M16,9H20V6H16V9Z" /></svg>`;
const iconSortSvg = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M18 21L14 17H17V7H14L18 3L22 7H19V17H22M2 19V17H12V19M2 13V11H9V13M2 7V5H6V7H2Z" /></svg>`;

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
  if (isJsonString(cached)) {
    populateSelector();
  }
}

var columnNames = {
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
  "Id": "ID",
  "Dscr": "Actions",
  "Snd": "Sound",
  "Cmt": "Comment",
  "Loc": "Localize",
  "Clr": "Color"
};

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

function insertHeader() {
  var headerRow = document.getElementById("headerrow");
  columnList.forEach(e => {
    insertHeaderCell(headerRow, columnNames[e]);
  });
}

// Inserts a special cell that contains the index of the current line
function insertLineIdCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");
  cell.innerHTML = lineIndex;
}

// Inserts a special cell that duplicates the current row when clicked
function insertDuplicateCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");
  cell.innerHTML = iconDupeSvg;
  cell.subchunkIndex = subchunkIndex;
  cell.lineIndex = lineIndex;
  cell.title = "Duplicate this row";
  cell.addEventListener('click', duplicateRowListener);
}

function duplicateRowListener() {
  console.log(`duplicating line at subchunk index ${this.subchunkIndex}, line ${this.lineIndex}`);
  var currLine = jsonObj.SubChunks[this.subchunkIndex].Lines[this.lineIndex];
  jsonObj.SubChunks[this.subchunkIndex].Lines.splice(this.lineIndex, 0, currLine);
  populateTable();
}


// Inserts a special cell that inserts a new row when clicked
function insertAddAboveCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");
  cell.innerHTML = iconAddRowBeforeSvg;
  cell.subchunkIndex = subchunkIndex;
  cell.lineIndex = lineIndex;
  cell.title = "Add row above";
  cell.addEventListener('click', addAboveRowListener);
}

function addAboveRowListener() {
  console.log(`adding line at subchunk index ${this.subchunkIndex}, line ${this.lineIndex}`);
  jsonObj.SubChunks[this.subchunkIndex].Lines.splice(this.lineIndex, 0, {});
  populateTable();
}

// Inserts a special cell that inserts a new row when clicked
function insertAddBelowCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");
  cell.innerHTML = iconAddRowAfterSvg;
  cell.subchunkIndex = subchunkIndex;
  cell.lineIndex = lineIndex;
  cell.title = "Add row below";
  cell.addEventListener('click', addBelowRowListener);
}

function addBelowRowListener() {
  console.log(`adding line at subchunk index ${this.subchunkIndex}, line ${this.lineIndex}`);
  jsonObj.SubChunks[this.subchunkIndex].Lines.splice(this.lineIndex + 1, 0, {});
  populateTable();
}

// Inserts a special cell that removes the current row when clicked
function insertRemoveCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");
  cell.innerHTML = iconRemoveRowSvg;
  cell.subchunkIndex = subchunkIndex;
  cell.lineIndex = lineIndex;
  cell.title = "Delete row";
  cell.addEventListener('click', removeRowListener);
}

// Listener for removing a cell
function removeRowListener() {
  console.log(`removing line at subchunk index ${this.subchunkIndex}, line ${this.lineIndex}`);
  jsonObj.SubChunks[this.subchunkIndex].Lines.splice(this.lineIndex, 1);
  populateTable();
}

// Inserts an editable cell
function insertCell(row, lineIndex, fieldName) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");
  const input = document.createElement("textarea");
  var value = jsonObj.SubChunks[subchunkIndex].Lines[lineIndex][fieldName];
  input.value = value == undefined ? "" : value;

  //input.type = "text";
  input.subchunkIndex = subchunkIndex;
  input.lineIndex = lineIndex;
  input.fieldName = fieldName;
  if (fieldName == "Evt" || fieldName == "Trgt" || fieldName == "Spkr") {
    input.style = "width:300px";
  }
  if (fieldName == "Loc") {
    input.style = "width:25px";
  }
  if (fieldName == "Txt" || fieldName == "Cmt") {
    input.style = "width:500px";
  }
  input.addEventListener('change', updateJsonListener);
  cell.appendChild(input);
}

// Listener for updating the underlying json field when an editable cell is changed
function updateJsonListener() {
  console.log(`updating subchunk index ${this.subchunkIndex}, line index ${this.lineIndex}, field name ${this.fieldName} to ${this.value}`);
  // Delete the field from the JSON if the cell is cleared
  if (this.value == "" || this.value == "undefined") {
    delete jsonObj.SubChunks[this.subchunkIndex].Lines[this.lineIndex][this.fieldName];
  }
  else {
    jsonObj.SubChunks[this.subchunkIndex].Lines[this.lineIndex][this.fieldName] = this.value;
  }
}

// Listener for updating the cache every time the textarea is changed
function textareaListener() {
  console.log("updating cache")
  var jsonInput = document.getElementById("textarea").value;
  localStorage.setItem("jsonObj", jsonInput);
}

// Populates a row
function insertRow(row, lineIndex) {
  columnList.forEach(e => {
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
      default:
        insertCell(row, lineIndex, e);
    }
  });
}

// Loads JSON from the textarea and parses it into an object
function loadJsonObj() {
  var jsonInput = document.getElementById("textarea").value;
  jsonObj = JSON.parse(jsonInput);
  // Reset the current subchunk index
  subchunkIndex = 0;
  console.log("loaded json");
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

// Populates the table with what is currently in the global jsonObj variable
function populateTable() {
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
  var textToSet = JSON.stringify(jsonObj, null, 2)
  textbox.value = textToSet;
  localStorage.setItem("jsonObj", textToSet);
}

