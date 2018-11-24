// @flow

import React, { Component } from "react";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/font-awesome/css/font-awesome.min.css";

import Authentication from "./authentication.js";
import jQuery from "jquery";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

import Column from "./Column.js";
import type ColumnType from "./Column.js";

type Props = {};

type LabelType = {
  name: string,
  id: string,
};

type State = {
  columns: Array<ColumnType>,
  cards: Array<Object>,
  labels: Array<LabelType>,
};

class App extends Component<Props, State> {
  constructor(props) {
    super();
    this.state = {
      columns: [],
      cards: [],
      labels: [],
    };
  }

  componentDidMount() {
    this.poll();
    this.getColumnsAndLabels();
  }

  getColumnsAndLabels() {
    jQuery
      .get(
        "https://api.trello.com/1/boards/kNrLkVPc/?labels=all&lists=open&key=" +
          Authentication.TrelloKey +
          "&token=" +
          Authentication.TrelloToken
      )
      .then(result => {
        let labels = result.labels;
        labels.sort(function(a, b) {
          return a.name.localeCompare(b.name);
        });
        const columns = result.lists;
        this.setState({ labels, columns });
      });
  }

  poll = () => {
    jQuery
      .get(
        "https://api.trello.com/1/boards/kNrLkVPc/cards?fields=name,desc,due,labels,idList&key=" +
          Authentication.TrelloKey +
          "&token=" +
          Authentication.TrelloToken
      )
      .then(result => {
        result.sort(function(a, b) {
          var aDue = a.due ? new Date(a.due).getTime() : 0;
          var bDue = b.due ? new Date(b.due).getTime() : 0;
          return aDue - bDue;
        });
        this.setState({ cards: [] });
        this.setState({ cards: result });
      });
  };

  hideCard = (id: string) => {
    var cardIndex = this.state.cards
      .map(function(card) {
        return card.id;
      })
      .indexOf(id);
    if (cardIndex > -1) {
      this.state.cards.splice(cardIndex, 1);
    } else {
      alert("Error: Tried to hide a non-existant card.");
    }
  };

  render() {
    return (
      <div className="root">
        <div className="container-fluid" id="board">
          <div className="row">
            {this.state.columns.map(column => (
              <Column
                title={column.name}
                className={column.name}
                key={column.id}
                id={column.id}
                cards={this.state.cards}
                poll={this.poll}
                hideCard={this.hideCard}
                labels={this.state.labels}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);
