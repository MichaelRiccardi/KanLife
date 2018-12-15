// @flow

import React, { Component } from "react";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/font-awesome/css/font-awesome.min.css";

import Trello from "./Trello.js";
import GoogleCalendar from "./GoogleCalendar.js";
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
  gapi: ?any,
  isGoogleCalendarAuthorized: boolean,
};

class App extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      columns: [],
      cards: [],
      labels: [],
      gapi: null,
      isGoogleCalendarAuthorized: true,
    };
  }

  componentDidMount() {
    this.loadGoogleCalendarAPI();
    this.poll();
    this.getColumnsAndLabels();
  }

  loadGoogleCalendarAPI() {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/client.js";

    script.onload = () => {
      window.gapi.load("client:auth2", () => {
        window.gapi.client
          .init({
            apiKey: GoogleCalendar.ApiKey,
            clientId: GoogleCalendar.ClientId,
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            ],
            scope: "https://www.googleapis.com/auth/calendar",
          })
          .then(
            async () => {
              await this.setState({
                gapi: window.gapi,
                isGoogleCalendarAuthorized: window.gapi.auth2
                  .getAuthInstance()
                  .isSignedIn.get(),
              });
              window.gapi.auth2
                .getAuthInstance()
                .isSignedIn.listen(isGoogleCalendarAuthorized => {
                  this.setState({ isGoogleCalendarAuthorized });
                });
            },
            error => {
              alert(JSON.stringify(error));
            }
          );
      });
    };

    document.body && document.body.appendChild(script);
  }

  getColumnsAndLabels() {
    jQuery
      .get("https://api.trello.com/1/boards/" + Trello.Board, {
        lists: "open",
        labels: "all",
        key: Trello.Key,
        token: Trello.Token,
      })
      .then(result => {
        const columns = result.lists;
        let labels = result.labels;
        labels.sort(function(a, b) {
          return a.name.localeCompare(b.name);
        });
        this.setState({ columns, labels });
      });
  }

  poll = async () => {
    await jQuery
      .get("https://api.trello.com/1/boards/" + Trello.Board + "/cards", {
        fields: ["name", "desc", "due", "labels", "idList"],
        key: Trello.Key,
        token: Trello.Token,
      })
      .then(cards => {
        cards.sort((a: CardType, b: CardType) => {
          return (
            (a.due ? new Date(a.due).getTime() : 0) -
            (b.due ? new Date(b.due).getTime() : 0)
          );
        });
        this.setState({ cards });
      });
  };

  deleteCard = (id: string) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      let cards = [...this.state.cards];
      const cardIndex = cards.map(card => card.id).indexOf(id);

      if (cardIndex === -1) {
        alert("Error: Tried to delete a non-existent card.");
      } else {
        cards.splice(cardIndex, 1);
        this.setState({ cards });

        jQuery.ajax({
          type: "DELETE",
          url: "https://api.trello.com/1/cards/" + id,
          data: {
            key: Trello.Key,
            token: Trello.Token,
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
    let cards = [...this.state.cards];
    const cardIndex = cards.map(card => card.id).indexOf(cardId);

    if (cardIndex === -1) {
      alert("Error: Tried to drop a non-existent card.");
    } else {
      if (cards[cardIndex].idList !== columnId) {
        cards[cardIndex].idList = columnId;
        this.setState({ cards });

        jQuery.ajax({
          type: "PUT",
          url: "https://api.trello.com/1/cards/" + cardId,
          data: {
            key: Trello.Key,
            token: Trello.Token,
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
    const {
      columns,
      cards,
      labels,
      gapi,
      isGoogleCalendarAuthorized,
    } = this.state;
    return (
      <div className="root">
        {!isGoogleCalendarAuthorized && (
          <div className="banner">
            To sync scheduled tasks with your calendar,{" "}
            <button
              className="btn-warning"
              type="button"
              onClick={() => gapi && gapi.auth2.getAuthInstance().signIn()}
            >
              Sign in with Google
            </button>
          </div>
        )}
        <div className="container-fluid" id="board">
          <div className="row">
            {columns.map(column => (
              <Column
                title={column.name}
                className={column.name}
                key={column.id}
                id={column.id}
                cards={cards.filter(card => card.idList === column.id)}
                poll={this.poll}
                dropCard={this.dropCard}
                deleteCard={this.deleteCard}
                labels={labels}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
