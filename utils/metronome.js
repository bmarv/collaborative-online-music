const soundPlay = require('sound-play');

exports.startMetronome = async (bpm = 60, tact = {'tactNominator': 4, 'tactDenominator': 4}, audio = true) => {
    bpmTimeout = (1 / bpm) * 60000;
    bpmTactMultiplier = (4) * (1 / tact['tactDenominator'])
    metronomeTimeout =  bpmTimeout * bpmTactMultiplier
    for (var clockTicks = 0; clockTicks < 100; clockTicks += 1){
        await new Promise(r => setTimeout(r, metronomeTimeout));
        if (Number.isInteger(clockTicks / tact['tactNominator'])) {
            console.log('TICK');
            if (audio)      exports.playBeat(beatType = 'groundBeat');
        }
        else {
            console.log('\ttock');
            if (audio)    exports.playBeat(beatType = 'beat');
        } 
    }
}

exports.playBeat = (beatType = 'groundBeat') => {
    if (beatType === 'groundBeat') {
        soundPlay.play('res/sounds/tick.wav');
    }
    else if (beatType === 'beat') {
        soundPlay.play('res/sounds/tock.wav');
    }
}