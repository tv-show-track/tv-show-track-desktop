// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import Wrapper from './Wrapper';
import ConnectTraktButton from '../ConnectTraktButton';
import vlcLogo from '../../assets/vlc.png';

export default class Config extends Component {

  static checkVLC() {
    ipcRenderer.on('vlc-checked', () => {
      ipcRenderer.send('is-vlc-installed');
      ipcRenderer.send('is-vlc-configured');
    });
    ipcRenderer.on('vlc-configure-error', (event, arg) => {
      alert(JSON.stringify(arg));
    });
    ipcRenderer.send('check-vlc');
  }

  constructor() {
    super();

    this.state = {
      vlcConfigured: false,
      vlcInstalled: false
    };
  }

  state = {
    vlcConfigured: React.PropTypes.bool,
    vlcInstalled: React.PropTypes.bool
  }

  componentDidMount() {
    ipcRenderer.on('vlc-configured', () => {
      this.setState({
        vlcConfigured: true,
        vlcInstalled: true
      });
    });
    ipcRenderer.on('vlc-installed', () => {
      this.setState({
        vlcInstalled: true
      });
    });
    ipcRenderer.send('is-vlc-installed');
    ipcRenderer.send('is-vlc-configured');
  }

  render() {
    return (
      <Wrapper>
        {
          !this.state.vlcInstalled &&
            <div className="vlc">
              <img src={vlcLogo} alt="vcl logo" width="30px" />
              <i>VLC is not found or is not configured. Please install VLC then launch VLC a first time then close it. <a onClick={() => Config.checkVLC()}>Re-check</a></i>
            </div>
        }
        {
          this.state.vlcInstalled && this.state.vlcConfigured &&
            <div className="vlc">
              <img src={vlcLogo} alt="vcl logo" width="30px" />
              <i>VLC is installed and configured !</i>
            </div>
        }
        <ConnectTraktButton />
      </Wrapper>
    );
  }
}
