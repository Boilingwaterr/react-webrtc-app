import { socket } from './socketReducer';
import store from './reduxStore';
import trace from './../common/Logs';
import {
    onCreateSessionDescriptionError,
    handleCreateOfferError,
    onCreatePeerConnectionError
} from './../common/ErrorsHandler';

const IS_CONNECTED = 'webRTCReducer/IS_CONNECTED';
const CREATE_PEER_CONNECTION_SUCCESS = 'webRTCReducer/CREATE_PEER_CONNECTION_SUCCESS';
const SET_REMOTE_STREAM = 'webRTCReducer/SET_REMOTE_STREAM';
const SET_LOCAL_STREAM = 'webRTCReducer/SET_LOCAL_STREAM';
const SET_START = 'webRTCReducer/SET_START';
const MEDIA_SUCCESSFULLY_RECEIVED = 'webRTCReducer/MEDIA_SUCCESSFULLY_RECEIVED';
const SET_CHAT_LOG_REF = 'webRTCReducer/SET_CHAT_LOG_REF';
const MESSAGE_HANDLER = 'webRTCReducer/MESSAGE_HANDLER';
const OPEN_CHAT = 'webRTCReducer/OPEN_CHAT';


const initialState = {
    peerConnection: null,
    hasMedia: false,
    isStarted: false,
    remoteVideo: null,
    chatLog: null,
    localStream: null,
    sender: null,
    messages: [],
    chatIsActive: false
}

const webRTCReducer = (state = initialState, action) => {
    switch (action.type) {
        case IS_CONNECTED:
            return {
                ...state,
                connected: action.payload
            }

        case CREATE_PEER_CONNECTION_SUCCESS:
            return {
                ...state,
                peerConnection: action.pc
            }

        case SET_REMOTE_STREAM:
            return {
                ...state,
                remoteVideo: action.payload
            }

        case SET_LOCAL_STREAM:
            return {
                ...state,
                localStream: action.payload
            }

        case SET_START:
            return {
                ...state,
                isStarted: true
            }

        case MEDIA_SUCCESSFULLY_RECEIVED:
            return {
                ...state,
                hasMedia: action.payload
            }
        case SET_CHAT_LOG_REF:
            return {
                ...state,
                chatLog: action.payload
            }

        case MESSAGE_HANDLER:
            return {
                ...state,
                messages: [...state.messages, {
                    message: action.message,
                    id: action.id,
                    nick: action.nick,
                    color: action.color
                }]
            }
        case OPEN_CHAT:
            return {
                ...state,
                chatIsActive: true
            }

        default:
            return state;
    }
}

// Action creators
const createPeerConnectionSuccess = pc => {
    return {
        type: CREATE_PEER_CONNECTION_SUCCESS,
        pc,

    }
}

const showChatAC = () => {
    return {
        type: OPEN_CHAT
    }
}

export const setStartAC = () => {
    return {
        type: SET_START,
    }
}

export const setLocalStreamAC = payload => {
    return {
        type: SET_LOCAL_STREAM,
        payload
    }
}

export const setRemoteStreamAC = payload => {
    return {
        type: SET_REMOTE_STREAM,
        payload
    }
}

export const successMediaAC = payload => {
    return {
        type: MEDIA_SUCCESSFULLY_RECEIVED,
        payload
    }
}
export const setChatLogRef = payload => {
    return {
        type: SET_CHAT_LOG_REF,
        payload
    }
}

export const messageHandler = (message, id, nick, color) => {
    return {
        type: MESSAGE_HANDLER,
        message,
        id,
        nick,
        color
    }
}

//thunks
let peers = {};
let sender, sendChannel, pc, socketData;

export const createPeerConnectionThunk = (servers, id, receiveChannelCallback) => {
    return dispatch => {
        if (id !== null)
            try {
                pc = new RTCPeerConnection(servers); //  create rtc object.
                pc.onicecandidate = handleIceCandidate; // set on ice candidate event.
                pc.ontrack = gotRemoteMediaStream;
                pc.onremovetrack = handleRemoveTrackEvent;
                sendChannel = pc.createDataChannel('chat', null);
                sendChannel.onopen = function() {
                    trace('channel is open');
                    dispatch(showChatAC());
                }


                pc.ondatachannel = receiveChannelCallback;
                trace('Created peer connection.');
            } catch (err) {
                onCreatePeerConnectionError(err);
            } finally {
                peers[id] = pc;
                peers[id].sendChannel = sendChannel;
                peers[id].sendChannel.ondatachannel = receiveChannelCallback
                dispatch(createPeerConnectionSuccess(pc));
            }
    }
}
export const sendChatMessage = (data) => {
    let users = store.getState().socketData.users
    let myInfo = store.getState().authData.myInfo;
    let message = {
        nick: myInfo.nick,
        color: myInfo.color,
        id: myInfo.id,
        message: data.chat
    }
    return dispatch => {
        users.map(item => {
            return item !== myInfo.id && peers[item].sendChannel.readyState === 'open' &&
                peers[item].sendChannel.send(JSON.stringify(message));
        })
    }
}

