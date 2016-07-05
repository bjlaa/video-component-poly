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
			accessToken: '',
			// ==>> This is what the user will have to change in order
			// to upload his video to his own channel:
			// go to console.developer.google.com and create an OAuth
			// clientID
			clientId: '463787160210-89kiojjsupa9u2g2s946g7em5d8t6kdj.apps.googleusercontent.com',
			// <<==
			scopes: ['https://www.googleapis.com/auth/youtube'],	
			mediaConstraints: { video: true, audio: true },
			titleVideo: '',
			descVideo: '',
			privacyVideo: '',
			recordRTC: '',
			recordedBlob: '',
			uploadVideo: ''
		}		
	}


	saveToken(accessToken) {
		this.setState({accessToken: accessToken});
	}
	saveUploadVideoSession(uploadVideo) {
		this.setState({uploadVideo: uploadVideo});
	}
	saveVideoInfos(title, desc, privacy) {
		this.setState({
			titleVideo: title,
			descVideo: desc,
			privacyVideo: privacy
		});
	}
	saveRecordRTC(recordRTC) {
		this.setState({recordRTC: recordRTC});
	}
	updateRecordedBlob(updatedBlob) {
		this.setState({recordedBlob: updatedBlob});
	}
	
	render() {
		return(
			<div className='app'>
				<VideoRecorder 
				accessToken={this.state.accessToken}
				clientId={this.state.clientId} 
				scopes={this.state.scopes}
				mediaConstraints={this.state.mediaConstraints}
				titleVideo={this.state.titleVideo}
				descVideo={this.state.descVideo}
				privacyVideo={this.state.privacyVideo}
				recordRTC={this.state.recordRTC}
				recordedBlob={this.state.recordedBlob}
				uploadVideo={this.state.uploadVideo}
				saveToken={this.saveToken.bind(this)}
				saveUploadVideoSession={this.saveUploadVideoSession.bind(this)}
				saveVideoInfos={this.saveVideoInfos.bind(this)}
				saveRecordRTC={this.saveRecordRTC.bind(this)}
				updateRecordedBlob={this.updateRecordedBlob.bind(this)}
				ref='testing' />
			</div>
		)
	}
}

ReactDOM.render(<App />, document.querySelector('#main'));