import store from './redux/reduxStore'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import AuthComponent from './components/AuthComponent';

ReactDOM.render(
    <Provider store = {store}>
        <BrowserRouter>
            <Switch>
                <Route path = '/login' component = { AuthComponent }/>
                <Route path = '/room' component = { App } />
                <Redirect  from = '*' to = '/room'/>
                <Redirect exact from = '/' to = '/room'/>
            </Switch>
        </BrowserRouter>
    </Provider>
, document.getElementById('root'));

serviceWorker.unregister();
