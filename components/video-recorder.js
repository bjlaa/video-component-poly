import React, { Component } from 'react';
import RecordRTC from 'recordrtc';

// Constraints for our video capture/recording
var mediaConstraints = { video: true, audio: true }; 
var recordRTC;
var urlVideo;
var AT;
var uploadVideo;
var recordedBlob;



class VideoRecorder extends Component {
	constructor(props) {
		super(props);

		this.state = {
			titleVideo: '',
			descVideo: '',
			privacyVideo: ''

		};

		// Our method bindings
		this.checkGAPI = this.checkGAPI.bind(this);
		this.checkAuth = this.checkAuth.bind(this);
		this.handleAuthResult = this.handleAuthResult.bind(this);
		this.loadAPIClientInterfaces = this.loadAPIClientInterfaces.bind(this);
		this.createUploadClass = this.createUploadClass.bind(this);
		this.UploadVideo = this.UploadVideo.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.renderVideo = this.renderVideo.bind(this);
		this.recordVideo = this.recordVideo.bind(this);
		this.stopRecording = this.stopRecording.bind(this);
		this.handleOnChange = this.handleOnChange.bind(this);
	}

	componentDidMount() {
		if(gapi.auth) {
			this.authorizeApp();
		} else {
			this.checkGAPI();
		}
	}

