// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import TvShow from '../TvShow';
import NextEpisodes from '../NextEpisodes';
import Wrapper from './Wrapper';
import NoVideoWrapper from './NoVideoWrapper';

export default class Home extends Component {

  constructor() {
    super();

    this.state = {
      video: {},
      watchNext: []
    };

    ipcRenderer.on('new-current-video', (event, arg) => {
      this.onNewVideo(arg);
    });
    ipcRenderer.send('watch-current-video');

    console.log('contructor Home');
  }

  state = {
    video: React.PropTypes.any,
    watchNext: React.PropTypes.array
  };

  componentDidMount() {
    console.log('componentDidMount Home');
    ipcRenderer.on('calendar', (event, arg) => {
      if (arg) {
        console.log('calendar', arg);
        this.onNewWatchNext(arg);
      }
    });
    ipcRenderer.send('get-calendar');
  }

  onNewVideo(video: any) {
    this.setState({ video });
  }

  onNewWatchNext(watchNext: any) {
    this.setState({ watchNext });
  }

  render() {
    return (
      <Wrapper>
        { (!this.state.video || (this.state.video && !this.state.video.title)) &&
          <NoVideoWrapper>
            <div className="title">
              <h2>TV Show Track</h2>
              <p>No video detected</p>
            </div>
            { this.state.watchNext &&
              <NextEpisodes data={this.state.watchNext} />
            }
          </NoVideoWrapper>
        }
        { this.state.video && this.state.video.title &&
          <TvShow video={this.state.video} />
        }
      </Wrapper>
    );
  }
}
