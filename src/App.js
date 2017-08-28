import React, { Component } from 'react';
import './App.css';
import jQuery from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import Moment from 'moment';
import '../node_modules/font-awesome/css/font-awesome.min.css'; 
import Authentication from './authentication.js';
import Textarea from 'react-textarea-autosize';

//import './react-datetime.css';
//var Datetime = require('react-datetime');


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
    	if(this.props.editing) {

    		var editField;

    		switch(this.props.type)
    		{
    			case 'text':
    				editField = <span>
    								<input type="text" name="estimated" defaultValue={this.props.value} />
    								<br />
    							</span>
				break;

    			case 'date-time':
    				var date = (this.props.due) ? Moment(this.props.due).format('YYYY-MM-DD') : "";
    				var time = (this.props.due) ? Moment(this.props.due).format('HH:mm:') + "00" : "";

    				editField = <span>
    								<input type="date" name="dueDate" defaultValue={date}  />
    								<input type="time" name="dueTime" defaultValue={time} />
    								<br /><br />
    							</span>
    			break;

    			case 'event':
    				var scheduledDate = (this.props.scheduledStart) ? this.props.scheduledStart.format("YYYY-MM-DD") : null;
    				var start = (this.props.scheduledStart) ? this.props.scheduledStart.format("HH:mm:00") : null;
    				var end = (this.props.scheduledEnd) ? this.props.scheduledEnd.format("HH:mm:00") : null;

    				editField = <span>
    								<input type="date" name="scheduledDate" defaultValue={scheduledDate} /><br />
    								from <input type="time" name="scheduledTimeStart" defaultValue={start} />
    								to <input type="time" name="scheduledTimeEnd" defaultValue={end} />
								</span>
    			break;

    			default:
    				editField = "???"
    			break;

    		}

    		return ( 
    			<div className="form-group">
	                <Icon name={this.props.icon} />
	                {editField}
	            </div>
    		);
    	}
    	else {
	        return (
	            <span className={this.state.classNames}>
	                <Icon name={this.props.icon} />
	                {this.props.value}
	            </span>
	        );
	    }
    }
}
    
class Card extends Component {

