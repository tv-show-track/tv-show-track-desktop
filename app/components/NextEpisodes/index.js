// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import Wrapper from './Wrapper';


export default class NextEpisodes extends Component {

  constructor() {
    super();

    ipcRenderer.send('get-calendar');
  }

  render() {
    const twoDigits = nb => ((`0${nb}`).slice(-2));
    return (
      <Wrapper>
        <h3>- Next episodes to watch -</h3>
        <div className="next-episodes">
        {
          this.props.data.map((object) => (
            <div className="next-episode" key={`item-${object.episode.ids.trakt}`}>
              { object.show.title } <span className="red">{ object.episode.season }x{ twoDigits(object.episode.number) }</span> - { object.episode.title }
            </div>
          ))
        }
        </div>
      </Wrapper>
    );
  }
}
