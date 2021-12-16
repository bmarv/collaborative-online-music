const execSync = require('child_process').execSync;
const path = require('path');
const fs = require('fs');

const helper = require('./helper');
const fileHandler = require('./fileHandler');

exports.createDirectoryWithTimeStamp = (directoryName, baseDirectory = 'output') => {
    const dateTime = helper.getDateTimeString();
    const directoryNameWTimeStamp = `${directoryName}_${dateTime}`;
    const directoryPath = path.join(process.env.PWD, baseDirectory, directoryNameWTimeStamp);
    fs.mkdirSync(directoryPath, { recursive: true} );
    return directoryPath;
}


exports.prepareVideoFilesAndCreateMergingCommandSync = (inputDirectory = 'output', outputResolution = '480') => {
    const outputContent = fs.readdirSync(
        path.join(process.env.PWD, inputDirectory), 
        { withFileTypes: true } 
    );
    let rawVideosArray = [];
    outputContent.forEach( file => {
        const filePath = path.join(process.env.PWD, inputDirectory, file.name);
        if ((! fs.statSync(filePath).isDirectory()) && ((path.extname(filePath) === ('.mp4')) || (path.extname(filePath) === ('.webm')))) {
            rawVideosArray.push(filePath);
        }
    });

    // equating resolution
    const croppedVideosArray = exports.cropVideosResolutionSync(
        inputVideosArray = rawVideosArray,
        outputResolution = outputResolution
    );

    console.log(`CROPPED VIDEOS ARRAY: ${croppedVideosArray}`)

    // height and width values
    const heightAndWidthObject = exports.getHeightAndWidthOfParticipants( size= croppedVideosArray.length);
    
    // command for merging videos
    outputFile = String(path.join(
        process.env.PWD,
        inputDirectory,
        `merged_video__${helper.getDateTimeString()}.mp4`
    ));

    const mergeVideoTilesCommand = exports.createMergeVideoTilesCommand(
        inputVideosArray = croppedVideosArray,
        maxHeight = heightAndWidthObject['height'],
        maxWidth = heightAndWidthObject['width'],
        outputFile = outputFile
    );

    return {
        'command': mergeVideoTilesCommand,
        'inputVideosArray': inputVideosArray,
        'maxHeight': maxHeight,
        'maxWidth': maxWidth,
        'output': outputFile
    };
}

/**
 * equate all input-sources pixel-sizes to the same height and width
 * by cropping the video-outputs
 * FFMPEG needs to be installed on the system
 * 
 * COMMAND for one input:
 * ffmpeg 
 * -i inputFile 
 * -filter:v crop=480:480 
 * outputFile
 * 
 * @param {String Input of Videos} inputVideosArray 
 * @returns Array of Output-Videos
 */
exports.cropVideosResolutionSync = (inputVideosArray = [], outputResolution = 480) => {
    // creating a new directory
    directoryPath = exports.createDirectoryWithTimeStamp('video_prep');

    let videoPrepFileArray = []
    for (let index = 0; index < inputVideosArray.length; index += 1) {
        const outputFile = path.join(
            directoryPath,
            `${outputResolution}p_${
                path.basename(inputVideosArray[index])
            }`
        );
        
        const ffmpegCommand = `ffmpeg -i ${inputVideosArray[index]} -filter:v crop=480:480 ${outputFile}`;

        exports.executeSyncFFMPEGCommand(ffmpegCommand);

        videoPrepFileArray.push(outputFile);
    }
    return videoPrepFileArray;
}

/**
 * @param {number of Participants} size 
 * @returns Object for Integer height and width
 * 
 * calculating height and widht for participants the using following heuristics:
 *  ==> use a quadratic alignment whenever possible
 *  ==> if quadratic alignment is visually inefficient:
 *      grow in width
 *  ___
 *  if sqrt(n) === Integer: height = sqrt(n), width = sqrt(n)
 *  else:
 *      nFullRectangle = floor(sqrt(n)) * floor(sqrt(n)) + 1
 *      if n <= nFullRectangle: height = floor(sqrt(n)), width = floor(sqrt(n)) + 1
 *      else: height = floor(sqrt(n)) + 1, width = floor(sqrt(n)) + 1
 *      
 */
