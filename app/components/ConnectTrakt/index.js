// @flow
import { shell, ipcRenderer } from 'electron';
import React, { Component } from 'react';

import { history } from '../../store/configureStore';

import Wrapper from './Wrapper';
import Button from '../Button';

export default class ConnectTrakt extends Component {

  state: {
    poll: {
      user_code: string,
      verification_url: string,
      interval: number,
      expires_in: number,
      device_code: string
    },
    expireInterval: any,
    statusMsg: string
  };

  constructor() {
    super();

    this.state = {
      poll: {
        user_code: '',
        verification_url: '',
        interval: 0,
        expires_in: 0,
        device_code: ''
      },
      expireInterval: null,
      statusMsg: ''
    };
  }

  componentDidMount() {
    ipcRenderer.removeAllListeners('trakt-connected');
    ipcRenderer.removeAllListeners('connect-trakt-error');

    ipcRenderer.on('connect-trakt-error', (event, statusMsg) => {
      console.log('connect-trakt-error', statusMsg, this.state.poll);
      this.setState({ statusMsg });
    });

    ipcRenderer.once('trakt-connected', () => {
      history.goBack()
    });

    if (this.expireInterval) {
      clearInterval(this.expireInterval);
    }

    ipcRenderer.once('trakt-connecting', (event, poll) => {
      this.setState({ poll });

      this.expireInterval = setInterval(() => {
        const updatedPoll = poll;
        updatedPoll.expires_in = poll.expires_in - 1;
        this.setState({ poll: updatedPoll });
        if (updatedPoll.expires_in === 1) {
          history.goBack()
        }
      }, 1000);
    });

    ipcRenderer.send('connect-trakt');
  }

  render() {
    return (
      <Wrapper>
        { this.state.poll.user_code && !this.state.statusMsg &&
          <div>
            <h3>Connecting to Trakt.tv</h3>
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
          </div>
        }
        {
          (this.state.statusMsg || !this.state.poll.user_code) &&
          <div className="status-msg">{ this.state.statusMsg || 'Connecting...' }</div>
        }
        <Button
          type="button"
          onClick={() => history.goBack()}
        >Cancel</Button>
      </Wrapper>
    );
  }
}
