// TODO: getHeightAndWidthOfParticipants()
/**
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

// TODO: equate all input-sources pixel-sizes to the same height and width


// TODO: build ffmpeg command for merging audio and video
/**
 * ffmpeg: height and width definition
 *  x-axis := w, y-axis := h
 *  coordinate origin: 0_0
 *  1 * x-axis-step: w0 := 0_0 + 1 * x-axis-step
 *  i * x-axis-step: w0+w1+..+wi
 *  y-axis-steps analog
 *  
 * 
 * COMMAND f. 5 input sources:
 * ffmpeg 
 * -i ef7e78a6-15c3-4784-b958-807f24e0bd00_05_11_2021,\ 15_01_26.mp4 -i f86b630f-8ce3-49de-9d43-51bfd9eae69f_05_11_2021,\ 15_01_26.mp4 -i fcb24433-72c0-4a84-b4f6-223661d12d5b_05_11_2021,\ 15_01_26.mp4 -i 13e40d05-e31c-41d0-ac13-36704914c8d7___05_11_2021,\ 15_47_09.mp4 -i 94afcf4f-fd3a-4a76-b710-120398da0170___05_11_2021,\ 16_56_52.mp4 
 * -filter_complex "[0:v][1:v][2:v][3:v][4:v]xstack=inputs=5:layout=0_0|0_h0|w0_0|w0_h0|w0+w1_0[v];
 * amix=inputs=5:duration=longest:dropout_transition=5" 
 * -map "[v]" output_xstack_n_5.mp4
 * 
 */

// TODO: merge files and save 