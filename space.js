var bgSound = new Howl({
    src: ['https://shapeintheglass.github.io/wav/exterior_bg_track.wav'],
    loop: true,
    volume: 1.0,
});

var airlock = new Howl({
    src: ["https://shapeintheglass.github.io/wav/airlock.ogg"],
});
var mg_detected = new Howl({
    src: ["https://shapeintheglass.github.io/wav/microgravitydetected.wav"],
});
var foley01 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_01.wav'],
    volume: 1.0,
});
var foley02 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_02.wav'],
    volume: 1.0,
});
var foley03 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_03.wav'],
    volume: 1.0,
});
var foley05 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_05.wav'],
    volume: 1.0,
});
var foley06 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_06.wav'],
    volume: 1.0,
});
var foley07 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_07.wav'],
    volume: 1.0,
});
var foley08 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_08.wav'],
    volume: 1.0,
});
var foley09 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_09.wav'],
    volume: 1.0,
});
var foley10 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_10.wav'],
    volume: 1.0,
});
var foley11 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_11.wav'],
    volume: 1.0,
});
var foley12 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_12.wav'],
    volume: 1.0,
});
var foley13 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_13.wav'],
    volume: 1.0,
});
var foley14 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_14.wav'],
    volume: 1.0,
});
var foley15 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_15.wav'],
    volume: 1.0,
});
var foley16 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_16.wav'],
    volume: 1.0,
});
var foley17 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_17.wav'],
    volume: 1.0,
});
var foley18 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_18.wav'],
    volume: 1.0,
});
var foley19 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_19.wav'],
    volume: 1.0,
});
var foley20 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_20.wav'],
    volume: 1.0,
});

let foley = [foley01, foley02, foley03, foley05, foley06, foley07, foley08, foley09, foley10,
    foley11, foley12, foley13, foley14, foley15, foley16, foley17, foley18, foley19, foley20]


var isPlaying = false;
var currFoley = foley[0];
var prevFoleyIndex = -1;
var timeout = null;
var isFirst = true;

function onPlayClick() {
    if (!isPlaying) {
        if (isFirst) {
            isFirst = false;
            console.log("playing first time sound");
            mg_detected.play();
            airlock.play();
        }
        document.getElementById("playpause").innerHTML = "pause_circle_outline";
        console.log("playing sound!");
        //siriWave.start();
        bgSound.play();
        startFoley();
    } else {
        document.getElementById("playpause").innerHTML = "play_circle_outline";
        console.log("stopping sound!");
        //siriWave.stop();
        bgSound.stop();
        mg_detected.stop();
        airlock.stop();
        currFoley.stop();
        clearTimeout(timeout);
    }
    isPlaying = !isPlaying;
}

function startFoley() {
    var timeoutMs = 7000 + Math.floor(Math.random() * 10000);
    console.log("next one in " + timeoutMs + " ms");
    timeout = setTimeout(playFoley, timeoutMs);
}

function playFoley() {
    if (isPlaying) {
        var stereo = (Math.random() * 2) - 1;
        var index = Math.floor(Math.random() * 19);
        while (index == prevFoleyIndex) {
            index = Math.floor(Math.random() * 19);
        }
        prevFoleyIndex = index;
        console.log("playing foley " + index + " with panning " + stereo);
        currFoley = foley[index];
        currFoley.stereo(stereo);
        currFoley.play();
        var timeoutMs = 7000 + Math.floor(Math.random() * 10000);
        console.log("next one in " + timeoutMs + " ms");
        timeout = setTimeout(playFoley, timeoutMs);
    }
}
