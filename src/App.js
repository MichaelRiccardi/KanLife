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

type Props = {};

type State = {
  columns: Array<Object>,
  cards: Array<Object>,
  labels: Array<Object>
};

class App extends Component<Props, State> {
  constructor(props) {
    super();
    this.state = {
      columns: [
        { title: "Open", id: "598fa1bee1a7e2a5587befc3" },
        { title: "Scheduled", id: "598fa1c7ddb0ea0cc4c5773e" },
        { title: "In Progress", id: "598fa2fe443be451928c95d3" },
        { title: "On Hold", id: "598fa30575e5b628c02ea25b" },
        { title: "Done", id: "598fa308e4d27b60e4f31afd" }
      ],
      cards: [],
      labels: []
    };
  }

  componentDidMount() {
    this.poll();
    this.getLabels();
  }

  getLabels() {
    jQuery
      .get(
        "https://api.trello.com/1/boards/kNrLkVPc/?labels=all&fields=id&key=" +
          Authentication.TrelloKey +
          "&token=" +
          Authentication.TrelloToken
      )
      .then(result => {
        let labels = result.labels;
        labels.sort(function(a, b) {
          return a.name.localeCompare(b.name);
        });
        this.setState({ labels });
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
                title={column.title}
                className={column.title}
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
