// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import Wrapper from './Wrapper';

export default class Config extends Component {
  state: {
    connected: boolean,
    connecting: boolean
  };

  constructor() {
    super();

    this.state = {
      connected: false,
      connecting: false,
    };

    ipcRenderer.on('trakt-connected', () => {
      this.setTraktConnected();
    });
  }

  connectToTrakt() {
    this.setState({ connecting: true, connected: false });
    ipcRenderer.send('connect-trakt');
  }

  setTraktConnected() {
    this.setState({ connecting: false, connected: true });
  }

  render() {
    return (
      <Wrapper>
        { !this.state.connected && !this.state.connecting &&
          <button
            type="button"
            onClick={() => this.connectToTrakt()}
          >Connect to Trakt.tv</button>
        }
        { this.state.connecting &&
          <div className="trakt-wrapper">
            <div>Connecting to Trakt.tv ...</div>
            <button
              type="button"
              onClick={() => this.setState({ connecting: false })}
            >Cancel</button>
          </div>
        }
        { this.state.connected &&
          <div>Trakt.tv is now connected!</div>
        }
      </Wrapper>
    );
  }
}
