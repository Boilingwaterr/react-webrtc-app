import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import socketReducer from './socketReducer';
import webRTCReducer from './webRTCReducer';
import authReducer from './authReducer';
import { reducer as formReducer } from 'redux-form';
const reducers = combineReducers({
    socketData: socketReducer,
    rtcData: webRTCReducer,
    authData: authReducer,
    form: formReducer
})
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducers, composeEnhancers(applyMiddleware(thunkMiddleware)));

window.store = store;

export default store;