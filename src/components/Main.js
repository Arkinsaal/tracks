'use strict';

import React from 'react';

import 'whatwg-fetch';

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

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
      }
    };

    this._postEvent  = this._postEvent.bind(this);
    this._onKeyPress = this._onKeyPress.bind(this);

    this._getTags();
  }

  _postEvent() {
    const { current, tags } = this.state;

    fetch('http://localhost:4000/event', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        timestamp: new Date().getTime(),
        tags: current
      })
    })
    .then(response => {
      if (current.length > 1) {
        if (indexOfDeep(tags.combos, current) == -1) tags.combos.push(current);
      } else {
        if (indexOfDeep(tags.singles, current) == -1) tags.singles.push(current);
      }
      this.setState({
        tags: tags,
        value: '',
        current: []
      });
    });
  }

  _getTags() {
    fetch('http://localhost:4000/tags', {
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
    });
  }

  render() {
    const { value, tags, current, pane } = this.state;

    return (
      <div className="Main">
        <div className="newEventCreation">
          <div className="currentTags">
            { current.map((tag, i) => {
              return (
                <div key={ `${i}-${tag}` }>
                  { tag }
                  <span onClick={ this._removeTag.bind(this, tag) }>X</span>
                </div>
              )
            }) }
          </div>
          <input type="text" ref="tagInput" onKeyPress={ this._onKeyPress } />
          <input type="button" onClick={ this._postEvent } />
        </div>
        <div className={ `previouslyUsedTags slidePane slidePane${ pane }` }>
          <div className="slidePaneTabs">
            <div onClick={ this._togglePane.bind(this, 'Left') }>Singles</div>
            <div onClick={ this._togglePane.bind(this, 'Right') }>Combos</div>
          </div>
          <div className="slidePane--Slider">
            <div className="singles">
              { tags.singles.map((tags, i) => {
                return (
                  <div key={ i } className="tagList" onClick={ this._addTags.bind(this, tags, null) }>
                    { tags.map((tag, i) => <div key={ `${i}-${tag}` }>{ tag }</div>) }
                  </div>
                )
              }) }
            </div>
            <div className="combos">
              { tags.combos.map((tags, i) => {
                return (
                  <div key={ i } className="tagList" onClick={ this._addTags.bind(this, tags, null) }>
                    { tags.map((tag, i) => <div key={ `${i}-${tag}` }>{ tag }</div>) }
                  </div>
                )
              }) }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