export const sendMessage = (message, roomName, myId, toPeer) => {
    socket.emit('message', message, JSON.stringify({ roomName, myId, toPeer }));
    trace('Client send message', message);
}

//socket react

socket.on('message', (message, userData) => {
    let pc;
    let userInfo = JSON.parse(userData);
    let socketData = store.getState().socketData;
    if (socketData.otherUser !== undefined) {
        pc = peers[socketData.otherUser]
    } else {
        sender = userInfo.sender;
        pc = peers[sender]
    }

    trace('Client received message: ', message);
    switch (message.type) {
        case 'offer':
            if (!socketData.isInitiator) {
                startCall(null, null, null, userInfo.sender);
            }
            pc.setRemoteDescription(new RTCSessionDescription(message));
            doAnswer(pc, socketData.roomName, socketData.myId, userInfo.sender);
            break;
        case 'answer':
            pc.setRemoteDescription(new RTCSessionDescription(message));
            break;
        case 'candidate':
            let candidate = new RTCIceCandidate({
                sdpMLineIndex: message.label,
                candidate: message.candidate
            });
            pc.addIceCandidate(candidate);
            break;
        default:
            break;
    }
});


//rtc logic funcs

export const startCall = (pc, roomName, myId, toPeer) => {

    let rtcData = store.getState().rtcData;
    let socketData = store.getState().socketData;
    let localStream = rtcData.localStream;
    if (rtcData.remoteVideo !== null && rtcData.isStarted === false && typeof rtcData.localStream !== 'undefined' && !!socketData.isChannelReady) {
        if (peers[toPeer].sender === undefined) peers[toPeer].sender = rtcData.localStream.getTracks().map(track => {
            return peers[toPeer] !== undefined && peers[toPeer].addTrack(track, localStream);
        })
        if (socketData.isInitiator) {
            let startTime = window.performance.now();
            trace('starting call', startTime);
            doCall(peers[toPeer], roomName, myId, toPeer);
        }
    }
}

export const doCall = (pc, roomName, myId, toPeer) => {
    trace('Sending offer to peer.');
    const setLocalAndSendMessage = sessionDescription => {
        pc.setLocalDescription(sessionDescription);
        sendMessage(sessionDescription, roomName, myId, toPeer);
    }
    pc.createOffer()
        .then(setLocalAndSendMessage, handleCreateOfferError);
}

export const doAnswer = (pc, roomName, myId, toPeer) => {
    trace('Sending answer to peer.');
    const setLocalAndSendMessage = sessionDescription => {
        pc.setLocalDescription(sessionDescription);
        sendMessage(sessionDescription, roomName, myId, toPeer);
    }
    pc.createAnswer()
        .then(setLocalAndSendMessage, onCreateSessionDescriptionError);
}

const gotRemoteMediaStream = event => {
    let remoteStream = event.streams;
    let remoteVideo = store.getState().rtcData.remoteVideo;
    remoteVideo.current !== null ?
        remoteVideo.current.srcObject = remoteStream[0] :
        remoteVideo.current = null;
    trace('Remote peer connection received remote stream.');
}

const handleIceCandidate = event => {
    socketData = store.getState().socketData;
    let Sender;
    if (sender !== undefined) {
        Sender = sender;
    } else {
        Sender = socketData.otherUser;
    }
    trace('Icecandidate event: ', event);
    if (event.candidate) {
        sendMessage({
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        }, socketData.roomName, socketData.myId, Sender);
    } else {
        trace('End of candidates.');
    }
}

// closing connection
const handleRemoveTrackEvent = event => {
    let remoteVideo = store.getState().rtcData.remoteVideo;
    let stream = remoteVideo.current.srcObject;
    let trackList = stream.getTracks();
    return stream && trackList;
}

export const closeVideoCall = () => {
    let rtcData = store.getState().rtcData;
    let remoteVideo = rtcData.remoteVideo;
    let localVideo = rtcData.localStream;
    let pc = rtcData.peerConnection;
    if (pc) {
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.onremovetrack = null;
        pc.oniceconnectionstatechange = null;
        pc.onsignalingstatechange = null;
        pc.onicegatheringstatechange = null;
        pc.onnegotiationneeded = null;
        if (remoteVideo.current.srcObject) {
            remoteVideo.current.srcObject.getTracks().forEach(track => track.stop());
        }
        if (localVideo.srcObject) {
            localVideo.srcObject.getTracks().forEach(track => track.stop());
        }
        pc.close();
        pc = null;
    }
    remoteVideo = null;
    localVideo = null;
}

export default webRTCReducer;