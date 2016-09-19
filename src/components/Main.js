'use strict';

import React from 'react';

import 'whatwg-fetch';

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

const baseUrl = window.location.hostname == 'localhost' ? 'http://localhost:4000' : 'https://tracks23.herokuapp.com';

const indexOfDeep = (array, check) => {
  const checkString = check.toString();
  for (let i = 0; i < array.length; i++) {
    if (array[i].toString() == checkString) return i;
  }
  return -1;
}

export default class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      current: [],
      tags: {
        singles: [],
        combos: []
      },
      pane: 'Middle'
    };

    this._postEvent  = this._postEvent.bind(this);
    this._onKeyPress = this._onKeyPress.bind(this);

    this._getTags();
  }

  _postEvent() {
    const { current, tags } = this.state;

    fetch(`${baseUrl}/event`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        timestamp: new Date().getTime(),
        tags: current
      })
    })
    .then(response => {
      if (current.length > 1) {
        if (indexOfDeep(tags.combos, current) == -1) tags.combos.push({tags: current});
      } else {
        if (indexOfDeep(tags.singles, current) == -1) tags.singles.push({tags: current});
      }
      this.setState({
        tags: tags,
        value: '',
        current: []
      });
    });
  }

  _getTags() {
    fetch(`${baseUrl}/tags`, {
      method: 'GET',
      headers: headers
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      this.setState({
        tags: response
      });
    });
  }

  _addTags(tags, callback = null) {
    const { current } = this.state;

    this.setState({
      current: current.concat(tags).sort((a, b) => a < b ? -1 : 1)
    }, callback);
  }

  _removeTag(tag) {
    let { current } = this.state;

    current.splice(current.indexOf(tag), 1);

    this.setState({
      current: current
    });
  }

  _onKeyPress(e) {
    const { tagInput } = this.refs;

    if (e.key == 'Enter') {
      this._addTags([tagInput.value], () => {
        tagInput.value = '';
      });
    }
  }

  _togglePane(pane) {
    this.setState({
      pane: pane
    }, () => {
      if (this.state.pane == 'Right') {
        setTimeout(() => {this.refs.tagInput.focus(); }, 250);
      }
    });
  }

  render() {
    const { value, tags, current, pane } = this.state;

    const invalidTags = ['start', 'stop'];

    return (
      <div className="Main">
        <div className="newEventCreation">
          <div className="currentTags">
            { current.map((tag, i) => {
              return (
                <div key={ `${i}-${tag}` } onClick={ this._removeTag.bind(this, tag) }>
                  { tag }
                </div>
              )
            }) }
          </div>
          <div className="sendEvent" type="button" onClick={ this._postEvent } value="Add">
            <i className="fa fa-paw"></i>
            <i className="fa fa-paw"></i>
            <i className="fa fa-paw"></i>
            <i className="fa fa-paw"></i>
          </div>
        </div>
        <div className={ `previouslyUsedTags slidePane slidePane${ pane }` }>
          <div className="slidePaneTabs">
            <div onClick={ this._togglePane.bind(this, 'Left') }>Singles</div>
            <div onClick={ this._togglePane.bind(this, 'Middle') }>Combos</div>
            <div onClick={ this._togglePane.bind(this, 'Right') }>New</div>
          </div>
          <div className="slidePane--Slider">
            <div className="singles">
              { tags.singles.map((item, i) => {
                return (
                  <div key={ i } className="tagList" onClick={ this._addTags.bind(this, item.tags, null) }>
                    { item.tags.map((tag, i) => <div key={ `${i}-${tag}` }>{ tag }</div>) }
                  </div>
                )
              }) }
            </div>
            <div className="combos">
              { tags.combos.map((item, i) => {
                const validTag = (invalidTags.indexOf(item.tags) == -1) ? null : item.tags;
                return (
                  <div key={ i } className="tagList" onClick={ this._addTags.bind(this, item.tags, null) }>
                    <div className="tagList--list">
                      { item.tags.map((tag, i) => (invalidTags.indexOf(tag.toLowerCase()) == -1) ? <div key={ `${i}-${tag}` }>{ tag }</div> : null) }
                    </div>
                    { item.tags.indexOf('Start') >= 0 ? <div className="tagList--button"><i className="fa fa-play"></i></div> : null }
                    { item.tags.indexOf('Stop') >= 0 ? <div className="tagList--button"><i className="fa fa-stop"></i></div> : null }
                  </div>
                )
              }) }
            </div>
            <div className="new">
              <input className="newTagInput" type="text" ref="tagInput" onKeyPress={ this._onKeyPress } />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
