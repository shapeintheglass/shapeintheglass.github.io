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

// Column order
const columnList = ["Actions", "LineId", "Clr", "Evt", "Txt", "Wgt", "Cool", "Spkr", "Trgt", "Dscr", "Snd", "Cmt", "Obj1", "Obj2", "Id", "Loc"];

const iconDupeSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M11,17H4A2,2 0 0,1 2,15V3A2,2 0 0,1 4,1H16V3H4V15H11V13L15,16L11,19V17M19,21V7H8V13H6V7A2,2 0 0,1 8,5H19A2,2 0 0,1 21,7V21A2,2 0 0,1 19,23H8A2,2 0 0,1 6,21V19H8V21H19Z" /></svg>`;
const iconAddRowAfterSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M22,10A2,2 0 0,1 20,12H4A2,2 0 0,1 2,10V3H4V5H8V3H10V5H14V3H16V5H20V3H22V10M4,10H8V7H4V10M10,10H14V7H10V10M20,10V7H16V10H20M11,14H13V17H16V19H13V22H11V19H8V17H11V14Z" /></svg>`;
const iconAddRowBeforeSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M22,14A2,2 0 0,0 20,12H4A2,2 0 0,0 2,14V21H4V19H8V21H10V19H14V21H16V19H20V21H22V14M4,14H8V17H4V14M10,14H14V17H10V14M20,14V17H16V14H20M11,10H13V7H16V5H13V2H11V5H8V7H11V10Z" /></svg>`;
const iconRemoveRowSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M9.41,13L12,15.59L14.59,13L16,14.41L13.41,17L16,19.59L14.59,21L12,18.41L9.41,21L8,19.59L10.59,17L8,14.41L9.41,13M22,9A2,2 0 0,1 20,11H4A2,2 0 0,1 2,9V6A2,2 0 0,1 4,4H20A2,2 0 0,1 22,6V9M4,9H8V6H4V9M10,9H14V6H10V9M16,9H20V6H16V9Z" /></svg>`;
const iconSortSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M18 21L14 17H17V7H14L18 3L22 7H19V17H22M2 19V17H12V19M2 13V11H9V13M2 7V5H6V7H2Z" /></svg>`;
const iconAddSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>`;
const iconRemoveSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M19,13H5V11H19V13Z" /></svg>`;

// Entry point for refreshing the import tab
function renderTableEditorTab() {
    renderSubchunkSelector();
}

function clearTableEditorTab() {
    document.getElementById(htmlIdTextAreaInput).value = "";
    document.getElementById(htmlIdTextAreaWrapperInput).classList.remove("is-dirty");
    setEditorSubchunkIndex(0);
    renderSubchunkSelector();
    renderTable();
}

function setEditorSubchunkIndex(subchunkIndex) {
    localStorage.setItem(localStorageTableSubchunkIndexKey, subchunkIndex);
}

function getEditorSubchunkIndex() {
    return localStorage.getItem(localStorageTableSubchunkIndexKey);
}

// Listener updating the current global subchunk index and cached subchunk index every time the selector is updated
function onSubchunkSelectorChanged() {
    let selector = document.getElementById(htmlIdSubchunkSelector);
    editorSubchunkIndex = selector.selectedIndex;
    setEditorSubchunkIndex(editorSubchunkIndex);
    renderTable();
}

// Populates the subchunk dropdown selector
function renderSubchunkSelector() {
    // Reset the current subchunk index if not defined
    let editorSubchunkIndex = getEditorSubchunkIndex();
    if (!jsonObj || !editorSubchunkIndex || editorSubchunkIndex < 0 || editorSubchunkIndex > jsonObj?.SubChunks.length) {
        setEditorSubchunkIndex(0);
    }

    let selector = document.getElementById(htmlIdSubchunkSelector);
    selector.innerHTML = "";

    if (!jsonObj?.SubChunks) {
        return;
    }

    for (let i = 0; i < jsonObj.SubChunks.length; i++) {
        let subchunk = jsonObj.SubChunks[i];
        let option = document.createElement("option");
        option.subchunkIndex = i;
        option.text = subchunk.Name;
        selector.add(option);
    }
    if (getEditorSubchunkIndex()) {
        selector.selectedIndex = getEditorSubchunkIndex();
    }
    onSubchunkSelectorChanged();
}

// Populates the table with what is currently in the global jsonObj variable
function renderTable() {
    const nameElement = document.getElementById(htmlIdTableName);
    nameElement.innerHTML = jsonObj?.Name ? jsonObj.Name : "";

    const locElement = document.getElementById(htmlIdTableLocInfo);
    if (jsonObj?.LocalizationDisabled) {
        locElement.innerHTML = "Localization DISABLED";
    } else {
        locElement.innerHTML = "";
    }

    const table = document.getElementById(htmlIdTableBody);
    table.innerHTML = "";

    if (jsonObj?.SubChunks) {
        insertHeader();
        let subchunk = jsonObj.SubChunks[getEditorSubchunkIndex()];
        for (let j = 0; j < subchunk?.Lines.length; j++) {
            insertRow(table, j);
        }
    }
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
    let subchunkIndex = getEditorSubchunkIndex();
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
    let subchunkIndex = getEditorSubchunkIndex();
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
    let subchunkIndex = getEditorSubchunkIndex();
    let cell = row.insertCell();
    cell.setAttribute("class", "mdl-data-table__cell--non-numeric");
    const input = document.createElement("input");
    let value = jsonObj.SubChunks[subchunkIndex].Lines[lineIndex]["Clr"];
    input.setAttribute("type", "color");
    input.value = value;
    input.addEventListener('change', input => {
        let value = input.target?.value;
        if (!value || value == "#000000") {
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
    let subchunkIndex = getEditorSubchunkIndex();
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
    input.value = value ? value : "";

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
    let headerRow = document.getElementById(htmlIdTableHeader);
    headerRow.innerHTML = "";
    if (!jsonObj.SubChunks || jsonObj.SubChunks.length == 0) {
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