exports.getHeightAndWidthOfParticipants = (size) => {
    const sqrtSize = Math.sqrt(size);
    if (Number.isInteger(sqrtSize)){
        height = sqrtSize;
        width = sqrtSize;
    }
    else {
        nFullRectangle = Math.floor(sqrtSize) * (Math.floor(sqrtSize) + 1);
        if (size <= nFullRectangle){
            height = Math.floor(sqrtSize);
            width = Math.floor(sqrtSize) + 1;
        }
        else {
            height = Math.floor(sqrtSize) + 1;
            width = Math.floor(sqrtSize) + 1;
        }
    }
    return {
        'height': height,
        'width': width
    }
}


// TODO: merge files and save 
/**
 * Merging Input Video-Files to one Output-File by following 
 * the predefined ordering for height and width steps
 * 
 * ffmpeg: height and width definition
 *      x-axis := w, y-axis := h
 *      coordinate origin: 0_0
 *      1 * x-axis-step: w0 := 0_0 + 1 * x-axis-step
 *      i * x-axis-step: w0+w1+..+wi
 *      y-axis-steps analog
 *  
 * ordering videos to height and width:
 *      for widthStep in width.length
 *          for heightStep in height.length
 *              if videoElement existent
 *                  videoOrder: w_widthStep_|h_heightStep_
 * 
 * COMMAND f. 5 input sources:
 * ffmpeg 
 * -i ef7e78a6-15c3-4784-b958-807f24e0bd00_05_11_2021,\ 15_01_26.mp4 -i f86b630f-8ce3-49de-9d43-51bfd9eae69f_05_11_2021,\ 15_01_26.mp4 -i fcb24433-72c0-4a84-b4f6-223661d12d5b_05_11_2021,\ 15_01_26.mp4 -i 13e40d05-e31c-41d0-ac13-36704914c8d7___05_11_2021,\ 15_47_09.mp4 -i 94afcf4f-fd3a-4a76-b710-120398da0170___05_11_2021,\ 16_56_52.mp4 
 * -filter_complex "[0:v][1:v][2:v][3:v][4:v]xstack=inputs=5:layout=0_0|0_h0|w0_0|w0_h0|w0+w1_0[v];
 * amix=inputs=5:duration=longest:dropout_transition=5" 
 * -map "[v]" output_xstack_n_5.mp4
 * 
 */
exports.createMergeVideoTilesCommand = (inputVideosArray = [], maxHeight, maxWidth, outputFile) => {
    let ffmpegInputCommand = 'ffmpeg';
    for (let inputVideoIndex = 0; inputVideoIndex < inputVideosArray.length; inputVideoIndex += 1) {
        ffmpegInputCommand += ` -i \"${inputVideosArray[inputVideoIndex]}\"`;
    }
    const filterInputCommand = exports.getFilterInputCommand(inputVideosArray.length);
    const layoutCommand = exports.getVideoLayoutCommand(inputVideosArray, maxHeight, maxWidth);
    const ffmpegFilterCommand = `-filter_complex \"${filterInputCommand}xstack=inputs=${inputVideosArray.length}:layout=${layoutCommand}[v]; amix=inputs=${inputVideosArray.length}:duration=longest:dropout_transition=${inputVideosArray.length}\"`;
    const ffmpegMapCommand = `-map \"[v]\"`;
    const ffmpegCommand = `${ffmpegInputCommand} ${ffmpegFilterCommand} ${ffmpegMapCommand} ${outputFile}`;
    return ffmpegCommand;
}

exports.executeSyncFFMPEGCommand = (ffmpegCommand) => {
    console.log('FFMPEG COMMAND: ', ffmpegCommand);
    const output = execSync(`ffmpegCmd=\'${ffmpegCommand}\'; bash <<< \"$ffmpegCmd\"`, { shell: '/bin/bash' });
    return output;
}

exports.getFilterInputCommand = (inputSize) => {
    let filterInputCommand = '';
    for (let index = 0; index < inputSize; index += 1) {
        filterInputCommand += `[${index}:v]`
    }
    return filterInputCommand;
}


