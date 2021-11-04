const {Howl} = require('howler');

exports.setMetronomeTimeout = (bpm = 60, tact = {'tactNominator': 4, 'tactDenominator': 4}) => {
    bpmTimeout = (1 / bpm) * 60000;
    bpmTactMultiplier = (4) * (1 / tact['tactDenominator']);
    return bpmTimeout * bpmTactMultiplier;
}

exports.playBeat = (beatType = 'groundBeat') => {
    if (beatType === 'groundBeat') {
        var sound = new Howl({
            src: ['res/sounds/tick.wav']
        });
        sound.play();
    }
    else if (beatType === 'beat') {
        var sound = new Howl({
            src: ['res/sounds/tock.wav']
        });
        sound.play();
    }
}