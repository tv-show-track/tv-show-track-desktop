// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import { history } from '../../store/configureStore';
import Wrapper from './Wrapper';


export default class NextEpisodes extends Component {

  constructor() {
    super();

    this.state = {
      connected: false
    };

    ipcRenderer.send('get-calendar');
    ipcRenderer.once('trakt-connected', () => {
      this.setTraktConnected();
    });
    ipcRenderer.send('is-trakt-connected');
  }

  state = {
    connected: React.PropTypes.bool
  };

  setTraktConnected() {
    console.log('setTraktConnected');
    this.setState({ connected: true });
  }

  render() {
    const twoDigits = nb => ((`0${nb}`).slice(-2));
    return (
      <Wrapper>
        <h3>- Next episodes to watch -</h3>
        <div className="next-episodes">
        {
          this.state.connected && this.props.data.map((object) => (
            <div className="next-episode" key={`item-${object.episode.ids.trakt}`}>
              { object.show.title } <span className="red">{ object.episode.season }x{ twoDigits(object.episode.number) }</span> - { object.episode.title }
            </div>
          ))
        }
        { !this.state.connected &&
          <i className="connect-first"><a onClick={() => history.push('/settings')}>Connect your Trakt.tv account</a> to see next episodes</i>
        }
        </div>
      </Wrapper>
    );
  }
}
