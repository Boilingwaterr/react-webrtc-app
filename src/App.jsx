import React, { useEffect, useRef }from 'react';
import { createRoomThunk, setReadyToCallingAC, initializingApp } from './redux/socketReducer';
import { connect } from 'react-redux';
import './App.css';
import  { MediaHandler } from './MediaHandler';
import {
  createPeerConnectionThunk,
  setRemoteStreamAC,
  setLocalStreamAC,
  setStartAC,
  startCall,
  closeVideoCall,
  setChatLogRef,
  successMediaAC,
  messageHandler
  } from './redux/webRTCReducer';
import Peers from './components/Peers';
import Video from './components/Video';
import ChatChannel from './components/ChatChannel';
import trace from './common/Logs';
import { withAuthRedirect } from './hoc/withAuthRedirect';
import { compose } from 'redux';

let mediaHandler = new MediaHandler();

const App = props => {

  const {
    createRoomThunk,
    socketData,
    createPeerConnectionThunk,
    setRemoteStreamAC,
    setLocalStreamAC,
    setStartAC,
    rtcData,
    successMediaAC,
    setReadyToCallingAC,
    initializingApp,
    setChatLogRef,
    messageHandler,
    authData
    } = props;

  const myWebCam = useRef(null);
  const remoteWebCam = useRef(null);

  useEffect(() => { //getting media.
    socketData.roomName !== null && mediaHandler.getMediaDevices()
      .then(stream => {
        try{
          myWebCam.current.srcObject = stream;
          setLocalStreamAC(stream);
        } catch (e) {
          myWebCam.current.src = URL.createObjectURL(stream);
        } finally{
          myWebCam.current.play();
          successMediaAC(true);
        }
      });
  }, [socketData.roomName, setStartAC, setLocalStreamAC, successMediaAC]);

  useEffect(() => {
    socketData.roomName === null && createRoomThunk('room_1');
  }, [socketData.roomName, createRoomThunk]);

  useEffect(() => { //initializing
    if(socketData.isRoomFull === false &&
    socketData.myId !== null &&
    socketData.roomName !== null &&
    rtcData.hasMedia === true){
      initializingApp(true);
    } else {
      initializingApp(false);
    }
}, [socketData.isRoomFull, socketData.myId, socketData.roomName,
  rtcData.hasMedia, initializingApp]);

  useEffect(() => { //create peer connection.
    const receiveChannelCallback = event => {
      trace('Receive Channel Callback');
      let receiveChannel = event.channel;
      receiveChannel.onmessage = event => {
        trace('Received Message');
        let json = JSON.parse(event.data);
        messageHandler(json.message, json.id, json.nick, json.color);
      }
    }
    try{
      socketData.users.map((item, index) => {
        return item !== socketData.myId && createPeerConnectionThunk(null, item, receiveChannelCallback);
      })

    } catch (error) {
      throw new Error(`Peer connection error:${error}`);
    } finally {
      setReadyToCallingAC(true);
    }
  }, [createPeerConnectionThunk, setReadyToCallingAC, socketData.otherUser,
    socketData.users, socketData.myId, messageHandler, rtcData.chatLog]);

  useEffect(() => {
    const chatLog = rtcData.chatLog;
    if (chatLog !== null)
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
  }, [rtcData.chatLog, rtcData.messages]);
  useEffect(() => {
      setRemoteStreamAC(remoteWebCam);
  }, [setRemoteStreamAC, remoteWebCam]);

  return (
    <div className="App">
      <Peers
        socketData = { socketData }
        authData = { authData }
      />
      <div className = "chat">
        <Video { ...props }
        myWebCam = { myWebCam }
        startCall = { startCall }
        remoteWebCam = { remoteWebCam }
        setRemoteStreamAC = { setRemoteStreamAC }
        setReadyToCallingAC = { setReadyToCallingAC }
        closeVideoCall = { closeVideoCall }
        />
        <ChatChannel
          myId = { socketData.myId }
          setChatLogRef = { setChatLogRef }
          chatLog = { rtcData.chatLog }
          messages = { rtcData.messages }
          messageHandler = { messageHandler }
          chatIsActive = { rtcData.chatIsActive }
        />
      </div>
    </div>
  );

}

const mapStateToProps = state =>{
  return {
    socketData: state.socketData,
    rtcData: state.rtcData,
    authData: state.authData
  }
}

export default compose
(connect(mapStateToProps,{
  createRoomThunk,
  createPeerConnectionThunk,
  setRemoteStreamAC,
  setLocalStreamAC,
  setStartAC,
  successMediaAC,
  setReadyToCallingAC,
  initializingApp,
  setChatLogRef,
  messageHandler}), withAuthRedirect)(App);