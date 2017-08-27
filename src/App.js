import React, { Component } from 'react';
/*import logo from './logo.svg';*/
import './App.css';
import jQuery from 'jquery';
import Modal from 'react-modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import Moment from 'moment';
import '../node_modules/font-awesome/css/font-awesome.min.css'; 
import Authentication from './authentication.js'

class Icon extends Component {

    state = {
        classNames: "fa fa-"+this.props.name
    }
    render() {
        return (
            <i className={this.state.classNames} aria-hidden="true"></i>
        );
    }
}

class Stat extends Component {
    
    state = {
        classNames: "card-link"
    }

    componentDidMount() {
        if(this.props.value === "TBD")
        {
            this.setState({classNames: "card-link highlight tbd"});
        }
        else if(this.props.due)
        {
            if(Moment(new Date()).isAfter(this.props.due))
            {
                this.setState({classNames: "card-link highlight past-due"});
            }
            else if(Moment(new Date()).add(24, 'hours').isAfter(this.props.due))
            {
                this.setState({classNames: "card-link highlight due-24-hours"});
            }
            else if(Moment(new Date()).add(7, 'days').isAfter(this.props.due))
            {
                this.setState({classNames: "card-link highlight due-this-week"});
            }            
        }
        if(this.props.scheduled)
        {
            if(Moment(new Date()).isAfter(this.props.scheduled))
            {
                this.setState({classNames: "card-link highlight past-scheduled"});
            }
            else if(Moment(new Date()).isSame(this.props.scheduled,'d'))
            {
                this.setState({classNames: "card-link highlight blue"})
            }
        }
    }

    render() {
        return (
            <span className={this.state.classNames}>
                <Icon name={this.props.icon} />
                {this.props.value}
            </span>
        );
    }
}
    
class Card extends Component {

    state = {
        cycle: Math.floor(Math.random()*60)+"min",
        due: (this.props.due) ? Moment(this.props.due).format("ddd M/D h:mma") : "TBD",
        estimated: (this.props.description.indexOf("{est=") > -1) ?
            this.props.description.substring( this.props.description.indexOf("{est=") + 5, this.props.description.indexOf("=est}") ) : "TBD",
        scheduled: (this.props.description.indexOf("{sch=") > -1) ?
            Moment(
                this.props.description.substring( this.props.description.indexOf("{sch=") + 5,  this.props.description.indexOf("{sch=") + 5 + 17 ))
                .format("ddd M/D h:mma") : "TBD",
        scheduledDate: (this.props.description.indexOf("{sch=") > -1) ?
            new Date(this.props.description.substring( this.props.description.indexOf("{sch=") + 5,  this.props.description.indexOf("{sch=") + 5 + 17 ))
                : null,
        description: this.props.description.replace(/\{[^}]+\}/g, '').replace(/(^[ \t]*\n)/gm, ""),
    }

    componentDidMount() {
        
    }

    render() {
        return (
            
            <div className="card draggable card-outline-info"> 
              <div className="card-block">

                <h4 className="card-title">
                    {this.props.title}
                    <span className="card-priority">
                        <Icon name="pencil" />
                    </span>
                </h4>

                <h6 className="card-subtitle mb-2 text-muted">
                    {this.props.subtitle}
                </h6>

                <p className="card-text">
                    {this.state.description}
                </p>

                <Stat icon="clock-o" value={this.state.estimated} />
                <Stat icon="calendar" value={this.state.scheduled} scheduled={this.state.scheduledDate} /><br />
                  {/*<Stat icon="refresh" value={this.state.cycle}*/}
                <Stat icon="inbox" value={this.state.due} due={this.props.due} />

              </div>
            </div>

        );
    }

}
    
class Column extends Component {
            
    state = {
        classNames: "col " + this.props.title
    }
    
    render() {
        return (
            <div className={this.state.classNames}>
                <h2>{this.props.title}</h2>
                
                {this.props.cards
                    .filter(card => card.idList === this.props.id )                 
                    .map(card => (
                    <Card title={card.name}
                        subtitle={(card.labels[0]) ? card.labels[0].name : ""}
                        description={card.desc}
                        due={card.due}
                        key={card.id}
                    />
                ))}
               
            </div>    
        );
    }
}

class App extends Component {

    state = {
        columns: [
            { title: "Open", id: "598fa1bee1a7e2a5587befc3" },
            { title: "Scheduled", id:"598fa1c7ddb0ea0cc4c5773e" },
            { title: "In Progress", id: "598fa2fe443be451928c95d3" },
            { title: "On Hold", id: "598fa30575e5b628c02ea25b" },
            { title: "Done", id: "598fa308e4d27b60e4f31afd" }
        ],
        
        cards: [ /*{
            title: "Loading...",
            idList: "598fa2fe443be451928c95d3",
            labels: [],
            desc: ""
        }*/]
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
                            <Column title={column.title} className={column.title} key={column.id} id={column.id} cards={this.state.cards} />
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

export default App;