	// constructor function: creates an UploadVideo element
	UploadVideo(self) {
		var video = document.getElementById('camera-stream');
		var file = recordedBlob;
		var accessToken = AT;

		this.tags = ['youtube-cors-upload'];
		this.categoryId = 22;
		this.videoId = '';
		this.uploadStartTime = 0;
		

		this.ready = function(accessToken) {
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
		}
		this.uploadFile = function(file) {
			console.log(self.state.titleVideo);
			var metadata = {
				snippet: {
					title: self.state.titleVideo,
					description: self.state.descVideo,
					tags: this.tags,
					categoryId: this.categoryId
				},
				status: {
					privacyStatus: self.state.privacyVideo
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
						console.log(message);
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
				}.bind(this)
			});
			this.uploadStartTime = Date.now();
			uploader.upload();
		}
		this.handleUploadClick = function() {
			console.log('handleuploadclick');
			var video = document.getElementById('camera-stream');
		  this.uploadFile(recordedBlob);
		}
	}

	checkGAPI() {
		if(gapi.auth) {
			this.authorizeApp();
		} else {
			setTimeout(this.checkGAPI, 100);
		}
	}

	authorizeApp() {
		var clientId = this.props.clientId;
		var scopes = this.props.scopes;
		var result;
		var accessToken;
		var checkAuth = this.checkAuth;
	  gapi.auth.init(function() {
	  	window.setTimeout(checkAuth(clientId, scopes),1);
	  });
	}
	checkAuth(clientId, scopes) {
	  gapi.auth.authorize({
	  	client_id: clientId, 
	  	scope: scopes, 
	  	immediate: true
	  }, this.handleAuthResult);
	}
	handleAuthResult(authResult) {
	  if (authResult && !authResult.error) {
	    this.loadAPIClientInterfaces(authResult);			    
	  }
	}
	loadAPIClientInterfaces(authResult) {
		// Stores our current token in state variable
		var accessToken = authResult.access_token;
		this.props.loadToken(accessToken);
		AT = accessToken;

		gapi.client.load('youtube', 'v3', function() {
		console.log('youtube api loaded');
		});
		this.createUploadClass();
	}
	createUploadClass() {

		//This variable avoids having binding issue 
		// regarding 'this' in UploadVideo()
		var self = this;

		if(this.props.accessToken != '') {
			var UploadFunction = this.UploadVideo;
			uploadVideo = new UploadFunction(self);
			uploadVideo.ready(AT);		
		} else {
			setTimeout(this.createUploadClass, 100)
		}

	}
	handleClick() {
		if(uploadVideo) {
			uploadVideo.handleUploadClick();
		} else {
			setTimeout(this.handleClick, 100);
		}
	}
	handleOnChange(event) {
		this.setState({
			titleVideo: this.refs.titleVideo.value,
			descVideo: this.refs.descVideo.value,
			privacyVideo: this.refs.privacyVideo.value
		})
	}

	render() {
		var renderedComponent;
		return(
			<div>
				<div ref='record' className='record'>
					<div className='record-button-container'>
						<i onClick={this.renderVideo.bind(this)} className="fa fa-video-camera" aria-hidden="true"></i>
					</div>
				</div>					
				<div ref='video' id='video-container' >
					<video ref='cameraStream'id='camera-stream' width='1281px' autoPlay muted></video>
					<button ref='buttonRecord'onClick={this.recordVideo} className='button-record'>Record</button>
					<button ref='buttonStop' onClick={this.stopRecording} className='button-stop' >Stop</button>
					<button ref='buttonUpload' onClick={this.handleClick} id='button-upload'>Upload Video</button>
					<button onClick={this.cancelVideo} className='button-cancel' >Cancel</button>
					<div ></div>
					<div>
			      <label className='labels-upload' htmlFor="title-upload">Title:</label>
			      <input onChange={this.handleOnChange} ref='titleVideo' id="titleVideo" type="text" defaultValue=''/>
			    </div>
			    <div>
			      <label className='labels-upload' htmlFor="description">Description:</label>
			      <textarea onChange={this.handleOnChange} ref='descVideo' id='descVideo' defaultValue=''></textarea>
			    </div>
			    <div>
			      <label className='labels-upload' htmlFor="privacy-status">Privacy Status:</label>
			      <select onChange={this.handleOnChange} ref='privacyVideo' id='privacyVideo'>
			        <option>public</option>
			        <option>unlisted</option>
			        <option>private</option>
			      </select>
			    </div>					
				</div>				
			</div>
			
		)
	}

	renderVideo() {
		this.refs.video.style.visibility = 'visible';
		this.refs.record.style.display = 'none';
		this.captureVideoAudio();
	}
	cancelVideo() {

	}

	recordVideo() {
		this.refs.buttonRecord.style.display= 'none';
		this.refs.buttonStop.style.display= 'initial';
		this.refs.cameraStream.style.outline = 'solid red 1px';
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
					bitsPerSecond: 128000,
					bufferSize: 16384,
					sampleRate: 96000
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
	}

	stopRecording() {
		this.stopVideoCapture();
		this.refs.buttonStop.style.display= 'none';
		this.refs.buttonUpload.style.display = 'initial';
		this.refs.cameraStream.style.outline = 'solid green 1px';
		this.refs.cameraStream.controls = true;
		this.refs.cameraStream.muted = false;
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

					recordedBlob = recordRTC.getBlob();
					recordedBlob.lastModifiedDate = new Date();
					recordedBlob.name = 'VideoTest.webm';					
					/*
					var url = video.src;
					video.muted = false;
					video.play();
					*/

				});
	    },

	    // Error Callback
	    function(err) {
	      // Log the error to the console.
	      console.log('The following error occurred when trying to use getUserMedia: ' + err);
	    }
	  );
	}

	captureVideoAudio() {
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

	stopVideoCapture() {
		console.log('getting called');
		navigator.getUserMedia(
	    mediaConstraints,

	    // Success Callback
	    function(localMediaStream) {
	    	var track0 = localMediaStream.getTracks()[0];
	    	var track1 = localMediaStream.getTracks()[1];
	    	var tracks = localMediaStream.getTracks();
	    	console.log(tracks);
	    	track0.stop();
	    	track1.stop();
	    },
	    function(err) {
	      // Log the error to the console.
	      console.log('The following error occurred when trying to use getUserMedia: ' + err);
	    }
		)
	}
};

export default VideoRecorder;