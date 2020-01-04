import trace from './../src/common/Logs';


export class MediaHandler {
    getMediaDevices() {
        return new Promise((resolve, rejects) => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then((stream) => {
                    resolve(stream);
                    trace('Received local stream.');
                })
                .catch((error) => {
                    trace(`getMediaDevices error: ${error}`);
                    alert(error.message);
                })
        });
    }
}