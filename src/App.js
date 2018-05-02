import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {WorkerPool} from './workerPool2';

class App extends Component {

  componentDidMount(){
    this.pool = new WorkerPool(2);
  }

  runJob = () => {this.pool.queueJob('myFetch', 'gpolyn').then(result => console.log(result)).catch(e => console.log(e));}

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={this.runJob}>Run job</button>
      </div>
    );
  }
}

export default App;
