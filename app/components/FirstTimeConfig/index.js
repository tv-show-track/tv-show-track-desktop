// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import { history } from '../../store/configureStore';
import Config from '../Config';
import Wrapper from './Wrapper';
import Title from '../Title';

export default class FirstTimeConfig extends Component {

  constructor() {
    super();

    ipcRenderer.once('is-configured', () => {
      history.push('/home');
    });
    ipcRenderer.send('is-configured');
  }

  render() {
    return (
      <Wrapper>
        <div>
          <Title data-text="TV Show Track">TV Show Track</Title>
          <p>First-time configuration</p>
        </div>
        <Config />
      </Wrapper>
    );
  }
}