exports.getVideoLayoutCommand = (inputVideosArray = [], maxHeight, maxWidth) => {
    let videoTileIndex = 0;
    let layoutCommand = '';
    for (let widthStep = 0; widthStep < maxWidth; widthStep += 1) {
        for (let heightStep = 0; heightStep < maxHeight; heightStep += 1){
            if (videoTileIndex < inputVideosArray.length) {
                let widthCommand = '';
                let heightCommand = '';
                if (widthStep === 0) { widthCommand = '0'; }
                if (heightStep === 0) { heightCommand = '0'; }
                if (widthStep !== 0) {
                    for (let widthStepCommandIndex = 1; widthStepCommandIndex <= widthStep; widthStepCommandIndex += 1) {
                        widthCommand += `+w${widthStepCommandIndex - 1}`;
                    }
                    widthCommand = widthCommand.substring(1); // remove first '+'-character from command
                }
                if (heightStep !== 0) {

                    
                    for (let heightStepCommandIndex = 1; heightStepCommandIndex <= heightStep; heightStepCommandIndex += 1) {
                        heightCommand += `+h${heightStepCommandIndex - 1}`;
                    }
                    heightCommand = heightCommand.substring(1);
                }
                const tileLayoutCommand = `${widthCommand}_${heightCommand}`;
                layoutCommand += `|${tileLayoutCommand}`;
                videoTileIndex += 1;
            }
        }
    }
    layoutCommand = layoutCommand.substring(1); //removing the first '|' char
    return layoutCommand
}

exports.applyPreparationForMergingStrategyAndRebuildFFMPEGCommandSync = (
    inputDirectory,
    inputVideosArray,
    mergingStrategy,
    maxHeight,
    maxWidth,
    outputFile,
) => {
    let cuttedVideosArray = [];
    if (mergingStrategy === 'Audio Peak') {
        cuttedVideosArray= exports.cutVideosByAudioPeakSync(inputDirectory, inputVideosArray);
    } else {
        cuttedVideosArray = exports.cutVideosByTimestampSync(inputDirectory, inputVideosArray, mergingStrategy);
    }
    const ffmpegCommandRebuild = exports.createMergeVideoTilesCommand(
        inputVideosArray = cuttedVideosArray,
        maxHeight = maxHeight,
        maxWidth = maxWidth,
        outputFile = outputFile
    );
    return ffmpegCommandRebuild;
}


/** Client Timestamp Normalization
 * cutting of the beginning of video data from clients using ffmpeg 
 * to dissolve different video length due to different performance
 * of different client types
 *
 * ====prepareVideoFilesAndCreateMergingCommand(... mergingStrategy = clientTimestampNormalization)===
 * ==> ...prepare videos with getting videos, cropping the resolution
 * 
 *  *   create cutted video directory
 *  *   for every client video: 
 *      *   get json-content with timestamp- metainformations with:
 *      *   compute timeframe to be cutted off 
 *          between broadcast start and metronome start (or Counting In Stopped)
 *          milliseconds = new Date(jsonData['Metronome Start']).valueOf() - new Date(jsonData['Recording Start']).valueOf()
 *      *   cut video using ffmpeg with:
 *          ffmpeg -ss 00:00:03.014 -i 71.webm cut_71.webm
 *          // -ss HH:mm:ss.mil <== mil = milliseconds
 *  
 * ==> ...merge videos together with client video pool
 */
exports.cutVideosByTimestampSync = (inputDirectory, inputVideosArray, timestampArgument = 'Metronome Start') => {
    var cuttedVideosArray = [];
    // json Files with Timestamp
    let jsonTimestampArray = [];
    const outputContent = fs.readdirSync(
        path.join(process.env.PWD, inputDirectory), 
        { withFileTypes: true } 
    );
    outputContent.forEach( file => {
        const filePath = path.join(process.env.PWD, inputDirectory, file.name);
        if ((! fs.statSync(filePath).isDirectory()) && (path.extname(filePath) === ('.json'))) {
            jsonTimestampArray.push(filePath);
        }
    });


    // parent directory path of cropped videos
    absolutePreparationDirectory = path.resolve(path.dirname(inputVideosArray[0]));
    workingDir = path.resolve(process.env.PWD);
    preparationDirectory = absolutePreparationDirectory.replace(workingDir + '/', '');

    const cuttedVideoDirectory = exports.createDirectoryWithTimeStamp(
        directoryName = `video_cutted`,
        baseDirectory = preparationDirectory,
    );

    // get relevant source videos by matching json-file
    relevantSourceFileArray = [];
    relevantJsonFileArray = [];
    for (var jsonFile of jsonTimestampArray) {
        const jsonFileUUID = (path.basename(jsonFile)).split('_')[0];
        for (var sourceFile of inputVideosArray) {
            const sourceFileUUID = (path.basename(sourceFile)).split('_')[1];
            if (jsonFileUUID === sourceFileUUID) {
                relevantJsonFileArray.push(jsonFile);
                relevantSourceFileArray.push(sourceFile);
            }
        }
    }

    // calculate cuttable offset
    // for (var jsonDataFile of relevantJsonFileArray) {
    for (var index = 0; index < relevantJsonFileArray.length; index += 1){
        const jsonDataFile = relevantJsonFileArray[index];
        const sourceFile = relevantSourceFileArray[index];
        const jsonData = fileHandler.readJsonDataFromFile(jsonDataFile);
        const cuttableOffset = new Date(jsonData[String(timestampArgument)]).valueOf() - new Date(jsonData['Recording Start']).valueOf();
        const cuttableOffsetString = exports.createCuttableOffsetString(cuttableOffset);

        // ffmpeg
        const outputFilePath = path.join(
            cuttedVideoDirectory,
            `cut_${path.basename(sourceFile)}`
        );
        const ffmpegCutCommand = `ffmpeg -ss ${cuttableOffsetString} -i ${sourceFile} ${outputFilePath}`;
        exports.executeSyncFFMPEGCommand(ffmpegCutCommand);
        cuttedVideosArray.push(outputFilePath);
    }
    return cuttedVideosArray;
}

