exports.startMetronome = async (bpm = 60, tact = {'tactNominator': 4, 'tactDenominator': 4}) => {
    bpmTimeout = (1 / bpm) * 60000;
    bpmTactMultiplier = (4) * (1 / tact['tactDenominator'])
    metronomeTimeout =  bpmTimeout * bpmTactMultiplier
    for (var clockTicks = 0; clockTicks < 100; clockTicks += 1){
        await new Promise(r => setTimeout(r, metronomeTimeout));
        if (Number.isInteger(clockTicks / tact['tactNominator'])) {
            console.log('TACK');
        }
        else console.log('\ttick');
    }
}