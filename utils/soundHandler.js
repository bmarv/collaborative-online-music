const {Howl} = require('howler');

exports.playBeat = (beatType = 'groundBeat') => {
    if (beatType === 'groundBeat') {
        var sound = new Howl({
            src: ['res/metronomeSounds/tick.wav']
        });
        sound.play();
    }
    else if (beatType === 'beat') {
        var sound = new Howl({
            src: ['res/metronomeSounds/tock.wav']
        });
        sound.play();
    }
}

exports.playToneArrayWithTimeout = async ( toneArray , timeout = 1000) => {
    for (var tone of toneArray) {
        exports.playTone(String(tone));
        await new Promise(r => setTimeout(r, timeout));
    }
}

exports.playTone = ( tone ) => {
    toneCasted = String(tone).toLowerCase().trim();
    switch ( toneCasted ) {
        case 'c':
        case 'c4':
            var sound = new Howl({
                src: ['res/scale4Tones/c4.mp3']
            });
            sound.play();
            break;
        case 'c#':
        case 'c#4':
            var sound = new Howl({
                src: [escape('res/scale4Tones/c#4.mp3')]
            });
            sound.play();
            break;
        case 'd':
        case 'd4':
            var sound = new Howl({
                src: ['res/scale4Tones/d4.mp3']
            });
            sound.play();
            break;
        case 'd#':
        case 'd#4':
            var sound = new Howl({
                src: [escape('res/scale4Tones/d#4.mp3')]
            });
            sound.play();
            break;
        case 'e':
        case 'e4':
            var sound = new Howl({
                src: ['res/scale4Tones/e4.mp3']
            });
            sound.play();
            break;
        case 'e#':
        case 'f':
        case 'f4':
            var sound = new Howl({
                src: ['res/scale4Tones/f4.mp3']
            });
            sound.play();
            break;
        case 'f#':
        case 'f#4':
            var sound = new Howl({
                src: [escape('res/scale4Tones/f#4.mp3')]
            });
            sound.play();
            break;
        case 'g':
        case 'g4':
            var sound = new Howl({
                src: ['res/scale4Tones/g4.mp3']
            });
            sound.play();
            break;
        case 'g#':
        case 'g#4':
            var sound = new Howl({
                src: [escape('res/scale4Tones/g#4.mp3')]
            });
            sound.play();
            break;
        case 'a':
        case 'a4':
            var sound = new Howl({
                src: ['res/scale4Tones/a4.mp3']
            });
            sound.play();
            break;
        case 'a#':
        case 'a#4':
            var sound = new Howl({
                src: [escape('res/scale4Tones/a#4.mp3')]
            });
            sound.play();
            break;
        case 'b':
        case 'b4':
        case 'h':
        case 'h4':
            var sound = new Howl({
                src: ['res/scale4Tones/b4.mp3']
            });
            sound.play();
            break;
        case 'c3':
            var sound = new Howl({
                src: ['res/scale4Tones/c3.mp3']
            });
            sound.play();
            break;
        default:
            break;
    }
    return;
}