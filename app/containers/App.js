// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import type { Children } from 'react';
import { history } from '../store/configureStore';

export default class App extends Component {
  props: {
    children: Children
  };

  static isConfigured(event, arg) {
    if (arg) {
      history.push('/home');
    } else {
      history.push('/first-time-config');
    }
  }

  componentDidMount() {
    ipcRenderer.on('is-configured', App.isConfigured);
    ipcRenderer.send('is-configured');
    ipcRenderer.send('initialize-tracking');
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
