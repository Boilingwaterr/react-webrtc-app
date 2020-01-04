import React from 'react';
import Style from './Peers.module.css';

const Peers = ({ socketData, authData }) => {
    return <div className = {Style.usersBar}>
        <h3>Users connected: </h3>
        {
            socketData.usersInfo.length === 0 ? <ul><li><h4>{ authData.myInfo.nick }</h4></li></ul>
            : socketData.usersInfo.map(item => {
                return <ul key = {item.id} > {socketData.myId === item.id
                    ?  <li key = {item.id}><h4>{item.nick}</h4></li>
                    :  <li key = {item.id}>{item.nick}</li>}
                </ul>
            })
        }
    </div>
}

export default Peers;