// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import Config from 'components/Config';
import Wrapper from './Wrapper';

export default class FirstTimeConfig extends Component {
  render() {
    return (
      <Wrapper>
        <h2>TV Show Track</h2>
        <p>First-time configuration</p>
        <Config />
      </Wrapper>
    );
  }
}
