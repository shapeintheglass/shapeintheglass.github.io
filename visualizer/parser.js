'use strict';

const e = React.createElement;

function insertCell(row, value)
{
  let cell = row.insertCell();
  cell.innerHTML = value;
  cell.setAttribute("class", "mdc-data-table__cell");
}

function populateTable(jsonObj)
{
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
      insertCell(row, subchunkName);
      insertCell(row, line.Evt);
      insertCell(row, line.Txt);
      insertCell(row, line.Spkr);
      insertCell(row, line.Trgt);
      insertCell(row, line.Id);
      insertCell(row, line.Dscr);
      insertCell(row, line.Snd);
      insertCell(row, line.Cmt);
      insertCell(row, line.Loc);
    }
  }
}

function parseJson() {
  var jsonInput = document.getElementById("textarea").value;
  var jsonObj = JSON.parse(jsonInput);
  populateTable(jsonObj);
}
