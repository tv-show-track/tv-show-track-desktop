// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

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
            <Link to="/settings" className="settings">
              <i className="fa fa-cog" aria-hidden="true" />
            </Link>
            <div className="title">
              <h2 data-text="TV Show Track">TV Show Track</h2>
              <i>No video detected</i>
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
