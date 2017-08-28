// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import type { Children } from 'react';
import { history } from '../store/configureStore';

export default class App extends Component {
  props: {
    children: Children
  };

  static isConfigured() {
    // if (arg) {
    //   history.push('/home');
    // } else {
    //   history.push('/first-time-config');
    // }
    history.push('/home');
  }

  static sendNotification(event, arg) {
    new Notification(arg.title, {
      body: arg.body
    });
  }
  componentDidMount() {
    ipcRenderer.once('is-first-time', App.isConfigured);
    ipcRenderer.send('is-first-time');
    ipcRenderer.send('initialize-tracking');
    ipcRenderer.on('notification', App.sendNotification);
    ipcRenderer.send('notification');
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