exports.createCuttableOffsetString = (cuttableOffset) => {
    const seconds = cuttableOffset / 1000;
        var offsetString = "00:" // hours
        // minutes present
        if (seconds > 60) {
            const minutesFloored = Math.floor(seconds / 60);
            const restSeconds = (seconds / 60) % 60;
            if (minutesFloored < 10) {
                offsetString += `0${minutesFloored}:`;  //min
            } else {
                offsetString += `${minutesFloored}:`;   //min
            }
            if (restSeconds < 10) {
                offsetString += `0${String(restSeconds).split('.')[0]}.`; //sec
            } else {
                offsetString += `${String(restSeconds).split('.')[0]}.`; //sec
            }
            // milliseconds present
            if ( (String(restSeconds).split('.')).length > 1 ) {
                const formedMilliseconds = String(restSeconds).split('.')[1].substring(0,3);
                offsetString += `${formedMilliseconds}`;    //ms
            } else {
                // no milliseconds present
                offsetString += `000`;    //ms
            }
        } else {
            // no minutes present
            offsetString += `00:`;  // min
            if (seconds < 10) {
                offsetString += `0${String(seconds).split('.')[0]}.`; //sec
            } else {
                offsetString += `${String(seconds).split('.')[0]}.`; //sec
            }
            // milliseconds present
            if ( (String(seconds).split('.')).length > 1) {
                const formedMilliseconds = String(seconds).split('.')[1].substring(0,3);
                offsetString += `${formedMilliseconds}`;    //ms
            } else {
                // no milliseconds present
                offsetString += `000`;    //ms
            }
        }
        return offsetString;
}

