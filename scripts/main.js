import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class App extends Component {
	render() {
		return(
			<div className='app'>
				<div className='title'>Test Video Component</div>
				
			</div>
		)
	}
}

ReactDOM.render(<App />, document.querySelector('main'));