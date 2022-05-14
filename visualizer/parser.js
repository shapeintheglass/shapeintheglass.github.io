'use strict';

var jsonObj;

function insertCell(row, subchunkIndex, lineIndex, fieldName) {
  let cell = row.insertCell();
  cell.setAttribute("class", "mdc-data-table__cell");
  const input = document.createElement("input");
  if (lineIndex == null) {
    input.value = jsonObj.SubChunks[subchunkIndex].Name;
  }
  else {
    input.value = jsonObj.SubChunks[subchunkIndex].Lines[lineIndex][fieldName];
  }

  input.type = "text";
  input.subchunkIndex = subchunkIndex;
  input.lineIndex = lineIndex;
  input.fieldName = fieldName;
  input.addEventListener('change', updateJsonListener);
  cell.appendChild(input);
}

function updateJsonListener() {
  console.log(this.value);
  console.log(this.subchunkIndex);
  console.log(this.lineIndex);
  console.log(this.fieldName);
  if (this.fieldName == null) {
    jsonObj.SubChunks[this.subchunkIndex].Name = this.value;
  }
  else {
    jsonObj.SubChunks[this.subchunkIndex].Lines[this.lineIndex][this.fieldName] = this.value;
  }
}

function insertRow(row, subchunkIndex, lineIndex) {
  insertCell(row, subchunkIndex);
  insertCell(row, subchunkIndex, lineIndex, "Evt");
  insertCell(row, subchunkIndex, lineIndex, "Txt");
  insertCell(row, subchunkIndex, lineIndex, "Spkr");
  insertCell(row, subchunkIndex, lineIndex, "Trgt");
  insertCell(row, subchunkIndex, lineIndex, "Id");
  insertCell(row, subchunkIndex, lineIndex, "Dscr");
  insertCell(row, subchunkIndex, lineIndex, "Snd");
  insertCell(row, subchunkIndex, lineIndex, "Cmt");
  insertCell(row, subchunkIndex, lineIndex, "Loc");
}

function populateTable() {
  var jsonInput = document.getElementById("textarea").value;
  jsonObj = JSON.parse(jsonInput);
  console.log(jsonObj);

  const table = document.getElementById("datatablebody");
  table.innerHTML = "";
  for (var i = 0; i < jsonObj.SubChunks.length; i++) {
    var subchunk = jsonObj.SubChunks[i];
    var subchunkName = subchunk.Name;

    for (var j = 0; j < subchunk.Lines.length; j++) {
      var line = subchunk.Lines[j];
      let row = table.insertRow();
      row.setAttribute("class", "mdc-data-table__row");
      row.setAttribute("data-row-id", line.Id);
      var rowValues = {};
      insertRow(row, i, j);
    }
  }
}

function populateTextArea() {
  console.log(jsonObj);
  var textbox = document.getElementById("textarea");
  textbox.innerHTML = JSON.stringify(jsonObj, null, 2);
}

