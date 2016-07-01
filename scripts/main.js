import React, { Component } from 'react';
import ReactDOM from 'react-dom';

/*
	Import VideoRecorder component
*/
import VideoRecorder from '../components/video-recorder';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			result: '',
			accessToken: '',
			clientId: '463787160210-89kiojjsupa9u2g2s946g7em5d8t6kdj.apps.googleusercontent.com',
			scopes: ['https://www.googleapis.com/auth/youtube'],	
		}		
	}
	loadToken(accessToken) {
		this.setState({accessToken: accessToken});
	}
	render() {
		return(
			<div className='app'>
				<div className='title'>Test Video Component</div>
				<VideoRecorder 
				clientId={this.state.clientId} 
				scopes={this.state.scopes}
				accessToken={this.state.accessToken}
				loadToken={this.loadToken.bind(this)}
				ref='testing' />
			</div>
		)
	}
}

ReactDOM.render(<App />, document.querySelector('#main'));