// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Config from '../Config';
import Wrapper from './Wrapper';
import ConfigWrapper from './ConfigWrapper';

export default class SettingsPage extends Component {
  render() {
    return (
      <Wrapper>
        <Link to="/home" className="back">
          <i className="fa fa-times" aria-hidden="true" />
        </Link>
        <div className="title">
          <h2>Settings</h2>
        </div>
        <ConfigWrapper>
          <Config />
        </ConfigWrapper>
      </Wrapper>
    );
  }
}
