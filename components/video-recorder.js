import React from 'react';

var VideoRecorder = React.createClass({
	componentDidMount: function() {
	  navigator.getUserMedia = (navigator.getUserMedia ||
	                            navigator.webkitGetUserMedia ||
	                            navigator.mozGetUserMedia || 
	                            navigator.msGetUserMedia);
	},

	render: function() {
		return(
			<div id='video-container'>
				<video id='camera-stream' width='500' autoplay></video>
			</div>
		)
	}
});

export default VideoRecorder;