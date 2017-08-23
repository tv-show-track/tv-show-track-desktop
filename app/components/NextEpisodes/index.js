// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import { history } from '../../store/configureStore';
import Wrapper from './Wrapper';
import SetViewButton from '../SetViewButton';


export default class NextEpisodes extends Component {

  constructor() {
    super();

    this.state = {
      connected: false
    };

    ipcRenderer.send('get-calendar');
  }

  state = {
    connected: React.PropTypes.bool
  };

  componentDidMount() {
    ipcRenderer.once('trakt-connected', () => {
      this.setTraktConnected();
    });
    ipcRenderer.send('is-trakt-connected');
  }

  setTraktConnected() {
    this.setState({ connected: true });
  }

  render() {
    const twoDigits = nb => ((`0${nb}`).slice(-2));
    return (
      <Wrapper>
        <h3>- Next episodes to watch -</h3>
        <div className="next-episodes">
          {
            this.state.connected && this.props.data && this.props.data.map((object) => (
              object && object.ids &&
                <div className="next-episode" key={`item-${object.ids.trakt}`}>
                  <div className="episode-title">
                    <div>
                      { object.show.title } <span className="red">{ object.season }x{ twoDigits(object.number) }</span> - { object.title }
                    </div>
                  </div>
                  <div className="set-episode-as-viewed">
                    <SetViewButton ids={object.ids} />
                  </div>
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
