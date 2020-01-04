import { socket } from './socketReducer';

const AUTH_SUCCESS = 'authReducer/AUTH_SUCCESS';
const IS_AUTH = 'authReducer/IS_AUTH';


const initialState = {
    myInfo: null,
    isAuth: false
}

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case AUTH_SUCCESS:
            return {
                ...state,
                myInfo: action.payload
            }
        case IS_AUTH:
            return {
                ...state,
                isAuth: true
            }
        default:
            return state;
    }
}


// action creators
export const loginAC = payload => {
    return {
        type: AUTH_SUCCESS,
        payload
    }
}

export const authAC = () => {
    return {
        type: IS_AUTH
    }
}

//thunks

export const authThunk = userData => {
    return dispatch => {
        socket.emit('auth', JSON.stringify(userData));
        socket.on('auth', data => {
            let json = JSON.parse(data);
            dispatch(loginAC(json));
            console.log(json);

        })
        socket.on('authUpdate', usersInfo => {
            let json = JSON.parse(usersInfo);
            console.log(json);
        })
    }
}

export default authReducer;