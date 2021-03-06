// @flow
import { shell, ipcRenderer } from 'electron';
import React, { Component } from 'react';

import { history } from '../../store/configureStore';
import Wrapper from './Wrapper';

import Button from '../Button';

export default class ConnectTraktButton extends Component {

  state: {
    connected: boolean
  };

  static connectToTrakt() {
    if (navigator.onLine) {
      history.push('/connect-trakt');
    } else {
      alert('Sorry but it seems that you are not connected to internet and you need it to connect to Trakt.tv');
    }
  }

  constructor() {
    super();

    this.state = {
      connected: false
    };

    ipcRenderer.once('trakt-connected', () => {
      this.setConnected();
    });
    ipcRenderer.send('is-trakt-connected');
  }

  disconnect() {
    ipcRenderer.on('trakt-disconnected', () => {
      this.setDisconnected();
    });
    ipcRenderer.send('disconnect-trakt');
  }

  setConnected() {
    this.setState({ connected: true });
  }

  setDisconnected() {
    this.setState({ connected: false });
  }

  render() {
    return (
      <Wrapper>
        { !this.state.connected &&
          <Button
            type="button"
            onClick={() => ConnectTraktButton.connectToTrakt()}
          >Connect to Trakt.tv</Button>
        }
        { this.state.connected &&
          <div>You are connected to Trakt.tv - <a role="link" onClick={() => this.disconnect()}>disconnect</a></div>
        }
      </Wrapper>
    );
  }
}
