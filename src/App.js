import React, { Component } from 'react';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/font-awesome/css/font-awesome.min.css'; 

import Authentication from './authentication.js';
import { DragDropContext, DragSource } from 'react-dnd';
import jQuery from 'jquery';
import Textarea from 'react-textarea-autosize';
import HTML5Backend from 'react-dnd-html5-backend';

import Icon from './Icon.js';
import Stat from './Stat.js';
import Card from './Card.js';
import Column from './Column.js'; 

class App extends Component {

	constructor(props) {
		super();
		this.state = {
	        columns: [
	            { title: "Open", id: "598fa1bee1a7e2a5587befc3" },
	            { title: "Scheduled", id:"598fa1c7ddb0ea0cc4c5773e" },
	            { title: "In Progress", id: "598fa2fe443be451928c95d3" },
	            { title: "On Hold", id: "598fa30575e5b628c02ea25b" },
	            { title: "Done", id: "598fa308e4d27b60e4f31afd" }
	        ],
	        cards: []
	    }
	}

    

    componentDidMount() {
        this.startPolling();
    }

    startPolling() {
    	var self = this;
   		self.poll();
   		self._timer = setInterval(self.poll.bind(self), 15000);
    }

    poll() {
    	jQuery.get("https://api.trello.com/1/boards/kNrLkVPc/cards?fields=name,desc,due,labels,idList&key="+Authentication.TrelloKey+"&token="+Authentication.TrelloToken)
            .then(result => {
            
                result.sort(function(a,b) {
                    var aDue = (a.due) ? new Date(a.due).getTime() : 0;
                    var bDue = (b.due) ? new Date(b.due).getTime() : 0;
                    return aDue - bDue;
                })  
                this.setState({cards: result});
        });
    }

   	componentWillUnmount() {
    	if (this._timer) {
    		clearInterval(this._timer);
    		this._timer = null;
    	}
    }

    render(){
        return (
            <div className="root">
                <div className="container-fluid" id="board">
                    <div className="row">
                        {this.state.columns.map(column => (
                            <Column title={column.title} className={column.title} key={column.id} id={column.id} cards={this.state.cards} poll={this.poll} />
                        ))}
                    </div>
                </div>
{/*<Modal
                    isOpen="false"
                    >
                    Test 12
                </Modal>*/}
            </div>
        );
    }

}

export default DragDropContext(HTML5Backend)(App);

