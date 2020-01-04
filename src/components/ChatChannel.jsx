import React, { useRef, useEffect } from 'react';
import Style from './ChatChannel.module.css';
import ChatInputWrapper from './Forms/ChatInput';

const ChatChannel = props => {
   const { setChatLogRef, myId, messageHandler } = props;
   let itemId = 0;
   const chatLogDiv = useRef(null);

   useEffect(() => {
      setChatLogRef(chatLogDiv);
   }, [props.chatLog, setChatLogRef]);

   return (
     <div className = { Style.chatWrapper }>
        <div className = { Style.chatLog } ref = { chatLogDiv }>
           {props.messages.map(item => {
              itemId++;
              return item !== undefined &&
           <div key = {itemId} className = {Style.messageItem}
               style = {item.color !== undefined ? {background: `${item.color}`}
                        : {background: '#778899'}}>
                 <h3>{`${item.nick}:`}</h3><p>{item.message}</p>
              </div>
           })}
        </div>
        <ChatInputWrapper
            messageHandler = { messageHandler }
            myId = { myId }
            chatIsActive = { props.chatIsActive }
        />
     </div>
   )
}

export default ChatChannel;
