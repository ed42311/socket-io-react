import React, { Component } from "react";
import { join, playPresses, sendPresses } from "./subscribe"
import './App.css'

class App extends Component {
  constructor() {
    super();
    this.state = {
      response: false,
      letterButtons: [
        {
          letter: 'h',
          displayClass: false
        },
        {
          letter: 'e',
          displayClass: false
        },
        {
          letter: 'l',
          displayClass: false
        },
        {
          letter: 'l',
          displayClass: false
        },
        {
          letter: 'o',
          displayClass: false
        }
      ],
      playerPresses: []
    };
  }

  componentDidMount() {
    join((err, response) => this.setState({response}))
    playPresses((err, presses) => {
      this.pressButtons(presses)
    })
  }

  pressButtons = (presses) => {
    console.log("press buttons")
    const { letterButtons } = this.state
    const runButtons = new Promise((resolve, reject) => {
      try {
        let complete = 0
        presses.forEach((l, i) => {
          const time = 500 * i
          complete += time
          setTimeout(() => {
            letterButtons[l].displayClass = true
            this.setState({
              letterButtons
            })
          }, time);
        })
        resolve(complete)
      } catch (error) {
        resolve(error)
      }
    })

    runButtons.then((d) => {
      setTimeout(() => {
        this.onReset()
      }, d)
    })
    console.log("end press buttons")
  }

  onClick = () => {
    console.log(this.state.playerPresses)
  }

  letterClick = (i) => {
    const { playerPresses } = this.state
    playerPresses.push(i)
    this.setState({playerPresses})
  }

  sendPresses = async () => {
    let { playerPresses } = this.state
    console.log(playerPresses)
    await sendPresses(playerPresses)
    playerPresses = []
    this.setState({playerPresses})
  }

  onReset = () => {
    let { letterButtons } = this.state
    letterButtons = letterButtons.map((l, i) => {
      l.displayClass = false
      return l
    })
    this.setState({letterButtons})
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
        <button onClick={this.onReset}>Reset</button>
        <div style={{ display : 'flex', justifyContent: 'center'}}>
          {this.state.letterButtons.map( (l, i) => 
            <button 
              key={`${l.letter}-${i}`}
              id={`btn-${i}`}
              className={l.displayClass ? 'press' : 'no-press'}
              onClick={() => this.letterClick(i)}
              style={{width: '30%', height: '85px'}} 
            > 
              {l.letter.toUpperCase()} 
            </button> 
          )}
        </div>  
      </div>
    );
  }
}
export default App;