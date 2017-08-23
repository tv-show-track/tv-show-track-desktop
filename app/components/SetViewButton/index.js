// @flow
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';

import Wrapper from './Wrapper';

export default class NextEpisodes extends Component {

  constructor() {
    super();

    this.state = {
      isOver: false,
      loading: false
    };
  }

  state = {
    isOver: React.PropTypes.bool,
    loading: React.PropTypes.bool
  };

  onClick() {
    this.setState({ loading: true });
    ipcRenderer.once('setted-as-viewed', () => {
      ipcRenderer.send('get-calendar');
      this.setState({ loading: false });
    });
    ipcRenderer.send('set-as-viewed', this.props.ids);
  }

  onMouseOver() {
    this.setState({ isOver: true });
  }

  onMouseLeave() {
    this.setState({ isOver: false });
  }

  render() {
    return (
      <Wrapper
        onMouseOver={() => this.onMouseOver()}
        onMouseLeave={() => this.onMouseLeave()}
        onClick={() => this.onClick()}
      >
        { this.state.loading &&
          <i className="fa fa-spinner fa-pulse fa-fw" />
        }
        { !this.state.loading &&
          <div>
            <i className="fa fa-eye" aria-hidden="true" />
            { this.state.isOver &&
              <span> ✓</span>
            }
          </div>
        }

      </Wrapper>
    );
  }
}
