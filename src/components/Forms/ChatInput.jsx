import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { renderField, submitOnEnter } from './FormValidation';
import { connect } from 'react-redux';
import { sendChatMessage } from '../../redux/webRTCReducer';
import { maxLength } from './Validators';

const maxLength30 = maxLength(30);

let ChatInput =  props => {
    const { handleSubmit } = props

    return <form onSubmit = { handleSubmit } onKeyDown = { e => {submitOnEnter(e, handleSubmit)}}>
            <Field
                name = 'chat'
                component = { renderField }
                type = 'text'
                placeholder = 'Enter your message'
                autocomplete = "off"
                validate = {[maxLength30]}
            />
        <button type = 'submit'>Submit</button>
    </form>
}

ChatInput = reduxForm({
    form: 'chatlog'
})(ChatInput);

class ChatInputWrapper extends React.Component{


    submit = value => {
        this.props.sendChatMessage(value);
        this.props.messageHandler(value.chat, this.props.authData.myInfo.id,
            this.props.authData.myInfo.nick, this.props.authData.myInfo.color);
        value.chat = '';
    }

    render(){
        return <>
            { this.props.chatIsActive && <ChatInput {...this.props} onSubmit = { this.submit }/>}
        </>

    }
}

let mapStateToProps = state => {
    return {
        socketData: state.socketData,
        authData: state.authData
    }
}

export default connect (mapStateToProps,{sendChatMessage})(ChatInputWrapper);
