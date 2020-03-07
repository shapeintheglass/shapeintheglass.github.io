var sound = new Howl({
    src: ['https://shapeintheglass.github.io/wav/exterior_bg_track.ogg'],
    loop: true,
    volume: 1.0,
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
var foley04 = new Howl({
    src: ['https://shapeintheglass.github.io/wav/amb_04.wav'],
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

let foley = [foley01, foley02, foley03, foley04, foley05, foley06, foley07, foley08, foley09, foley10,
    foley11, foley12, foley13, foley14, foley15, foley16, foley17, foley18, foley19, foley20]


var isPlaying = false;

function onPlayClick() {
    if (!isPlaying) {
        console.log("playing sound!");
        sound.play();
        var timeout = 5000 + Math.floor(Math.random() * 10000);
        console.log("next one in " + timeout + " ms");
        setTimeout(playFoley, timeout);
    } else {
        console.log("stopping sound!");
        sound.pause();
    }
    isPlaying = !isPlaying;
}

function playFoley() {
    if (isPlaying) {
        var index = Math.floor(Math.random() * 20);
        console.log("playing foley " + index)
        foley[index].play();
        var timeout = 5000 + Math.floor(Math.random() * 10000);
        console.log("next one in " + timeout + " ms");
        setTimeout(playFoley, timeout);
    }
}
