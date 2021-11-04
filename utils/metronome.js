const {Howl} = require('howler');

exports.setMetronomeTimeout = (bpm = 60, tact = {'tactNominator': 4, 'tactDenominator': 4}) => {
    bpmTimeout = (1 / bpm) * 60000;
    bpmTactMultiplier = (4) * (1 / tact['tactDenominator']);
    return bpmTimeout * bpmTactMultiplier;
}

exports.runOneMetronomeIteration = async (metronomeTimeout, tact = {'tactNominator': 4, 'tactDenominator': 4}, clockTicks = 0, soundActive = True, bubbleElementsArray = []) => {
    await new Promise(r => setTimeout(r, metronomeTimeout));
    if (Number.isInteger(clockTicks / tact['tactNominator'])) {
        if (soundActive)    exports.playBeat(beatType = 'groundBeat');
    }
    else {
        if (soundActive)    exports.playBeat(beatType = 'beat');
    }
    const activeBubbleElementIndex = clockTicks % tact['tactNominator'];
    const inactiveBubbleElementIndex = activeBubbleElementIndex === 0 ? (tact['tactNominator'] -1) : ((clockTicks -1) % tact['tactNominator']);
    bubbleElementsArray[activeBubbleElementIndex].className = 'dot-active';
    bubbleElementsArray[inactiveBubbleElementIndex].className = 'dot';
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