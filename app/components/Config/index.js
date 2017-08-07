// @flow
import { shell, ipcRenderer } from 'electron';
import React, { Component } from 'react';

import { history } from '../../store/configureStore';
import Wrapper from './Wrapper';
import ConnectTraktButton from '../ConnectTraktButton';

export default class Config extends Component {
  constructor() {
    super();
    this.props = {
      firstTime: React.PropTypes.bool,
    };
  }

  render() {
    return (
      <Wrapper>
        <ConnectTraktButton />
      </Wrapper>
    );
  }
}
