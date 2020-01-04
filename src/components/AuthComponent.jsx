import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { renderField, submitOnEnter } from './Forms/FormValidation';
import { connect } from 'react-redux';
import './../App.css';
import { authAC, authThunk } from './../redux/authReducer';
import { Redirect } from 'react-router-dom';
import { maxLength, minLength3 } from './Forms/Validators';

const maxLength10 = maxLength(10);

let AuthForm =  props => {
    const { handleSubmit } = props



    return <form onSubmit = { handleSubmit } onKeyDown = { e => submitOnEnter(e, handleSubmit) }>
        <Field
            label = 'Nickname.'
            name = 'nick'
            component = { renderField }
            type = 'text'
            placeholder = 'Enter your nickname'
            autocomplete = "off"
            validate = {[minLength3, maxLength10]}
        />
        <Field
            label = 'Chose color for your messages.'
            name = 'color'
            component = { renderField }
            type = 'color'
            autocomplete = "off"
        />
        <button type = 'submit'>Submit</button>
    </form>
}

AuthForm = reduxForm({
    form: 'authform'
})(AuthForm);

class AuthComponent extends React.Component{

    componentDidUpdate(prevProps) {
        if (prevProps.authData.myInfo !== this.props.authData.myInfo){
            if (this.props.authData.myInfo !== null && this.props.authData.myInfo !== undefined)
            this.props.authAC();
        }
    }

    submit = value => {
        console.log(value);
        if (value.color === '#000000') value.color = '#778899';
        value.nick !== undefined && this.props.authThunk(value);
    }

    render(){
        if (this.props.authData.isAuth === true) {
            return <Redirect to = '/room' />
        }

        return <div className = 'auth-page'>
            <AuthForm {...this.props} onSubmit = { this.submit }/>
        </div>

    }

}

let mapStateToProps = state => {
    return {
        authData: state.authData,
    }
}

export default connect (mapStateToProps,{authAC, authThunk})(AuthComponent);
