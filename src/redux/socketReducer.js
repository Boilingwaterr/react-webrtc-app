import openSocket from 'socket.io-client';
import store from './reduxStore';
import trace from './../common/Logs';

const SUCCESS_CREATED_ROOM = 'socketReducer/SUCCESS_CREATED_ROOM';
const USERS_HAS_CHANGED = 'socketReducer/USER_HAS_CHANGED';
const SET_MY_INFO = 'socketReducer/SET_MY_INFO';
const INITIAL_ROOM_SUCCESS = 'socketReducer/INITIAL_ROOM_SUCCESS';
const SET_NEW_USER = 'socketReducer/SET_NEW_USER';
const READY_TO_CALLING = 'socketReducer/READY_TO_CALLING';
const INITIAL_APP_SUCCESS = 'socketReducer/INITIAL_APP_SUCCESS';



export const socket = openSocket('http://localhost:8000');

const initialState = {
    isAuth: null,
    isInitiator: false,
    isRoomFull: false,
    isChannelReady: false,
    myId: null,
    roomName: null,
    users: [],
    usersInfo: [],
    otherUser: null,
    readyToCall: false
}

const socketReducer = (state = initialState, action) => {
    switch (action.type) {
        case SUCCESS_CREATED_ROOM:
            return {
                ...state,
                isInitiator: true,
                roomName: action.payload.roomName
            }

        case SET_MY_INFO:
            return {
                ...state,
                roomName: action.payload.roomName,
                myId: action.payload.id
            }

        case USERS_HAS_CHANGED:
            return {
                ...state,
                users: Object.keys(action.payload.clientsInRoom.sockets),
                usersInfo: action.payload.users
            }

        case INITIAL_ROOM_SUCCESS:
            return {
                ...state,
                isChannelReady: true,
            }

        case SET_NEW_USER:
            return {
                ...state,
                otherUser: action.payload,
            }

        case READY_TO_CALLING:
            return {
                ...state,
                readyToCall: action.payload
            }
        case INITIAL_APP_SUCCESS:
            return {
                ...state,
                isAuth: action.payload
            }

        default:
            return state;
    }
}


// action creators
export const initializingApp = payload => {
    return {
        type: INITIAL_APP_SUCCESS,
        payload
    }
}
const setNewUser = payload => {
    return {
        type: SET_NEW_USER,
        payload
    }
}
export const setReadyToCallingAC = payload => {
    return {
        type: READY_TO_CALLING,
        payload
    }
}
const successCreatedRoom = payload => {
    return {
        type: SUCCESS_CREATED_ROOM,
        payload
    }
}

const usersHasChanged = payload => {
    return {
        type: USERS_HAS_CHANGED,
        payload
    }
}

const setMyInfo = payload => {
    return {
        type: SET_MY_INFO,
        payload
    }
}

const initialRoomSuccess = () => {
    return {
        type: INITIAL_ROOM_SUCCESS
    }
}

//thunks
export const createRoomThunk = (roomName) => {
    return dispatch => {
        socket.emit('create or join room', (roomName));
        trace(`Attempted to create or join room: ${roomName}.`);

        socket.on('new', id => {
            let json = JSON.parse(id);
            dispatch(setNewUser(json));
            socket.emit('new', store.getState().socketData.myId);
            console.log(json, 'on new');
        })

        socket.on('toPeer', id => {
            let json = JSON.parse(id);
            dispatch(setNewUser(json));
            console.log(json, 'on toPeer');
        })

        socket.on('initiator', str => {
            let obj = JSON.parse(str);
            dispatch(successCreatedRoom(obj));
        })

        socket.on('joined users', json => {
            let object = JSON.parse(json);
            console.log(object)
            let numOfClients = object.clientsInRoom.length;
            console.log(`Another peer made a request to join room ${roomName}.`);
            console.log(`This peer is the initiator of room ${roomName}.`);
            console.log(`Another user was connected to room: ${roomName}, number of useres: ${numOfClients}`);
            dispatch(usersHasChanged(object));
            dispatch(initialRoomSuccess());
        })

        socket.on('connected', json => {
            let object = JSON.parse(json);
            dispatch(setMyInfo(object));
        })

        socket.on('user disconnected', json => {
            let object = JSON.parse(json);
            console.log(object)
            dispatch(usersHasChanged(object));
        })
    }
}

export const disconnectThunk = (roomName) => {
    return dispatch => {
        socket.disconnect(roomName);
    }
}

socket.on('full', (roomName) => {
    console.log(`Room ${roomName} is full`);
});

socket.on('log', logArray => {
    console.log.apply(console, logArray);
});

export default socketReducer;