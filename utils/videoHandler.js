const execSync = require('child_process').execSync;
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

exports.createDirectoryWithTimeStamp = (directoryName) => {
    const dateTime = exports.getDateTimeString();
    const directoryNameWTimeStamp = `${directoryName}_${dateTime}`;
    const directoryPath = path.join(process.env.PWD, 'output', directoryNameWTimeStamp);
    fs.mkdirSync(directoryPath, { recursive: true} );
    return directoryPath;
}

exports.getDateTimeString = () => {
    const currentDate = new Date();
    const cDate = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();
    const cTime = currentDate.getHours() + "-" + currentDate.getMinutes() + "-" + currentDate.getSeconds();
    const dateTime = cDate + '_' + cTime;
    return dateTime;
}

exports.prepareVideoFilesAndCreateMergingCommand = (inputDirectory = 'output', outputResolution = '480') => {
    const outputContent = fs.readdirSync(
        path.join(process.env.PWD, inputDirectory), 
        { withFileTypes: true } 
    );
    let rawVideosArray = [];
    outputContent.forEach( file => {
        const filePath = path.join(process.env.PWD, inputDirectory, file.name);
        if (! fs.statSync(filePath).isDirectory() ) {
            rawVideosArray.push(filePath);
        }
    });

    // equating resolution
    const croppedVideosArray = exports.cropVideosResolution(
        inputVideosArray = rawVideosArray,
        outputResolution = outputResolution
    );

    console.log(`CROPPED VIDEOS ARRAY: ${croppedVideosArray}`)

    // height and width values
    const heightAndWidthObject = exports.getHeightAndWidthOfParticipants( size= croppedVideosArray.length);

    outputFile = path.join(
        outputContent,
        `merged_video__${exports.getDateTimeString}.mp4`
    );

    // command for merging videos
    const mergeVideoTilesCommand = exports.createMergeVideoTilesCommand(
        inputVideosArray = croppedVideosArray,
        maxHeight = heightAndWidthObject['height'],
        maxWidth = heightAndWidthObject['width'],
        outputFile = outputFile
    );

    return {
        'command': mergeVideoTilesCommand,
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
exports.cropVideosResolution = (inputVideosArray = [], outputResolution = 480) => {
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
        ffmpeg(inputVideosArray[index])
        .outputOptions([
            `-filter:v crop=${outputResolution}:${outputResolution}`
        ])
        .save(
            String(outputFile)
        );
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

exports.executeMergingVideoTilesToOneOutputFile = (ffmpegCommand) => {
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
