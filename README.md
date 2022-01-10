# collaborative-online-music

## Development-Versions
* 0.0.1-ws-architecture
* 0.0.2-ws-file-transfer
* 0.0.3-broadcast-server-message
* 0.0.4-client-recording
* 0.0.5-host-metronome
* 0.0.6-local-network-hosting
* 0.0.7-server-media-rendering
* 0.0.8-server-media-synchronization
* 0.0.9-client-audio-normalization
* 0.0.10-session-bound-filesystem-handling
* 0.0.11-pw-security
* 0.0.12-exposed-hosting
* 0.0.13-frontend
* ~(0.0.14-host-video-stream)~

<br><br>

## Installation
This Program is build with the node-version 10.19 and requires as dependencies ffmpeg for server-side media-manipulation and openssl for hosting with an ssl-certificate, which is installable on debian-based systems with the following command:
```bash
apt update
apt install -y ffmpeg openssl
```
\
To build this node program, make sure, that the node package manager is installed and run the following command:
```bash
npm install
```

## SSL-Certificate
The https-protocol is needed to run the program on the client-side with the usage of the usermedia. After installing openssl for the ssl-certificate, it is possible to automatically create and self-sign the certificate with the following make-target, which uses a shell-script:
```bash
make configure-and-sign-ssl-cert
```
\
If a new ssl-certificate is needed, it is possible to delete the created ssl-certificate and to create a new one using the following make-targets:
```bash
make delete-certs
make configure-and-sign-ssl-cert
```

## Usage
To run the program on a linux system, use the following node-script to run it on port 3000:
```bash
npm run dev
```
After the program is build, make sure to know the ip-address of the host system, which now runs the program. The ip-address can be found for every installed network-interface for example with the following command (make sure to use the ipv4 command of the interface that you are using):
```bash
ifconfig
```
Now the hosted program is reachable on the entrypoint:
`https://<ipv4-address>:3000/`

If it is needed to host the program exposed, then it is required to create a .env file containing the exposed ipv4-Address.
The Contents of the .env -File looks as follows:
```
IP_ADDRESS=::ffff:<ipv4-address>
```

### Host
To run the program as a host, please navigate to the endpoint `/host` and expect a warning from the site, as the ssl-certificate is self-signed, which offers a potential security-risk to the client. \
If you trust the program, you will see a screen with your uuid, which is the unique identifier for the host during the whole session. \
Now it is needed to define the constraints for the **metronome**, which are safed to the session-context, once the metronome has started and stopped. It is also needed to define **start sounds**, that are separated by a commas. Again, it is needed to save the sounds to the session-context using the respective button. 
<br><br>
When the clients have registered to the program it is possible to **start the recording** of the clients with the button *broadcast start* and to **end the recording** with the button *broadcast stop*.\
Now the clients need to send the created videofiles to the server; once these files have been uploaded to the server, the host needs to **prepare** the client video-files by adjusting the resolution to, by default, 480p in height and width.\
As the client implicitly send meta-informations about their recording, it is possible to apply one of the following **merging strategies** by cutting the videos regarding the send timestamp from the meta-informations of each client: Recording Start, Metronome Start, Singing Start. Another merging strategy is merging by the first audio peak, where the client audio-tracks of the video files will be analyzed regarding the loudness for every timestep. These results are used to calculate the moving average of 7 neighbored timesteps, so that it is possible to find real loudness peaks in the audio. A hardcoded argument for a peak is, when the proceeding moving average has a positive change of 30db. The client-videos will then be cut from their first audio peak.\
After these steps have been applied, it is possible to **merge** the videos into one output file with the respective button. After the merge has been finalized, the host will receive the synchronized and merged video-file from the server automatically.
<br><br>
**Please note, that each step for modifying the videos results in a blocking state of the server, as this happens synchronous and therefore the host needs to be patient and should have access to the server-logs and resource-monitor.**

### Client
As a client, it is possible to use this program using this endpoint: `/client`.
After accepting the warning about a potential security-risk due to the self-signed ssl-certificate, the client will be prompted to give the site permissions for using the videostream and microphone. After the client has given these permissions, the client should see the uuid, which is the unique idenfier of the client for the whole session. Buttons for **stopping or muting the metronome** can be triggered, but are highly advised to not be used! \
After the host has configured the constraints for the program and starts the broadcast, the clients can see the broadcast-start message in the console on the top of the screen. A metronome starts counting in 2 bars and will be muted by default afterwards. A visually rendered metronome is shown additionally throughout the whole session, if the button to stop the metronome is not clicked. \
After the host stopped the broadcast, the recorded video will be saved to the client, which results mostly in a prompt message by the used browser. Now it is neccessary by the client to upload this video-file by using the **choose file** button below the rendered client-video-stream. The created file is named after the client-uuid and the current timestamp.


## CLIENT OS x Browser-Compability:
| OS x Browser  | Firefox     | Chrome| Safari    | Edge  |
| ---           | ---         | ---   | ---       | ---   |
| OSX            |  user-media not available | :heavy_check_mark: | :heavy_check_mark: | :radio_button: |
| Linux   | :heavy_check_mark:    | :heavy_check_mark: |  :radio_button: | :radio_button:|
| Windows | :heavy_check_mark: | :heavy_check_mark: | :radio_button: | :heavy_check_mark: | 
| iOS | ws-session not initialized  | ws-session not initialized | ws-session not initialized | :radio_button: |
| Android   | :heavy_check_mark: | :heavy_check_mark: | :radio_button: | :radio_button: |

<br><br>

## SERVER OS-Compability:
* ffmpeg:
    * works on linux
    * macos has a no measurable runtime (termination not encountered yet)
* windows is not supported (filesystem)