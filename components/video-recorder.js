import React from 'react';
import RecordRTC from 'recordrtc';

// Constraints for our video capture/recording
var mediaConstraints = { video: true, audio: true }; 
var recordRTC;
var urlVideo;



var VideoRecorder = React.createClass({
	componentDidMount: function() {
		if(gapi.auth) {
			console.log('in componentDidMount');
			this.authorizeApp();
		} else {
			console.log('calling checkGAPI from componentDidMount');
			this.checkGAPI();
		}
	},
	checkGAPI: function() {
		if(gapi.auth) {
			console.log('try in checkGAPI');
			this.authorizeApp();
		} else {
			console.log('using timeout');
			setTimeout(this.checkGAPI, 100);
		}
	},
	authorizeApp: function() {
		var clientId = this.props.clientId;
		var scopes = this.props.scopes;
		var result;
		var accessToken;

	  gapi.auth.init(function() {
	  	window.setTimeout(checkAuth,1);
	  });

		function checkAuth() {
		  gapi.auth.authorize({
		  	client_id: clientId, 
		  	scope: scopes, 
		  	immediate: true
		  }, handleAuthResult);
		}

		function handleAuthResult(authResult) {
		  if (authResult && !authResult.error) {
		    loadAPIClientInterfaces(authResult);			    
		  }
		}

		function loadAPIClientInterfaces(authResult) {
			result = authResult;
			accessToken = authResult.access_token;
			console.log(accessToken);
			gapi.client.load('youtube', 'v3', function() {
			console.log('youtube api loaded');
			})
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
					<button ref= 'button-download' id='button-download'></button>
					<button onClick={this.handleUploadClick} id='button-upload'>Upload Video</button>
					<div ></div>
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
					downloadURL.innerHTML = '<a class="download-link" href="' + url + '" download="video.webm" target="_blank">Save Video</a><hr>';

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
	},

/*
	uploadToYT: function() {
		var video = document.getElementById('camera-stream');
		var file = video.src;

		var UploadVideo = function() {
			this.tags = ['youtube-cors-upload'];
			this.categoryId = 22;
			this.videoId = '';
			this.uploadStartTime = 0;
		}

		UploadVideo.prototype.ready = function(accessToken) {
		  this.accessToken = accessToken;
		  this.gapi = gapi;
		  this.authenticated = true;
		  this.gapi.client.request({
		    path: '/youtube/v3/channels',
		    params: {
		      part: 'snippet',
		      mine: true
		    },
		    callback: function(response) {
		      if (response.error) {
		        console.log(response.error.message);
		      } else {
		        console.log('ready success');
		      }
		    }.bind(this)
		  });
		  $('#button').on("click", this.handleUploadClicked.bind(this));
		};

		UploadVideo.prototype.uploadFile = function(file) {
			console.log('in uploadFile');
			var metadata = {
				snippet: {
					title: 'test',
					description: 'test',
					tags: ['test'],
					categoryId: 22
				},
				status: {
					privacyStatus: 'public'
				}
			};
			var uploader = new MediaUploader({
				baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
				file: file,
				token: this.accessToken,
				metadata: metadata,
				params: {
					part: Object.keys(metadata).join(',')
				},
				onError: function(data) {
					var message = data;
					try {
						var errorResponse = JSON.parse(data);
						message = errorResponse.error.message;
					} finally {
						alert(message);
					}
				}.bind(this),
				onProgress: function(data) {
					console.log('onprogress');
					var currentTime = Date.now();
					var bytesUploaded = data.loaded;
					var totalBytes = data.total;
					// The times are in millis, so we need to divide by 1000 to get seconds.
					var bytesPerSecond = bytesUploaded / ((currentTime - this.uploadStartTime) / 1000);
					var estimatedSecondsRemaining = (totalBytes - bytesUploaded) / bytesPerSecond;
					var percentageComplete = (bytesUploaded * 100) / totalBytes;
				}.bind(this),
				onComplete: function(data) {
					console.log('completed');
					var uploadResponse = JSON.parse(data);
					this.videoId = uploadResponse.id;
					this.pollForVideoStatus();
				}.bind(this)
			});
			this.uploadStartTime = Date.now();
			uploader.upload();
		}();

		UploadVideo.prototype.handleUploadClicked = function() {
			console.log('handleuploadclick');
		  this.uploadFile($('#file').get(0).files[0]);
		}();		
	},
*/

	uploadToYT: function() {
		var video = document.getElementById('camera-stream');
		var file = video.src;

		var UploadVideo = function() {
			this.tags = ['youtube-cors-upload'];
			this.categoryId = 22;
			this.videoId = '';
			this.uploadStartTime = 0;
		}
		
		UploadVideo.ready = function(accessToken) {
		  this.accessToken = accessToken;
		  this.gapi = gapi;
		  this.authenticated = true;
		  this.gapi.client.request({
		    path: '/youtube/v3/channels',
		    params: {
		      part: 'snippet',
		      mine: true
		    },
		    callback: function(response) {
		      if (response.error) {
		        console.log(response.error.message);
		      } else {
		        console.log('ready success');
		      }
		    }.bind(this)
		  });
		  handleUploadClicked();
		};
	}, 
	uploadFile: function(file) {
		console.log('in uploadFile');
		var metadata = {
			snippet: {
				title: 'test',
				description: 'test',
				tags: ['test'],
				categoryId: 22
			},
			status: {
				privacyStatus: 'public'
			}
		};
		var uploader = new MediaUploader({
			baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
			file: file,
			token: this.accessToken,
			metadata: metadata,
			params: {
				part: Object.keys(metadata).join(',')
			},
			onError: function(data) {
				var message = data;
				try {
					var errorResponse = JSON.parse(data);
					message = errorResponse.error.message;
				} finally {
					alert(message);
				}
			}.bind(this),
			onProgress: function(data) {
				console.log('onprogress');
				var currentTime = Date.now();
				var bytesUploaded = data.loaded;
				var totalBytes = data.total;
				// The times are in millis, so we need to divide by 1000 to get seconds.
				var bytesPerSecond = bytesUploaded / ((currentTime - this.uploadStartTime) / 1000);
				var estimatedSecondsRemaining = (totalBytes - bytesUploaded) / bytesPerSecond;
				var percentageComplete = (bytesUploaded * 100) / totalBytes;
			}.bind(this),
			onComplete: function(data) {
				console.log('completed');
				var uploadResponse = JSON.parse(data);
				this.videoId = uploadResponse.id;
				this.pollForVideoStatus();
			}.bind(this)
		});
		this.uploadStartTime = Date.now();
		uploader.upload();
	},

	handleUploadClick: function() {
		console.log('handleuploadclick');
		var video = document.getElementById('camera-stream');
	  this.uploadFile(video.src);
	}
});

export default VideoRecorder;