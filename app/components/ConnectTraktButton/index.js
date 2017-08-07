// @flow
import { shell, ipcRenderer } from 'electron';
import React, { Component } from 'react';

import { history } from '../../store/configureStore';
import Wrapper from './Wrapper';

import Button from '../Button';

export default class ConnectTraktButton extends Component {

  state: {
    connected: boolean,
    connecting: boolean
  };

  constructor() {
    super();

    this.state = {
      connected: false,
      connecting: false
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
    this.setState({ connecting: false, connected: true });
  }

  setDisconnected() {
    this.setState({ connecting: false, connected: false });
  }

  render() {
    return (
      <Wrapper>
        { !this.state.connected && !this.state.connecting &&
          <Button
            type="button"
            onClick={() => history.push('/connect-trakt')}
          >Connect to Trakt.tv</Button>
        }
        { this.state.connected &&
          <div>You are connected to Trakt.tv - <a role="link" onClick={() => this.disconnect()}>disconnect</a></div>
        }
      </Wrapper>
    );
  }
}
