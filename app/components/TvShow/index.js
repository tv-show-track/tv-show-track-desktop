// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import Wrapper from './Wrapper';
import Infos from './Infos';
import PauseIcon from './PauseIcon';
import PlayIcon from './PlayIcon';
import ProgressionBar from './ProgressionBar';

export default class TvShow extends Component {

  constructor() {
    super();

    this.state = {
      progression: {
        pc: 0
      }
    };
  }

  state = {
    progression: {
      pc: React.PropTypes.number
    }
  }

  componentDidMount() {
    ipcRenderer.on('progression', (event, arg) => {
      if (arg && arg.pc) {
        this.setState({ progression: arg });
        console.log('set state progression', this.state);
      }
    });
    ipcRenderer.send('watch-progression');
  }

  render() {
    return (
      <Wrapper bgImage={this.props.video && this.props.video.images && this.props.video.images.background}>
        <Infos>
          <h2>{ this.props.video.title }</h2>
          {/* <PlayIcon />
          <PauseIcon /> */}
        </Infos>
        <ProgressionBar pc={this.state.progression.pc} />
      </Wrapper>
    );
  }
}
