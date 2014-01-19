(function() {
  'use strict';

  describe('RequestPasswordResetCtrl', function() {
    var $q, $window, $rootScope, $scope, ctrl, Password, deferred;
    beforeEach(module('resetPassword'));
    beforeEach(inject(function($injector) {
      var $controller = $injector.get('$controller');
          $q          = $injector.get('$q');
      Password        = $injector.get('Password');
      $window         = $injector.get('$window');
      $rootScope      = $injector.get('$rootScope');
      $scope          = $rootScope.$new();
      deferred        = $q.defer();
      $controller('RequestPasswordResetCtrl', {
        '$scope' : $scope
      });
    }));

    describe('$scope', function() {
      describe('.emailSent', function() {
        it('should be defined', function() {
          expect($scope.emailSent).toBeDefined();
        });

        it('should be false by default', function() {
          expect($scope.emailSent).toBeFalsy();
        });
      }); /* end .emailSent */

      describe('.emailNotFound', function() {
        it('should be defined', function() {
          expect($scope.emailNotFound).toBeDefined();
        });

        it('should be false by default', function() {
          expect($scope.emailNotFound).toBeFalsy();
        });
      }); /* end .emailNotFound */

      describe('#requestPasswordReset()', function() {
        it('should be defined', function() {
          expect($scope.requestPasswordReset).toBeDefined();
        });

        it('should be a function', function() {
          expect(_.isFunction($scope.requestPasswordReset)).toBeTruthy();
        });

        it('should call Password.requestPasswordReset with email', function() {
          $scope.email = 'john@doe.com';
          spyOn(Password, 'requestPasswordReset').andCallThrough();
          $scope.requestPasswordReset();
          expect(Password.requestPasswordReset).toHaveBeenCalledWith('john@doe.com');
        });

        describe('given the service resolves', function() {
          beforeEach(function() {
            $scope.email         = 'john@doe.com';
            $scope.emailSent     = false;
            $scope.emailNotFound = true;
            deferred.resolve('yay');
            spyOn(Password, 'requestPasswordReset').andReturn(deferred.promise);
            $scope.requestPasswordReset();
            $rootScope.$apply();
          });

          it('should set emailSent to true', function() {
            expect($scope.emailSent).toBeTruthy();
          });

          it('should set emailNotFound to false', function() {
            expect($scope.emailNotFound).toBeFalsy();
          });
        });

        describe('given the service rejects', function() {
          beforeEach(function() {
            spyOn($window, 'alert');
            $scope.email         = 'john@doe.com';
            $scope.emailSent     = true;
            $scope.emailNotFound = false;
            deferred.reject({ message : 'fail' });
            spyOn(Password, 'requestPasswordReset').andReturn(deferred.promise);
            $scope.requestPasswordReset();
            $rootScope.$apply();
          });

          it('should set emailSent to false', function() {
            expect($scope.emailSent).toBeFalsy();
          });

          describe('given the error code is 404', function() {
            it('should set emailNotFound to true', function() {
              var d = $q.defer();
              d.reject({ code : 404 });
              $scope.email         = 'john@doe.com';
              $scope.emailSent     = true;
              $scope.emailNotFound = false;
              Password.requestPasswordReset.andReturn(d.promise);
              $scope.requestPasswordReset();
              $rootScope.$apply();
              expect($scope.emailNotFound).toBeTruthy();
            });
          });

          describe('given the status is different than 404', function() {
            it('should alert the user with error message', function() {
              expect($window.alert).toHaveBeenCalledWith('fail');
            });

            it('should set emailNotFound to false', function() {
              expect($scope.emailNotFound).toBeFalsy();
            });
          });
        });
      }); /* end #requestPasswordReset() */
    });
  });
}());
