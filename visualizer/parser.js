'use strict';

var jsonObj;
var subchunkIndex;
var tags;
var columnVisibility = {};

// Column order
const columnList = ["Dupe", "AddAbove", "AddBelow", "Del", "LineId", "Clr", "Evt", "Txt", "Wgt", "Cool", "Spkr", "Trgt", "Dscr", "Snd", "Cmt", "Obj1", "Obj2", "Id", "Loc"];

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
  "Clr": "Color",
  "Wgt": "Weight",
  "Cool": "Cool"
};

const csvColumns = ["Spkr", "Trgt", "Dscr"];

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
  populateFilter();
  renderColToggles();
  renderSubchunkSelector();
}

// Loads JSON from the textarea and parses it into an object
function getJsonObjFromTextarea() {
  var jsonInput = document.getElementById("textarea").value;
  try {
    jsonObj = JSON.parse(jsonInput);
  } catch (e) {
    jsonObj = {};
    return;
  }

  if (subchunkIndex == undefined || subchunkIndex < 0 || subchunkIndex > jsonObj.SubChunks.length) {
    // Reset the current subchunk index
    subchunkIndex = 0;
  }

  // Run analytics
  analytics();
}

function getTagsFromCsv(csvStr) {
  if (csvStr == undefined) {
    return [];
  }
  return csvStr.split(',').map(e => {
    e = e.trim();
    if (e.startsWith("-")) {
      e = e.substr(1);
    }
    return e;
  });
}

function analytics() {
  let analyticsSubchunk = document.getElementById("analytics-num-subchunks");
  let analyticsLine = document.getElementById("analytics-num-lines");
  let analyticsTags = document.getElementById("analytics-num-tags");
  let analyticsAllTags = document.getElementById("analytics-all-tags");
  let numSubChunks = jsonObj.SubChunks.length;

  let numLines = 0;
  let tags = new Set();
  jsonObj.SubChunks.forEach(subchunk => {
    numLines += subchunk.Lines.length;
    subchunk.Lines.forEach(line => {
      let spkrTags = getTagsFromCsv(line['Spkr']);
      let trgtTags = getTagsFromCsv(line['Trgt']);
      spkrTags.forEach(tag => tags.add(tag));
      trgtTags.forEach(tag => tags.add(tag));
    });
  });
  analyticsSubchunk.innerHTML = numSubChunks;
  analyticsLine.innerHTML = numLines;
  analyticsTags.innerHTML = tags.size;
  let tagsArr = Array.from(tags);
  // Case insensitive sort shamelessly copied from stackoverflow
  tagsArr.sort(function (a, b) {
    if (a.toLowerCase() < b.toLowerCase()) return -1;
    if (a.toLowerCase() > b.toLowerCase()) return 1;
    return 0;
  });
  let tagsStr = "";
  tagsArr.forEach(tag => tagsStr += tag + "\n");
  analyticsAllTags.value = tagsStr;
}

//#region Cell operations

// Adds a cell to the header
function insertHeaderCell(row, name) {
  let cell = document.createElement("th");
  cell.setAttribute("style", "font-weight: bold;");
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
  cell.setAttribute("style", "text-align: center");
  cell.innerHTML = lineIndex;
}

// Inserts a special cell that duplicates the current row when clicked
function insertDuplicateCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.innerHTML = iconDupeSvg;
  cell.title = "Duplicate this row";
  cell.addEventListener('click', () => mutateTable(subchunkIndex, lineIndex, "Dupe"));
}

// Inserts a special cell that inserts a new row when clicked
function insertAddAboveCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.innerHTML = iconAddRowBeforeSvg;
  cell.title = "Add row above";
  cell.addEventListener('click', () => mutateTable(subchunkIndex, lineIndex, "AddAbove"));
}

// Inserts a special cell that inserts a new row when clicked
function insertAddBelowCell(row, lineIndex) {
  let cell = row.insertCell();
  cell.innerHTML = iconAddRowAfterSvg;
  cell.title = "Add row below";
  cell.addEventListener('click', () => mutateTable(subchunkIndex, lineIndex, "AddBelow"));
}

// Inserts a special cell that removes the current row when clicked
function insertRemoveCell(row, lineIndex) {
  let cell = row.insertCell();
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
      var dupeLine = JSON.parse(JSON.stringify(currLine));
      jsonObj.SubChunks[subchunkIndex].Lines.splice(lineIndex, 0, dupeLine);
      break;
  }
  renderTable();
}

// Inserts a checkbox cell
function insertCheckboxCell(row, lineIndex, getFromJsonObjHelper, updateJsonObjHelper) {
  let cell = row.insertCell();
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

    renderTable();
  });
  cell.appendChild(input);
}

// Inserts an editable cell
function insertEditableCell(row, lineIndex, fieldName) {
  let cell = row.insertCell();
  var labelWrapper = document.createElement("label");
  var spanResizer = document.createElement("span");
  var input = document.createElement("textarea");
  input.setAttribute("rows", 3);
  var value = jsonObj.SubChunks[subchunkIndex].Lines[lineIndex][fieldName];
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
  labelWrapper.appendChild(spanResizer);
  cell.appendChild(labelWrapper);
}

//#endregion

//#region Row operations

// Adds the table header
function insertHeader() {
  var headerRow = document.getElementById("headerrow");
  headerRow.innerHTML = "";
  if (jsonObj.SubChunks == undefined || jsonObj.SubChunks.length == 0) {
    return;
  }
  columnList.forEach(e => {
    if (columnVisibility[e]) {
      insertHeaderCell(headerRow, columnNames[e]);
    }
  });
}