exports.cutVideosByAudioPeakSync = (inputDirectory, inputVideosArray) => {
    // create audio peak directory
    let cuttedVideosArray = [];
    let audioPeakFileArray = [];
    const outputContent = fs.readdirSync(
        path.join(process.env.PWD, inputDirectory), 
        { withFileTypes: true } 
    );
    // parent directory path of cropped videos
    absolutePreparationDirectory = path.resolve(path.dirname(inputVideosArray[0]));
    workingDir = path.resolve(process.env.PWD);
    preparationDirectory = absolutePreparationDirectory.replace(workingDir + '/', '');

    const cuttedVideoDirectory = exports.createDirectoryWithTimeStamp(
        directoryName = `video_cutted_audio_peak`,
        baseDirectory = preparationDirectory,
    );

    // analyze files and save output in dir
    for (var sourceFile of inputVideosArray) {
        const fileBaseName = path.basename(sourceFile);
        //index 1 for uuid, because the files have already been preprocessed and have a leading <480_>
        const clientUuid = fileBaseName.split('_')[1];
        const audioPeakFileName = `${clientUuid}_audio_peak_analysis.txt`;
        const audioPeakFilePath = path.resolve(cuttedVideoDirectory, audioPeakFileName);
        audioPeakFileArray.push(audioPeakFilePath);
        const ffmpegAnalyzeAudioPeakCommand = `ffmpeg -hide_banner -i ${sourceFile} -map 0:a:0 -filter:a:0 ebur128='peak=+true' -f null - 2> ${audioPeakFilePath}`;
        exports.executeSyncFFMPEGCommand(ffmpegAnalyzeAudioPeakCommand);
    }
    // read files
    let peakOfClientObject = {};
    for (var audioPeakFile of audioPeakFileArray) {
        let content = null;
        let relevantLinesArray = [];
        let fileLineArray = [];
        try {
            content = fs.readFileSync(audioPeakFile, 'utf8');
        } catch (err) { console.error(err);}
        fileLineArray = content.split('\n');
        for (var line of fileLineArray) {
            if (line.startsWith('[Parsed_ebur128_0')) {
                relevantLinesArray.push(line);
            }
        }
        // remove Summary Line (last line)
        relevantLinesArray = relevantLinesArray.slice(0, -1);
        console.log(relevantLinesArray);
        // collect time and M values
        let timeAndMValueArray = [];
        for (var index = 0; index < relevantLinesArray.length; index += 1) {
            const timeString = relevantLinesArray[index].match(/t\:[\s]*([\d\.]*)/)[0];
            const timeValue = Number(timeString.replace('t:', '').trim());
            const mString = relevantLinesArray[index].match(/M\:[\s]*([-\d\.]*)/)[0];
            const mValue = Number(mString.replace('M:', '').trim());
            timeAndMValueArray.push({
                'time': timeValue,
                'm': mValue
            });

        }
        // moving average of 7 steps to get first peak
        movingMeanDictArray = [];
        for (var i = 3; i < timeAndMValueArray.length - 4; i += 1){
            mean = (
                timeAndMValueArray[i-3]['m'] 
                + timeAndMValueArray[i-2]['m'] 
                + timeAndMValueArray[i-1]['m']
                + timeAndMValueArray[i]['m'] 
                + timeAndMValueArray[i+1]['m'] 
                + timeAndMValueArray[i+2]['m']
                + timeAndMValueArray[i+3]['m']
                ) / 7.0;
            time = timeAndMValueArray[i]['time'];
            movingMeanDictArray.push({
                'time': time, 
                'mean': mean
            })
        }

        //calculate peak:= t[i+5] > t[i] + 30 (start-threshold = 30); data from moving average 
        peakArray = exports.findAudioPeaksWithVariableThresholdRecursively(movingMeanDictArray, 30);

        // convert first peak-time to ffmpeg-format
        const cuttableTimeFFMPEGFormat = new Date(peakArray[0] * 1000).toISOString().substr(11,12);
        
        const clientUuidAnalysisFile = path.basename(audioPeakFile).split('_')[0];
        peakOfClientObject[clientUuidAnalysisFile] = cuttableTimeFFMPEGFormat;
    }
    // execute command for cutting
    for (var sourceFile of inputVideosArray) {
        //index 1 for uuid, because the files have already been preprocessed and have a leading <480_>
        const clientUuidForCutting = path.basename(sourceFile).split('_')[1];
        const cuttableTimeFFMPEGFormat = peakOfClientObject[clientUuidForCutting];
        const outputFilePath = path.join(
            cuttedVideoDirectory,
            `cut_audio_peak_${path.basename(sourceFile)}`
        );
        const ffmpegCutCommand = `ffmpeg -ss ${cuttableTimeFFMPEGFormat} -i ${sourceFile} ${outputFilePath}`;
        exports.executeSyncFFMPEGCommand(ffmpegCutCommand);
        cuttedVideosArray.push(outputFilePath);
    }
    return cuttedVideosArray;
}

/** calculate peak:= t[i+5] > t[i] + 30 (threshold = 30)
 *  by starting with a threshold and recursively lowering it
 *  @returns an array of peak values between timestamps
*/ 
exports.findAudioPeaksWithVariableThresholdRecursively = (movingMeanDictArray, threshold) => {
    console.log(`AUDIO PEAK: THRESHOLD: ${threshold}`);
    let peakArray = [];
    for (var i=0; i < movingMeanDictArray.length-6; i+=1){
        if (movingMeanDictArray[i+5]['mean']> movingMeanDictArray[i]['mean']+ threshold){
            console.log('peak found between: ',movingMeanDictArray[i]['time'], ' and ', movingMeanDictArray[i+5]['time']);
            peakArray.push(movingMeanDictArray[i]['time']);
        }
    }
    if (peakArray.length === 0) {
        console.log(`AUDIO PEAK: SETTING LOWER THRESHOLD: ${threshold} ==> ${threshold - 1}`);
        return exports.findAudioPeaksWithVariableThresholdRecursively(movingMeanDictArray, threshold - 1);
    }
    return peakArray;
}