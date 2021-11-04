const {Howl} = require('howler');

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