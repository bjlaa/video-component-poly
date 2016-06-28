import React from 'react';
import RecordRTC from 'recordrtc';

// Constraints for our video capture/recording
var mediaConstraints = { video: true, audio: true }; 
var recordRTC;
var urlVideo;


var VideoRecorder = React.createClass({
	componentDidMount: function() {

	},

	authorizeApp: function() {
		var clientId = '463787160210-89kiojjsupa9u2g2s946g7em5d8t6kdj.apps.googleusercontent.com';
		var apiKey = 'KzeIoIGf-kY0qKMqAOKZOenP';
		var scopes = [
		'https://www.googleapis.com/auth/youtube'
		];
		function handleClientLoad() {
		  gapi.client.setApiKey(apiKey);
		  window.setTimeout(checkAuth,1);
		}

		function checkAuth() {
		  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
		}

		function handleAuthResult(authResult) {
		  if (authResult && !authResult.error) {
		    console.log('Connected to gapi!!');
		  } else {
		    handleAuthClick;
		  }
		}

		function handleAuthClick(event) {
		  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
		  return false;
		}
	},

	renderVideo: function() {
		this.refs.video.style.visibility = 'visible';
		this.refs.record.style.display = 'none';
		this.captureVideoAudio();
	},

	render: function() {
		var renderedComponent;
		return(
			<div>
				<div ref='record' className='record'>
					<div className='record-message'>Let's try recording a video:</div>
					<div className='record-button-container'>
						<i onClick={this.renderVideo} className="fa fa-video-camera" aria-hidden="true"></i>
						<i className="fa fa-arrow-up" aria-hidden="true"></i>
						<div className='record-click-me' >Click me!</div>
					</div>
				</div>					
				<div ref='video' id='video-container' >
					<video id='camera-stream' width='500' autoPlay muted></video>
					<button ref='button-record'onClick={this.recordVideo} className='button-record'>Record</button>
					<button ref='button-stop' onClick={this.stopRecording} className='button-stop' >Stop</button>
					<div ref= 'button-download' id='button-download'></div>
					<div>
			      <label className='labels-upload' htmlFor="title-upload">Title:</label>
			      <input id="title-upload" type="text" defaultValue=''/>
			    </div>
			    <div>
			      <label className='labels-upload' htmlFor="description">Description:</label>
			      <textarea defaultValue='' id="description"></textarea>
			    </div>
			    <div>
			      <label className='labels-upload' htmlFor="privacy-status">Privacy Status:</label>
			      <select id="privacy-status">
			        <option>public</option>
			        <option>unlisted</option>
			        <option>private</option>
			      </select>
			    </div>					
				</div>				
			</div>
			
		)
	},

	recordVideo: function() {
	  navigator.getUserMedia(
	    // Constraints
	    mediaConstraints,

	    // Success Callback
	    function(localMediaStream) {
				//RecordRTC part - recording of the video

				// Get a reference to the video element on the page.
				var video = document.getElementById('camera-stream');

				var options = {
					mimeType: 'video/webm',
					audioBitsPerSecond: 128000,
					videoBitsPerSecond: 128000,
					bitsPerSecond: 128000
				};
				recordRTC = RecordRTC(localMediaStream, options);
				recordRTC.startRecording();
				console.log('Recording started!');
	    },

	    // Error Callback
	    function(err) {
	      // Log the error to the console.
	      console.log('The following error occurred when trying to use getUserMedia: ' + err);
	    }
	  );	
	},

	stopRecording: function() {
	  navigator.getUserMedia(
	    // Constraints
	    mediaConstraints,

	    // Success Callback
	    function(localMediaStream) {

				// Get a reference to the video element on the page.
				var video = document.getElementById('camera-stream');

				//RecordRTC part - recording of the video
				recordRTC.stopRecording(function(audioVideoWebMURL) {
					video.src = audioVideoWebMURL;

					var recordedBlob = recordRTC.getBlob();
					recordRTC.getDataURL(function(dataURL) { });
					
					var downloadURL = document.getElementById('button-download');
					var url = video.src;
					video.muted = false;
					video.play();
					downloadURL.innerHTML = '<a href="' + url + '" download="video.webm" target="_blank">Save Video</a><hr>';

				});
	    },

	    // Error Callback
	    function(err) {
	      // Log the error to the console.
	      console.log('The following error occurred when trying to use getUserMedia: ' + err);
	    }
	  );
	},

	captureVideoAudio: function() {
	  navigator.getUserMedia = (navigator.getUserMedia ||
	                            navigator.webkitGetUserMedia ||
	                            navigator.mozGetUserMedia || 
	                            navigator.msGetUserMedia);
		if (navigator.getUserMedia) {
		  // Request the camera.
		  navigator.getUserMedia(
		    // Constraints
		    mediaConstraints,

		    // Success Callback
		    function(localMediaStream) {

		    	//Rendering video on screen part

					// Get a reference to the video element on the page.
					var video = document.getElementById('camera-stream');

					// Create an object URL for the video stream and use this 
					// to set the video source.
					video.src = window.URL.createObjectURL(localMediaStream);
		    },

		    // Error Callback
		    function(err) {
		      // Log the error to the console.
		      console.log('The following error occurred when trying to use getUserMedia: ' + err);
		    }
		  );

		} else {
		  alert('Sorry, your browser does not support getUserMedia');
		}		
	}
});

export default VideoRecorder;