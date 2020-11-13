function getComplement(number) {
    if (parseInt(number) >= 0) {
        return number;
    }
    var binary = parseInt(number).toString(2)
    // Javascript can only do 32-bit bitwise operations,
    // we need to do this by hand
    var binaryFlipped = "1";
    for (var i = 1; i < binary.length; i++) {
        if (binary.charAt(i) == '0') {
            binaryFlipped += '1';
        } else {
            binaryFlipped += '0';
        }
    }

    return parseInt(binaryFlipped, 2) + 1
}

function onConvertClick() {
    var text = document.getElementById("input-toconvert").value;
    var output = document.getElementById("input-converted");
    var tokens = text.split('\n');
    var toShow = "";
    tokens.forEach(number => toShow += getComplement(number) + "\n");
    output.value = toShow;
}