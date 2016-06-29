function authorizeApp() {
	var clientId = '463787160210-89kiojjsupa9u2g2s946g7em5d8t6kdj.apps.googleusercontent.com';
	var scopes = [
	'https://www.googleapis.com/auth/youtube'
	];
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
		at = accessToken;
		console.log(accessToken);
		gapi.client.load('youtube', 'v3', function() {
		console.log('youtube api loaded');
		})
	}
}