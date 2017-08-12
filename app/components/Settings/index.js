// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ipcRenderer } from 'electron';

import { history } from '../../store/configureStore';

import Config from '../Config';
import Wrapper from './Wrapper';
import ConfigWrapper from './ConfigWrapper';
import Button from '../Button';

export default class SettingsPage extends Component {

  static resetSettings() {
    ipcRenderer.on('settings-reseted', () => {
      history.push('/first-time-config');
    });
    ipcRenderer.send('reset-settings');
  }

  render() {
    return (
      <Wrapper>
        <Link to="/home" className="back">
          <i className="fa fa-arrow-left" aria-hidden="true" />
        </Link>
        <div className="title">
          <h2>Settings</h2>
        </div>
        <ConfigWrapper>
          <Config />
        </ConfigWrapper>
        <Button onClick={() => SettingsPage.resetSettings()}>Reset Settings</Button>
      </Wrapper>
    );
  }
}
