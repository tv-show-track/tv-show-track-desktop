// @flow
import { ipcRenderer, remote } from 'electron';
import React, { Component } from 'react';
import getUsername from 'username';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { history } from '../../store/configureStore';

import Wrapper from './Wrapper';
import Button from '../Button';
import ConnectTraktButton from '../ConnectTraktButton';
import vlcLogo from '../../assets/vlc.png';

export default class Config extends Component {

  static resetSettings() {
    ipcRenderer.on('settings-reseted', () => {
      history.push('/first-time-config');
    });
    ipcRenderer.send('reset-settings');
  }

  constructor() {
    super();

    this.state = {
      vlcConfigured: false,
      vlcInstalled: false,
      vlcCheckLoading: false,
      tabIndex: 0
    };
  }

  state = {
    vlcConfigured: React.PropTypes.bool,
    vlcInstalled: React.PropTypes.bool,
    vlcCheckLoading: React.PropTypes.bool,
    tabIndex: React.PropTypes.number
  }

  componentDidMount() {
    this.checkVLC();
    this.onMount();
  }

  onMount() {
    if (this.props && this.props.tab) {
      this.setState({ tabIndex: parseInt(this.props.tab, 10) });
    }
  }

  checkVLC() {
    ipcRenderer.on('vlc-checked', (event, arg) => {
      console.log('vlc-checked', arg);
      if (arg) {
        this.setState({
          vlcConfigured: arg.configured,
          vlcInstalled: arg.installed
        });
      }

      this.setState({ vlcCheckLoading: false });
    });
    ipcRenderer.on('vlc-configure-error', (event, arg) => {
      console.error(JSON.stringify(arg));
    });
    this.setState({ vlcCheckLoading: true });
    ipcRenderer.send('check-vlc');
  }

  selectVlcConfigFile() {
    getUsername().then(username => {
      const { dialog } = remote;
      return dialog.showOpenDialog({
        buttonLabel: 'Select VLC config file',
        defaultPath: `/Users/${username}/Library/Preferences/org.videolan.vlc`,
        properties: ['openFile']
      }, path => {
        if (path && path.length) {
          ipcRenderer.on('vlc-config-path-setted', () => {
            this.checkVLC();
          });
          ipcRenderer.send('set-vlc-config-path', path[0]);
        }
      });
    }).catch(console.error);
  }

  render() {
    return (
      <Wrapper>
        <Tabs
          onSelect={tabIndex => this.setState({ tabIndex })}
          selectedIndex={this.state.tabIndex}
        >
          <TabList>
            <Tab>General</Tab>
            <Tab>Media Players</Tab>
            <Tab>3rd Parties</Tab>
          </TabList>

          <TabPanel>
            <Button onClick={() => Config.resetSettings()}>Reset Settings</Button>
          </TabPanel>
          <TabPanel>
            { this.state.vlcCheckLoading &&
              <i className="fa fa-spinner fa-pulse fa-fw" />
            }
            { !this.state.vlcCheckLoading && !this.state.vlcInstalled &&
              <div className="vlc">
                <img src={vlcLogo} alt="vcl logo" width="30px" />
                <i>VLC is not found. Install VLC to activate tracking on it. <a onClick={() => this.checkVLC()}>Re-check</a></i>
              </div>
            }
            { !this.state.vlcCheckLoading && this.state.vlcInstalled && !this.state.vlcConfigured &&
              <div className="vlc">
                <img src={vlcLogo} alt="vcl logo" width="30px" />
                <i>
                  VLC config file not found. <br />
                  Please launch VLC a first time then quit it and finally select your vlcrc file. <a onClick={() => this.checkVLC()}>Re-check</a>
                </i>
                <Button onClick={() => this.selectVlcConfigFile()}>
                  Select VLC config file
                </Button>
              </div>
            }
            { !this.state.vlcCheckLoading && this.state.vlcInstalled && this.state.vlcConfigured &&
              <div className="vlc">
                <img src={vlcLogo} alt="vcl logo" width="30px" />
                <i>VLC is installed and configured !</i>
              </div>
            }
          </TabPanel>
          <TabPanel>
            <ConnectTraktButton />
          </TabPanel>
        </Tabs>
      </Wrapper>
    );
  }
}
