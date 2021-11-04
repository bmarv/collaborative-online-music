const {Howl} = require('howler');

exports.setMetronomeTimeout = (bpm = 60, tact = {'tactNominator': 4, 'tactDenominator': 4}) => {
    bpmTimeout = (1 / bpm) * 60000;
    bpmTactMultiplier = (4) * (1 / tact['tactDenominator']);
    return bpmTimeout * bpmTactMultiplier;
}

exports.runOneMetronomeIteration = async (metronomeTimeout, tact = {'tactNominator': 4, 'tactDenominator': 4}, clockTicks = 0) => {
    await new Promise(r => setTimeout(r, metronomeTimeout));
    if (Number.isInteger(clockTicks / tact['tactNominator'])) {
        console.log('TICK');
        exports.playBeat(beatType = 'groundBeat');
    }
    else {
        console.log('\ttock');
        exports.playBeat(beatType = 'beat');
    }
    return clockTicks += 1
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