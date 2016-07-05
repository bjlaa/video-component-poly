import React, { Component } from 'react';
import RecordRTC from 'recordrtc';


class VideoRecorder extends Component {
	constructor(props) {
		super(props);

		// Our method bindings
		this.checkGAPI = this.checkGAPI.bind(this);
		this.checkAuth = this.checkAuth.bind(this);
		this.handleAuthResult = this.handleAuthResult.bind(this);
		this.loadAPIClientInterfaces = this.loadAPIClientInterfaces.bind(this);
		this.createUploadClass = this.createUploadClass.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.renderVideo = this.renderVideo.bind(this);
		this.recordVideo = this.recordVideo.bind(this);
		this.stopRecording = this.stopRecording.bind(this);
		this.handleOnChange = this.handleOnChange.bind(this);
	}

	componentDidMount() {
		// This is where the authentication process starts
		if(gapi.auth) {
			this.authorizeApp();
		} else {
			this.checkGAPI();
		}
	}



	/* 
		UploadVideo: Constructor method
	*/

	UploadVideo(self) {
		var video = document.getElementById('camera-stream');

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
			var metadata = {
				snippet: {
					title: self.props.titleVideo,
					description: self.props.descVideo,
					tags: this.tags,
					categoryId: this.categoryId
				},
				status: {
					privacyStatus: self.props.privacyVideo
				}
			};
			var uploader = new MediaUploader({
				baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
				file: file,
				token: self.props.accessToken,
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
			var video = document.getElementById('camera-stream');
		  this.uploadFile(self.props.recordedBlob);
		}
	}




	/*
		Authentication with GoogleAPI
	*/

	// This function allow us to wait until gapi.auth is loaded
	// before starting our authentication with authorizeApp
	checkGAPI() {
		if(gapi.auth) {
			this.authorizeApp();
		} else {
			setTimeout(this.checkGAPI, 100);
		}
	}

	// This the first function called in our authentication process
	// it initiates the authentication
	authorizeApp() {
		var clientId = this.props.clientId;
		var scopes = this.props.scopes;
		var checkAuth = this.checkAuth;
	  gapi.auth.init(function() {
	  	window.setTimeout(checkAuth(clientId, scopes),1);
	  });
	}

	// This checks with the API that our clientID and scopes are valid
	// ====>> this is where the youtube user account is defined
	// the clientID defines the account associated
	checkAuth(clientId, scopes) {
	  gapi.auth.authorize({
	  	client_id: clientId, 
	  	scope: scopes, 
	  	immediate: true
	  }, this.handleAuthResult);
	}

	// This checks whether there is any error with our cliendID and
	// scopes before pursuing
	handleAuthResult(authResult) {
	  if (authResult && !authResult.error) {
	    this.loadAPIClientInterfaces(authResult);			    
	  } else {
	  	console.log(authResult.error);
	  }
	}

	// This is the final step in our authentication:
	// an access token is fetched and stored in our App state
	// to be reused at the uploading stage
	loadAPIClientInterfaces(authResult) {
		// Stores our current token in state variable
		var accessToken = authResult.access_token;
		this.props.saveToken(accessToken);

		gapi.client.load('youtube', 'v3', function() {
		console.log('youtube api loaded');
		});
		// After authentication is complete, we set up the future
		// upload
		this.createUploadClass();
	}




	/*
		Setting up the Future upload
	*/

	// This checks whether the access token is fetched and stored
	// in our App state and calls the UploadVideo constructor
	// passing it our access token. This sets up our app to be
	// ready for uploading
	createUploadClass() {
		//This variable avoids having binding issue 
		// regarding 'this' in UploadVideo()
		var self = this;

		if(this.props.accessToken != '') {
			var UploadFunction = this.UploadVideo;
			var accessToken = this.props.accessToken;

			// This created a new session of our UploadVideo
			// and saves it to our App state 
			var uploadVideo = new UploadFunction(self);
			self.props.saveUploadVideoSession(uploadVideo);

			self.props.uploadVideo.ready(accessToken);		
		} else {
			setTimeout(this.createUploadClass, 100)
		}
	}

	/*
		Starting the capture and rendering its stream to our video div
	*/


	// This is called when the user clicks on the camera icon
	// starting the video capture by the device's camera/ microphone 
	renderVideo() {
		this.refs.video.style.visibility = 'visible';
		this.refs.record.style.display = 'none';
		this.captureVideoAudio();
	}

	// This method only turns on the device's camera and microphone
	// and transmit their stream 'localMediaStream' to our video div
	captureVideoAudio() {
	  navigator.getUserMedia = (navigator.getUserMedia ||
	                            navigator.webkitGetUserMedia ||
	                            navigator.mozGetUserMedia || 
	                            navigator.msGetUserMedia);
	  var self = this;
		if (navigator.getUserMedia) {
		  // Request the camera.
		  navigator.getUserMedia(
		    // Constraints
		    self.props.mediaConstraints,

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

	// This method is called whenever the user clicks on the cancel
	// button
	cancelVideo() {

	}


	/*
		Recording of our video
	*/

	// This method is called when the user clicks on the record 
	// button: it gets the stream from 'localMediaStream' and 
	// stores it in our App state with saveRecordRTC
	recordVideo() {
		this.refs.buttonRecord.style.display= 'none';
		this.refs.buttonStop.style.display= 'initial';
		this.refs.cameraStream.style.outline = 'solid red 1px';
		var self = this;
	  navigator.getUserMedia(
	    // Constraints
	    self.props.mediaConstraints,

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
				var recordRTC = RecordRTC(localMediaStream, options);
				self.props.saveRecordRTC(recordRTC);
				self.props.recordRTC.startRecording();
				console.log('Recording started!');
	    },

	    // Error Callback
	    function(err) {
	      // Log the error to the console.
	      console.log('The following error occurred when trying to use getUserMedia: ' + err);
	    }
	  );	
	}

	//This method stops our recording and update our blob with a
	// name and a date to convert it into a file that we can upload
	// on Youtube:  
	stopRecording() {
		this.stopVideoCapture();
		this.refs.buttonStop.style.display= 'none';
		this.refs.buttonUpload.style.display = 'initial';
		this.refs.cameraStream.style.outline = 'solid green 1px';
		this.refs.cameraStream.controls = true;
		this.refs.cameraStream.muted = false;

		var self = this;
	  navigator.getUserMedia(
	    // Constraints
	    self.props.mediaConstraints,

	    // Success Callback
	    function(localMediaStream) {

				// Get a reference to the video element on the page.
				var video = document.getElementById('camera-stream');

				
				var recordRTC = self.props.recordRTC;
				recordRTC.stopRecording(function() {
					var recordedBlob = self.props.recordedBlob;
					

					// the conversion is done here
					recordedBlob = recordRTC.getBlob();
					recordedBlob.lastModifiedDate = new Date();
					recordedBlob.name = 'VideoTest.webm';

					//and then we push the newly created file back into 
					//our App state
					self.props.updateRecordedBlob(recordedBlob);				

				});
	    },

	    // Error Callback
	    function(err) {
	      // Log the error to the console.
	      console.log('The following error occurred when trying to use getUserMedia: ' + err);
	    }
	  );
	}


	// This method allows us to turn off the device's camera and 
	// microphone
	stopVideoCapture() {
		console.log('getting called');
		var self = this;
		navigator.getUserMedia(
	    self.props.mediaConstraints,

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

	/*
		Helper functions, for handling events
	*/

	// This is called when the user clicks on the upload button
	// after having recorded a video
	handleClick() {
		if(this.props.uploadVideo != '') {
			this.props.uploadVideo.handleUploadClick();
		} else {
			setTimeout(this.handleClick, 100);
		}
	}
	// This allows us to save the video infos to our App state
	// whenever the title, description or privacy status are
	// modified
	handleOnChange(event) {
		var title = this.refs.titleVideo.value;
		var desc = this.refs.descVideo.value;
		var privacy = this.refs.privacyVideo.value;
		this.props.saveVideoInfos.bind(this, title, desc, privacy)();
	}

	render() {
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
};





export default VideoRecorder;