(function() {
  'use strict';

  describe('ResetPasswordCtrl', function() {
    var $q, $scope, $params, ctrl, Password, generateController;
    beforeEach(module('resetPassword'));
    beforeEach(inject(function($injector) {
      SpecHelper.setup(this);

      var $controller = $injector.get('$controller');
      Password        = $injector.get('Password');
      $q              = $injector.get('$q');
      $scope          = $injector.get('$rootScope').$new();
      $params         = { token : 'abc123' };
      generateController = function(deps) {
        if (_.isEmpty(deps)) {
          deps = {
            '$scope'       : $scope,
            '$routeParams' : $params,
            'Password'     : Password
          };
        }
        $controller('ResetPasswordCtrl', deps);
      };
    }));

    describe('$scope', function() {
      beforeEach(function() {
        generateController();
      });

      describe('.passwordReset', function() {
        it('should be defined', function() {
          expect($scope.passwordReset).toBeDefined();
        });

        it('should be false by default', function() {
          expect($scope.passwordReset).toBeFalsy();
        });
      }); /* end .passwordReset */

      describe('.tokenNotFound', function() {
        it('should be defined', function() {
          expect($scope.tokenNotFound).toBeDefined();
        });

        it('should be false by default', function() {
          expect($scope.tokenNotFound).toBeFalsy();
        });
      }); /* end .tokenNotFound */

      describe('.tokenFound', function() {
        it('should be defined', function() {
          expect($scope.tokenFound).toBeDefined();
        });

        it('should be false by default', function() {
          expect($scope.tokenFound).toBeFalsy();
        });
      }); /* end .tokenFound */

      describe('.invalidToken', function() {
        it('should be defined', function() {
          expect($scope.invalidToken).toBeDefined();
        });

        it('should be false by default', function() {
          expect($scope.invalidToken).toBeFalsy();
        });
      }); /* end .invalidToken */

      describe('.resetPassword', function() {
        it('should be defined', function() {
          expect($scope.resetPassword).toBeDefined();
        });

        it('should be a function', function() {
          expect($scope.resetPassword).toBeAFunction();
        });
      }); /* end .resetPassword */
    }); /* end $scope */

    describe('when initializing controller', function() {
      describe('given that the `token` param is not present', function() {
        it('should set $scope.invalidToken to true', function() {
          $scope.invalidToken = false;
          $params.token = '';
          generateController();
          expect($scope.invalidToken).toBeTruthy();
          $scope.invalidToken = false;
          $params.token = null;
          generateController();
          expect($scope.invalidToken).toBeTruthy();
        });

        it('should not call the Password.tokenExists service', function() {
          spyOn(Password, 'tokenExists');
          expect(Password.tokenExists).not.toHaveBeenCalled();
        });
      });

      describe('given that the `token` param is present', function() {
        it('should call the Password.tokenExists service with token from params', function() {
          spyOn(Password, 'tokenExists').andCallThrough();
          generateController();
          expect(Password.tokenExists).toHaveBeenCalledWith('abc123');
        });

        describe('given that the service resolves', function() {
          beforeEach(function() {
            var deferred = $q.defer();
            deferred.resolve(true);
            spyOn(Password, 'tokenExists').andReturn(deferred.promise);
            $scope.tokenFound    = false;
            $scope.tokenNotFound = true;
            $scope.invalidToken  = true;
            generateController();
            $scope.$apply();
          });

          it('should set $scope.tokenFound to true', function() {
            expect($scope.tokenFound).toBe(true);
          });

          it('should set $scope.tokenNotFound to false', function() {
            expect($scope.tokenNotFound).toBeFalsy();
          });

          it('should set $scope.invalidToken to false', function() {
            expect($scope.invalidToken).toBeFalsy();
          });
        }); /* end given that the service resolves */

        describe('given that the service rejects', function() {
          beforeEach(function() {
            var deferred = $q.defer();
            deferred.reject(false);
            spyOn(Password, 'tokenExists').andReturn(deferred.promise);
            $scope.tokenFound    = true;
            $scope.tokenNotFound = false;
            $scope.invalidToken  = true;
            generateController();
            $scope.$apply();
          });

          it('should set $scope.tokenFound to false', function() {
            expect($scope.tokenFound).toBeFalsy();
          });

          it('should set $scope.tokenNotFound to true', function() {
            expect($scope.tokenNotFound).toBeTruthy();
          });

          it('should set $scope.invalidToken to false', function() {
            expect($scope.invalidToken).toBeFalsy();
          });
        });
      });
    });

    describe('#resetPassword()', function() {
      it('should call Password.resetPassword service with params', function() {
        generateController();
        $scope.password             = 'foobar';
        $scope.passwordConfirmation = 'confirm-foobar';
        spyOn(Password, 'resetPassword');
        $scope.resetPassword();
        expect(Password.resetPassword).toHaveBeenCalledWith('foobar', 'confirm-foobar');
      });
    }); /* end #resetPassword() */
  });
}());
