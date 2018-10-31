import React, { Component } from "react";
import { socket, join, sendMessage, playPresses, sendPresses } from "./subscribe"
class App extends Component {
  constructor() {
    super();
    this.state = {
      response: false,
      greeting: '',
      timestamp: '',
      letters: ['h','e','l','l','o'],
      presses: [],
      playerPresses: []
    };
    // set state in constructor
    // playPresses((err, presses) => this.setState({presses}))
  }

  componentDidMount() {
    // join event occuring on compDidMount
    join((err, response) => this.setState({response}))
    // playPresses((err, presses) => this.setState({presses}))
  }

  pressButtons(presses) {
    const pressesMock = (e, i) => {
      return setTimeout(function() {
        document.getElementById(`btn-${e}`).style.backgroundColor = 'red'
      }, (500 * i));
    }
    presses.forEach((e, i) =>  pressesMock(e, i));
  }

  onClick = () => {
    console.log(this.state.presses)
  }

  letterClick = (i) => {
    const { playerPresses } = this.state
    playerPresses.push(i)
    this.setState({playerPresses})
  }

  sendPresses = async () => {
    const { playerPresses } = this.state
    await sendPresses(playerPresses)
    await playPresses((err, presses) => this.pressButtons(presses))
  }

  render() {
    const { response } = this.state;
    return (
      <div>
        <div style={{ textAlign: "center" }}>
          {response
            ? <p>
                {response}
              </p>
            : <p>Loading...</p>}
        </div>
        <p>{this.state.greeting}</p>
        <button onClick={this.onClick} >Start Play</button>
        <button onClick={this.sendPresses}>Send Presses</button>
        <div style={{ display : 'flex', justifyContent: 'center'}}>
          {this.state.letters.map( (l, i) => 
            <button 
              key={`btn-${i}`}
              id={`btn-${i}`}
              onClick={() => this.letterClick(i)}
              style={{width: '30%', height: '85px'}} 
            > 
              {l.toUpperCase()} 
            </button> 
          )}
        </div>  
      </div>
    );
  }
}
export default App;