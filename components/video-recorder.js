import React from 'react';

var VideoRecorder = React.createClass({
	renderVideo() {
		this.refs.video.style.visibility = 'visible';
		this.refs.button.style.display = 'none';
		this.captureVideoAudio();
	},

	render: function() {
		var renderedComponent;
		return(
			<div>
				<div className='record'>
					<div className='record-message'>Let's try recording a video:</div>
					<div ref='button' className='record-button-container'>
						<i onClick={this.renderVideo} className="fa fa-video-camera" aria-hidden="true"></i>
						<i className="fa fa-arrow-up" aria-hidden="true"></i>
						<div className='record-click-me' >Click me!</div>
					</div>
				</div>					
				<div ref='video' id='video-container'>
					<video id='camera-stream' width='500' autoPlay ></video>
				</div>				
			</div>
			
		)
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
		    {
		      video: true,
		      audio: true
		    },

		    // Success Callback
		    function(localMediaStream) {
					// Get a reference to the video element on the page.
					var vid = document.getElementById('camera-stream');

					// Create an object URL for the video stream and use this 
					// to set the video source.
					vid.src = window.URL.createObjectURL(localMediaStream);
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