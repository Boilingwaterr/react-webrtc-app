import React from 'react';

export const renderField = ({
    input, values, autocomplete,
    label, type, placeholder, meta: { touched, error, warning }}) => {

    return <>
        <label>{label}</label>

        <input {...input}
            onKeyDown = { e => {e.key === 'Enter' && e.preventDefault()} }
            autoFocus = { true }
            initialvalues = { values }
            placeholder = { placeholder || label }
            autoComplete  = { autocomplete }
            type = { type }

        />
        {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
    </>
}

export const submitOnEnter = (e, handleSubmit) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
}