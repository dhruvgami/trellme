/*
 * trellme.js
 *  Angular.js javascript for trellme.html
 *
 */
function controller($scope, $http) {
    $scope.host = "http://127.0.0.1:3000";
    $scope.token = "";
    $scope.user = {};
    $scope.signupu = {};   // Signup email, password, trello_username
    $scope.allboards = "";  // JSON
    $scope.report = "";  // HTML

    /*
     * Login button handler
     */
    $scope.mylogin = function() {
	// Workaround to circumvent an strange error
	delete $http.defaults.headers.common['X-Requested-With'];
	
	// Call /app/tokens API
	$http({method: 'POST', url: $scope.host+'/app/tokens', data: $scope.user}).
	    success(function(data, status, headers, config) {
		$scope.token = data.token
		$('div#login').addClass('invisible');
		// Get report
		$scope.getReport();
	    }).
	    error(function(data, status, headers, config) {
		alert('Login failed '+status);
	    });
    };

    /*
     * Display sign up form
     */
    $scope.signupform = function() {
	$('div#login').addClass('invisible');
	$('div#signup').removeClass('invisible');
    };

    /*
     * Display sign in form
     */
    $scope.signinform = function() {
	$('div#login').removeClass('invisible');
	$('div#signup').addClass('invisible');
    };

    /*
     * Logout button handler
     */
    $scope.mylogout = function() {
	if ($scope.token == '') {
	    alert('You are not signed in')
	    return;
	}
	// Workaround to circumvent an strange error
	delete $http.defaults.headers.common['X-Requested-With'];

	// Call /app/tokens DELETE API
	$http.delete($scope.host+'/app/tokens/'+$scope.token, {}).
	    success(function(data, status, headers, config) {
		$('div#login').removeClass('invisible');
		$('div#logout').addClass('invisible');
		$scope.user = {}
		$scope.token = "";
		$("#report-html").empty();
	    }).
	    error(function(data, status, headers, config) {
		alert('Logout failed '+status);
	    });

    };

    /*
     * Signup
     */
    $scope.mysignup = function() {
	// Workaround to circumvent an strange error
	delete $http.defaults.headers.common['X-Requested-With'];

	// Call /app/tokens DELETE API
	$http.post($scope.host+'/app/users', $scope.signupu, {}).
	    success(function(data, status, headers, config) {
		var popup = window.open('', 'OAuth Popup', "height=800,width=800")
		popup.location = $scope.host+'/app/auths/request/'+$scope.signupu.email;
	    }).
	    error(function(data, status, headers, config) {
		alert('Signup failed '+status);
	    });

    };

    /*
     * Trello OAuth
     */
    $scope.oAuth = function() {
	// Workaround to circumvent an strange error
	delete $http.defaults.headers.common['X-Requested-With'];

	// Call GET /app/auths/request API
	var popup = window.open('', 'OAuth Popup', "height=800,width=800")
	popup.location = $scope.host+'/app/auths/request?token='+$scope.token;
    };

    /*
     * get Trello Report
     */
    $scope.getReport = function() {
	// Workaround to circumvent an strange error
	delete $http.defaults.headers.common['X-Requested-With'];

	// Call /app/trello/report/useremail
	$http.get($scope.host+'/app/trello/collect/'+$scope.token, {}).
	    success(function(data, status, headers, config) {
		$http.get($scope.host+'/app/trello/view/'+$scope.token, {}).
		    success(function(data, status, headers, config) {
			$scope.report = data;
			$("#report-html").empty();
			$("#report-html").append(data);
		    }).
		    error(function(data, status, headers, config) {
			alert('Error view '+status);
		    });
	    }).
	    error(function(data, status, headers, config) {
		alert('Error collect '+status);
	    });
    };

    /*
     * Trello API call
     */
    $scope.allboards = function() {
	// Workaround to circumvent an strange error
	delete $http.defaults.headers.common['X-Requested-With'];

	// Call /app/trello/{action}/{username}
	var action = "all_boards";
	$http.get($scope.host+'/app/trello/'+action+'/'+$scope.user.username, {}).
	    success(function(data, status, headers, config) {
		$scope.allboards = data;
	    }).
	    error(function(data, status, headers, config) {
		alert('Error '+status);
	    });
    };


}