	constructor(props) {
		super();
		this.state = {
	        cycle: Math.floor(Math.random()*60)+"min",
	        due: props.due,
	        duePretty: (props.due) ? Moment(props.due).format("ddd M/D h:mma") : "TBD",
	        estimated: (props.description.indexOf("{est=") > -1) ?
	            props.description.substring( props.description.indexOf("{est=") + 5, props.description.indexOf("=est}") ) : "TBD",
	        scheduled: (props.description.indexOf("{sch=") > -1) ?
	            Moment(
	                props.description.substring( props.description.indexOf("{sch=") + 5,  props.description.indexOf("{sch=") + 5 + 20 ))
	                .format("ddd M/D h:mma") : "TBD",
	        scheduledStart: (props.description.indexOf("{sch=") > -1) ?
	            Moment(props.description.substring( props.description.indexOf("{sch=") + 5,  props.description.indexOf("{sch=") + 5 + 20 ))
	                : null,
			scheduledEnd: (props.description.indexOf("=sch}") > -1) ?
	            Moment(props.description.substring( props.description.indexOf("=sch}") - 20,  props.description.indexOf("=sch}") ))
	                : null,
	        description: (props.description) ? props.description.replace(/\{[^}]+\}/g, '').replace(/(^[ \t]*\n)/gm, "") : "",
	        editing: false,
	        title: props.title,
	        subtitle: props.subtitle
    	}
	    this.edit = this.edit.bind(this);
	    this.cancelEdit = this.cancelEdit.bind(this);
	    this.updateCard = this.updateCard.bind(this);
	}

    edit() {
    	this.setState({editing: true});
    }

    updateCard(e) {
    	//var self=this;
    	e.preventDefault();

    	var form = document.forms["edit-"+this.props.id];
    	var utcOffset = (new Date().getTimezoneOffset() / 60);

    	var scheduled = "";
    	var estimated = "";

    	if(form.scheduledDate.value !== "" && //"2017-08-27"
			form.scheduledTimeStart.value !== "" &&
			form.scheduledTimeEnd.value !== "") {

    		var start = Moment(form.scheduledDate.value+" "+form.scheduledTimeStart.value).add(utcOffset, 'hours');
    		var end = Moment(form.scheduledDate.value+" "+form.scheduledTimeEnd.value).add(utcOffset, 'hours');

    		scheduled = "\n{sch=" + Moment(start).format("YYYY-MM-DDTHH:mm:00[Z]") + "|" + Moment(end).format("YYYY-MM-DDTHH:mm:00[Z]") + "=sch}";
    	}

    	if(form.estimated.value !== "" && form.estimated.value !== "TBD") {
    		estimated = "\n{est=" + form.estimated.value + "=est}";
    	}

    	var due = null;
    
		if(form.dueDate.value !== "" &&
			form.dueTime.value !== "") {

    		due = Moment(form.dueDate.value+" "+form.dueTime.value);//.add(utcOffset, 'hours');
    		//due = Moment(due).format("YYYY-MM-DDTHH:mm:00[Z]");
    	}

    	var params = {
    		key: Authentication.TrelloKey,
    		token: Authentication.TrelloToken,
    		name: form.name.value,
    		desc: form.desc.value + scheduled + estimated,
    		due: due.toDate()
    	}

    	jQuery.ajax({
    		type: 'PUT',
    		url: "https://api.trello.com/1/cards/"+this.props.id,
    		data: params,
    		success: function() {
    			window.location.reload();
//    			self.props.poll();

    			/*self.setState({
    				title: form.name.value,
    				estimated: form.estimated.value,
    				due: due,
    				editing: false,
    				duePretty: (due) ? Moment(due).format("ddd M/D h:mma") : "TBD"
    			});*/
    		},
    		error: function(xhr) {
    			alert("Error saving your changes: "+xhr.responseText);
    		}
    	})

    	

    	console.log(params);
    }

    cancelEdit() {
    	this.setState({editing: false});
    }

    render() {
    	if(this.state.editing)
    	{
    		return ( 

    			<form id={"edit-"+this.props.id} onSubmit={this.updateCard}>
	    			<div className="card card-outline-info"> 
		              <div className="card-block">

		                <h4 className="card-title">
		                    <input name="name" type="text" placeholder="Title" defaultValue={this.state.title} />
		                </h4>

		                <h6 className="card-subtitle mb-2 text-muted">
		                    <select name="label" defaultValue={this.state.subtitle}><option value={this.state.subtitle}>{this.state.subtitle}</option></select>
		                </h6>

		                <p className="card-text">
		                    <Textarea name="desc" placeholder="Description" defaultValue={this.state.description} />
		                </p>

		                <Stat icon="clock-o" type="text" value={this.state.estimated} editing />
		                <Stat icon="calendar" type="event" value={this.state.scheduled} scheduledStart={this.state.scheduledStart} scheduledEnd={this.state.scheduledEnd} editing />
		                  {/*<Stat icon="refresh" value={this.state.cycle}*/}
		                <Stat icon="inbox" type="date-time" value={this.state.duePretty} due={this.state.due} editing />
		                
		                <input className="btn btn-success" type="submit" value="&#10004;" />
		                <input className="btn btn-danger" type="button" value="X" onClick={this.cancelEdit} />

		              </div>
		            </div>
		        </form>

	       );
    	}
    	else
    	{
	        return (
	            
	            <div className="card card-outline-info"> 
	              <div className="card-block">

	                <h4 className="card-title">
	                    {this.state.title}
	                    <span className="card-priority" onClick={this.edit}>
	                        <Icon name="pencil" />
	                    </span>
	                </h4>

	                <h6 className="card-subtitle mb-2 text-muted">
	                    {this.state.subtitle}
	                </h6>

	                <p className="card-text">
	                    {this.state.description}
	                </p>

	                <Stat icon="clock-o" value={this.state.estimated} />
	                <Stat icon="calendar" value={this.state.scheduled} scheduled={this.state.scheduledDate} /><br />
	                  {/*<Stat icon="refresh" value={this.state.cycle}*/}
	                <Stat icon="inbox" value={this.state.duePretty} due={this.state.due} />

	              </div>
	            </div>

	        );
	    }
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
                        id={card.id}
                        poll={this.props.poll}
                    />
                ))}
               
            </div>    
        );
    }
}

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

export default App;

