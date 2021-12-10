const soundHandler = require('./soundHandler');

exports.setMetronomeTimeout = (bpm = 60, tact = {'tactNominator': 4, 'tactDenominator': 4}) => {
    bpmTimeout = (1 / bpm) * 60000;
    bpmTactMultiplier = (4) * (1 / tact['tactDenominator']);
    return bpmTimeout * bpmTactMultiplier;
}

exports.runOneMetronomeIteration = async (metronomeTimeout, tact = {'tactNominator': 4, 'tactDenominator': 4}, clockTicks = 0, soundActive = True, bubbleElementsArray = []) => {
    await new Promise(r => setTimeout(r, metronomeTimeout));
    if (Number.isInteger(clockTicks / tact['tactNominator'])) {
        if (soundActive)    soundHandler.playBeat(beatType = 'groundBeat');
    }
    else {
        if (soundActive)    soundHandler.playBeat(beatType = 'beat');
    }
    const activeBubbleElementIndex = clockTicks % tact['tactNominator'];
    const inactiveBubbleElementIndex = activeBubbleElementIndex === 0 ? (tact['tactNominator'] -1) : ((clockTicks -1) % tact['tactNominator']);
    bubbleElementsArray[activeBubbleElementIndex].className = 'dot-active';
    bubbleElementsArray[inactiveBubbleElementIndex].className = 'dot';
    return clockTicks += 1
}
