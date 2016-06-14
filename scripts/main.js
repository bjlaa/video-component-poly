import React, { Component } from 'react';
import ReactDOM from 'react-dom';

/*
	Import VideoRecorder component
*/
import VideoRecorder from '../components/video-recorder';

class App extends Component {
	render() {
		return(
			<div className='app'>
				<div className='title'>Test Video Component</div>
				<VideoRecorder />
			</div>
		)
	}
}

ReactDOM.render(<App />, document.querySelector('#main'));