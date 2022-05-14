'use strict';

var jsonObj;
var subchunkIndex;

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

// Inserts a special cell that duplicates the current row when clicked
function insertDuplicateCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");
  cell.innerHTML = "Duplicate";
  cell.subchunkIndex = subchunkIndex;
  cell.lineIndex = lineIndex;
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
  cell.innerHTML = "Insert Above";
  cell.subchunkIndex = subchunkIndex;
  cell.lineIndex = lineIndex;
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
  cell.innerHTML = "Insert Below";
  cell.subchunkIndex = subchunkIndex;
  cell.lineIndex = lineIndex;
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
  cell.innerHTML = "Remove";
  cell.subchunkIndex = subchunkIndex;
  cell.lineIndex = lineIndex;
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
  const input = document.createElement("input");
  var value = jsonObj.SubChunks[subchunkIndex].Lines[lineIndex][fieldName];
  input.value = value == undefined ? "" : value;

  input.type = "text";
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
    input.style = "width:1000px";
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
  insertDuplicateCell(row, lineIndex);
  insertAddAboveCell(row, lineIndex);
  insertAddBelowCell(row, lineIndex);
  insertRemoveCell(row, lineIndex);
  insertCell(row, lineIndex, "Evt");
  insertCell(row, lineIndex, "Txt");
  insertCell(row, lineIndex, "Spkr");
  insertCell(row, lineIndex, "Trgt");
  insertCell(row, lineIndex, "Id");
  insertCell(row, lineIndex, "Dscr");
  insertCell(row, lineIndex, "Snd");
  insertCell(row, lineIndex, "Cmt");
  insertCell(row, lineIndex, "Loc");
}

// Loads JSON from the textarea and parses it into an object
function loadJsonObj() {
  var jsonInput = document.getElementById("textarea").value;
  jsonObj = JSON.parse(jsonInput);
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

