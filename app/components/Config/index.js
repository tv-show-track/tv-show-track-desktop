// @flow
import { shell, ipcRenderer } from 'electron';
import React, { Component } from 'react';

import { history } from '../../store/configureStore';
import Wrapper from './Wrapper';

export default class Config extends Component {
  state: {
    connected: boolean,
    connecting: boolean,
    poll: {
      user_code: string,
      verification_url: string,
      interval: number,
      expires_in: number,
      device_code: string
    }
  };

  constructor() {
    super();

    this.state = {
      connected: false,
      connecting: false,
      poll: {
        user_code: '',
        verification_url: '',
        interval: 0,
        expires_in: 0,
        device_code: ''
      }
    };

    ipcRenderer.on('trakt-connected', () => {
      this.setTraktConnected();
    });
  }

  connectToTrakt() {
    this.setState({ connecting: true, connected: false });
    ipcRenderer.on('trakt-connecting', (event, poll) => {
      console.log('poll', poll);
      this.setState({ poll });
      setInterval(() => {
        const updatedPoll = poll;
        updatedPoll.expires_in = poll.expires_in - 1;
        this.setState({ poll: updatedPoll });
        if (updatedPoll.expires_in === 1) {
          this.setState({ connecting: false });
        }
      }, 1000);
    });
    ipcRenderer.send('connect-trakt');
  }

  setTraktConnected() {
    this.setState({ connecting: false, connected: true });
    setTimeout(() => history.push('/home'), 2000);
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
            <i>Connecting to Trakt.tv ...</i>
            <ul>
              <li>1 - Go to <a role="link" onClick={() => shell.openExternal(this.state.poll.verification_url)}>
                { this.state.poll.verification_url }
              </a></li>
              <li className="code-wrapper">
                <div>2 - Copy/paste this code:</div>
                <div className="code">{ this.state.poll.user_code }</div>
                <i>Expires in <span>{ this.state.poll.expires_in }</span></i>
              </li>
              <li>3 - Allow tvshowtrack to use your account</li>
            </ul>
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