// Populates a row in the table
function insertRow(table, lineIndex, useFilter = false) {
  if (useFilter && !shouldDrawRow(lineIndex)) {
    return;
  }
  let row = table.insertRow();
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

//#endregion

//#region Renderers

// Populates the subchunk dropdown selector
function renderSubchunkSelector() {
  getJsonObjFromTextarea();

  var selector = document.getElementById("subchunkSelector");
  selector.innerHTML = "";

  if (jsonObj.SubChunks == undefined) {
    return;
  }

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

function renderColToggles() {
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
      renderTable();
    });
    let label = document.createElement("label");
    label.setAttribute("for", e);
    label.innerHTML = name;
    spanWrapper.appendChild(toggle);
    spanWrapper.appendChild(label);
    colToggles.appendChild(spanWrapper);
  });
}

// Populates the table with what is currently in the global jsonObj variable
function renderTable(useFilter = false) {
  const nameElement = document.getElementById("jsonName");
  nameElement.innerHTML = jsonObj.Name != undefined ? jsonObj.Name : "";

  const locElement = document.getElementById("locInfo");
  if (jsonObj.LocalizationDisabled) {
    locElement.innerHTML = "Localization DISABLED";
  }

  const table = document.getElementById("datatablebody");
  table.innerHTML = "";

  insertHeader();
  if (jsonObj.SubChunks == undefined || jsonObj.SubChunks.length == 0) {
    return;
  }
  var subchunk = jsonObj.SubChunks[subchunkIndex];
  for (var j = 0; j < subchunk.Lines.length; j++) {
    insertRow(table, j, useFilter);
  }

}

//#endregion

//#region Filters

function populateFilter() {
  let filterColumn = document.getElementById("filter-column");
  let filterOperation = document.getElementById("filter-operation");
  let filterTerms = document.getElementById("filter-terms");

  filterColumn.innerHTML = "";
  columnList.forEach(e => {
    let text = columnNames[e];
    if (text == undefined || text == "") {
      return;
    }
    var option = document.createElement("option");
    option.text = text;
    option.setAttribute("value", e)
    filterColumn.add(option);
  });

  if (localStorage.getItem("filterColumn") != undefined) {
    filterColumn.value = localStorage.getItem("filterColumn");
  } else {
    filterColumn.selectedIndex = -1;
  }

  if (localStorage.getItem("filterOperation") != undefined) {
    filterOperation.value = localStorage.getItem("filterOperation");
  } else {
    filterOperation.selectedIndex = -1;
  }

  if (localStorage.getItem("filterTerms") != undefined) {
    filterTerms.value = localStorage.getItem("filterTerms");
  } else {
    filterTerms.value = "";
  }
}

function filterListener() {
  let filterColumn = document.getElementById("filter-column");
  let filterOperation = document.getElementById("filter-operation");
  let filterTerms = document.getElementById("filter-terms");

  localStorage.setItem("filterColumn", filterColumn.value);
  localStorage.setItem("filterOperation", filterOperation.value);
  localStorage.setItem("filterTerms", filterTerms.value);

  renderTable(true);
}

function filterClear() {
  let filterColumn = document.getElementById("filter-column");
  let filterOperation = document.getElementById("filter-operation");
  let filterTerms = document.getElementById("filter-terms");

  filterColumn.selectedIndex = -1;
  filterOperation.selectedIndex = -1;
  filterTerms.value = "";

  filterListener();
}

function shouldDrawRow(lineIndex) {
  let filterColumn = document.getElementById("filter-column").value;
  let filterOperation = document.getElementById("filter-operation").value;
  let filterTerms = document.getElementById("filter-terms").value.toLowerCase();

  if (filterColumn == "" || filterOperation == "") {
    return true;
  }

  let field = jsonObj.SubChunks[subchunkIndex].Lines[lineIndex][filterColumn];
  if (field == undefined) {
    return false;
  }
  field = field.toLowerCase();
  switch (filterOperation) {
    case "is":
      if (csvColumns.includes(filterColumn)) {
        return matchCsv(field, filterTerms);
      }
      return field.includes(filterTerms);
    case "is-not":
      if (csvColumns.includes(filterColumn)) {
        return !matchCsv(field, filterTerms);
      }
      return !field.includes(filterTerms);
    default:
      return true;
  }
}

function matchCsv(csvValue, term) {
  return csvValue.split(',').map(e => e.trim()).includes(term);
}

//#endregion

//#region Handlers/Listeners 

// Handles drag & drop events on the textarea
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
  var jsonInput = document.getElementById("textarea").value;
  localStorage.setItem("jsonObj", jsonInput);
  subchunkIndex = 0;
  renderSubchunkSelector();
}

// Populates the text area with what is currenly in the global jsonObj variable
function populateTextArea() {
  var textbox = document.getElementById("textarea");
  var textToSet = JSON.stringify(jsonObj, null, 2);
  textbox.value = textToSet;
  localStorage.setItem("jsonObj", textToSet);
}

function clearAll() {
  console.log("clearing");
  localStorage.clear();
  jsonObj = {};
  document.getElementById("textarea").value = "";
  renderSubchunkSelector();
  renderTable();
  renderColToggles();
  populateFilter();
}

// Listener updating the current global subchunk index and cached subchunk index every time the selector is updated
function selectorListener() {
  var selector = document.getElementById("subchunkSelector");
  subchunkIndex = selector.selectedIndex;
  localStorage.setItem("subchunkIndex", subchunkIndex);
  renderTable();
}

//#endregion