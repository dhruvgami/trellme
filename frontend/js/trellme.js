/*
 * trellme.js
 *  Angular.js javascript for trellme.html
 *
 *  Author: Yoshikazu Noda
 *  last update: June 29, 2013 
 */
function controller($scope, $http) {
    //$scope.host = "http://127.0.0.1:3000";
    $scope.host = "http://api.trellme.com";  
    $scope.token = "";
    $scope.user = {};
    $scope.signupu = {};   // Signup email, password, trello_username, tzdiff
    $scope.allboards = "";  // JSON
    $scope.report = "";  // HTML
    var welcome_message = 'Welcome to TrellMe! Please sign in to get your report.'


    /*
     * Get difference of local time and UCT
     */
    function tzdiff() {
	var d = new Date()
	var gmtHours = -d.getTimezoneOffset()/60;
	//alert("The local time zone is: GMT " + gmtHours);
	return gmtHours;
    }

    /*
     * Login button handler
     */
    $scope.mylogin = function() {
	// Workaround to circumvent a strange error
	delete $http.defaults.headers.common['X-Requested-With'];
	
	// Call /app/tokens API
	$http({method: 'POST', url: $scope.host+'/app/tokens', data: $scope.user}).
	    success(function(data, status, headers, config) {
		$scope.token = data.token
		$('div#login').addClass('invisible');
		$('#signup-link').addClass('invisible');
		$('#signin-link').addClass('invisible');
		// Get report
		$scope.getReport();
	    }).
	    error(function(data, status, headers, config) {
		alert('Login failed '+data);
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
		$('#signup-link').removeClass('invisible');
		$('#signin-link').removeClass('invisible');

		$scope.user = {}
		$scope.token = "";
		$("#report-html").empty();
	    }).
	    error(function(data, status, headers, config) {
		alert('Logout failed '+data);
	    });

    };

    /*
     * Signup
     */
    $scope.mysignup = function() {
	// Workaround to circumvent an strange error
	delete $http.defaults.headers.common['X-Requested-With'];
	// Do this first to block the popup-block.
	var popup = window.open('', 'OAuth Popup', "height=800,width=800")

	// Add timezone difference value to post data
	$scope.signupu.tzdiff = tzdiff();
	// Call /app/tokens DELETE API
	$http.post($scope.host+'/app/users', $scope.signupu, {}).
	    success(function(data, status, headers, config) {
		popup.location = $scope.host+'/app/auths/request/'+$scope.signupu.email;
		check_close = setInterval(function(){
		    if (popup != null) {
			if (popup.closed) {
			    popup = null
			    clearInterval(check_close)
			    alert(welcome_message)
			}
		    }
		}, 100);  // 100 milli seconds
	    }).
	    error(function(data, status, headers, config) {
		alert('Signup failed '+data);
	    });
    };

    /* Need user already stored to OAuth to work!!!
    $scope.mysignup = function() {
	// Workaround to circumvent an strange error
	delete $http.defaults.headers.common['X-Requested-With'];

	// Call /app/tokens DELETE API
	var popup = window.open('', 'OAuth Popup', "height=800,width=800")
	popup.location = $scope.host+'/app/auths/request/'+$scope.signupu.email;

	check_close = setInterval(function(){
            if (popup != null) {
                if (popup.closed) {
                    popup = null
                    clearInterval(check_close)
		}
	    }
        }, 100);  // 100 milli seconds
	// Check status
	$http.get($scope.host+'/app/auths/status/'+$scope.signupu.email, {}).
	    success(function(data, status, headers, config) {
		if (data == 'yes') {
		    $http.post($scope.host+'/app/users', $scope.signupu, {}).
			success(function(data, status, headers, config) {
			    alert('Welcome To TrellMe!');
			}).
			error(function(data, status, headers, config) {
			    alert('Signup failed '+data);
			});
		}
	    }).
	    error(function(data, status, headers, config) {
		alert('Error '+data);
	    });
    };
    */

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
			alert('Error: '+data);
		    });
	    }).
	    error(function(data, status, headers, config) {
		alert('Error: '+data);
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
		alert('Error '+data);
	    });
    };


}
