'use strict';

const e = React.createElement;

class ParseButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    //if (this.state.liked) {
    //  return 'You liked this.';
    //}

    return e(
      'button',
      { onClick: () => 
        parseJson()
      },
      'Parse'
    );
  }
}

function visualizeJson(jsonObj)
{
  var toPrint = "";

  toPrint += "<h1>";
  toPrint += jsonObj.Name;
  toPrint += "</h1>";
  for (var i = 0; i < jsonObj.SubChunks.length; i++) {
    var subchunk = jsonObj.SubChunks[i];
    toPrint += "<h2>"
    toPrint += subchunk.Name;
    toPrint += "</h2><br>";
    
    for (var j = 0; j < subchunk.Lines.length; j++) {
      var line = subchunk.Lines[j];
      toPrint += String(line.Spkr).toUpperCase() + "<br>";
      toPrint += line.Txt;
      toPrint += "<br><br>";
    }
  }
  
  return toPrint;
}

function parseJson() {
  var  jsonInput = document.getElementById("textarea").value;
  
  var jsonObj = JSON.parse(jsonInput);
  
  var toPrint = visualizeJson(jsonObj);

  document.getElementById("output").innerHTML = toPrint;
}

const domContainer = document.querySelector('#button_container');
const root = ReactDOM.createRoot(domContainer);
root.render(e(ParseButton));