import React, { createRef } from 'react';
import Style from './Video.module.css';


const Video = React.memo ( props => {

    const {
        myWebCam,
        socketData,
        rtcData,
        startCall,
        remoteWebCam,
        closeVideoCall,
    } = props;

    const dragItem = createRef(null);

    return <div className = { Style.webCamBar }>
        <div className = {Style.webCamWrapper}>
          <div className = { Style.myWebCam } ref = { dragItem }
            onMouseDown = {e => {
              let shiftX = e.clientX - dragItem.current.getBoundingClientRect().left;
              let shiftY = e.clientY - dragItem.current.getBoundingClientRect().top;
              const moveAt = (pageX, pageY) => {
                if (pageX - shiftX >= document.body.clientWidth - 250) {
                  return
                } else if(pageX - shiftX <= 0){
                  return
                } else {
                dragItem.current.style.left = `${pageX - shiftX}px`;
                }
                if (pageY - shiftY >= document.body.clientHeight - 200) {
                  return
                } else if(pageY - shiftY <= 0){
                  return
                } else {
                  dragItem.current.style.top = `${pageY - shiftY}px`;
                }
              }
              onmousemove = event => {
                moveAt(event.pageX, event.pageY);
              }
              onmouseup = event => {
                event.preventDefault();
                onmousemove = null;
                onmouseup = null;
              }
            }}
          >
            <video autoPlay = {true} ref = { myWebCam }></video>
          </div>
          <div className = { Style.otherWebCam }>
             <video autoPlay = { true } ref = {remoteWebCam}></video>
          </div>
        </div>
        <div className = { Style.buttonWrapper }>
          {socketData.isInitiator && socketData.otherUser &&
            <button onClick = {() => {
              startCall(rtcData.peerConnection, socketData.roomName, socketData.myId, socketData.otherUser);
              }}>DO CALL</button>
          }
            <button onClick = {closeVideoCall}>HANG UP</button>
        </div>
    </div>
})

export default Video;
