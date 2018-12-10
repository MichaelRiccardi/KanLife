// @flow

import React, { Component } from "react";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/font-awesome/css/font-awesome.min.css";

import Authentication from "./authentication.js";
import jQuery from "jquery";

import Column from "./Column.js";
import type { ColumnType } from "./Column.js";
import type { CardType } from "./Card.js";

type Props = {};

export type LabelType = {
  name: string,
  id: string,
};

type State = {
  columns: Array<ColumnType>,
  cards: Array<CardType>,
  labels: Array<LabelType>,
};

class App extends Component<Props, State> {
  constructor() {
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

  deleteCard = (id: string) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      const cardIndex = this.state.cards.map(card => card.id).indexOf(id);

      if (cardIndex === -1) {
        alert("Error: Tried to delete a non-existent card.");
      } else {
        let cards = [...this.state.cards];
        cards.splice(cardIndex, 1);
        this.setState({ cards });

        jQuery.ajax({
          type: "DELETE",
          url: "https://api.trello.com/1/cards/" + id,
          data: {
            key: Authentication.TrelloKey,
            token: Authentication.TrelloToken,
          },
          success: () => {}, // Success is assumed
          error: xhr => {
            this.poll(); // Reload cards on error
            alert("Error deleting card: " + xhr.responseText);
          },
        });
      }
    }
  };

  dropCard = (event: DragEvent, columnId: string): void => {
    event.preventDefault();
    const cardId = event.dataTransfer ? event.dataTransfer.getData("text") : "";
    const cardIndex = this.state.cards.map(card => card.id).indexOf(cardId);

    if (cardIndex === -1) {
      alert("Error: Tried to drop a non-existent card.");
    } else {
      let cards = [...this.state.cards];

      if (cards[cardIndex].idList !== columnId) {
        cards[cardIndex].idList = columnId;
        this.setState({ cards });

        jQuery.ajax({
          type: "PUT",
          url: "https://api.trello.com/1/cards/" + cardId,
          data: {
            key: Authentication.TrelloKey,
            token: Authentication.TrelloToken,
            idList: columnId,
          },
          success: () => {}, // Success is assumed
          error: xhr => {
            this.poll(); // Reload cards on error
            alert("Error moving card: " + xhr.responseText);
          },
        });
      }
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
                cards={this.state.cards.filter(
                  card => card.idList === column.id
                )}
                poll={this.poll}
                dropCard={this.dropCard}
                deleteCard={this.deleteCard}
                labels={this.state.labels}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
