(function() {
  'use strict';

  describe('Password', function() {
    var Password, apiEndpoint, $httpBackend;
    beforeEach(module('resetPassword'));
    beforeEach(inject(function($injector) {
      SpecHelper.setup(this);

      Password     = $injector.get('Password');
      apiEndpoint  = $injector.get('Config').apiEndpoint;
      $httpBackend = $injector.get('$httpBackend');
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('#requestPasswordResetUrl()', function() {
      it('should be defined', function() {
        expect(Password.requestPasswordResetUrl).toBeDefined();
      });

      it('should be a function', function() {
        expect(_.isFunction(Password.requestPasswordResetUrl)).toBeTruthy();
      });

      it('should include Config.apiEndpoint', function() {
        expect(Password.requestPasswordResetUrl()).toContain(apiEndpoint);
      });

      it('should look like /password/reset', function() {
        expect(Password.requestPasswordResetUrl()).toMatch(/\/password\/reset$/);
      });
    });

    describe('#requestPasswordReset()', function() {
      it('should be defined', function() {
        expect(Password.requestPasswordReset).toBeDefined();
      });

      it('should be a function', function() {
        expect(_.isFunction(Password.requestPasswordReset)).toBeTruthy();
      });

      describe('given no email param', function() {
        it('should throw an exception', function() {
          expect(function() {
            Password.requestPasswordReset();
          }).toThrow("Email can't be blank");
        });
      });

      describe('given an empty email', function() {
        it('should throw an exception', function() {
          expect(function() {
            Password.requestPasswordReset('');
          }).toThrow("Email can't be blank");
        });
      });

      describe('given some email', function() {
        it('should POST email to server with requestPasswordResetUrl', function() {
          $httpBackend.
            expectPOST(Password.requestPasswordResetUrl(), { email : 'john@doe.com' }).
            respond(200);
          Password.requestPasswordReset('john@doe.com');
          $httpBackend.flush();
        });


        it('should return a promise', function() {
          $httpBackend.expectPOST(Password.requestPasswordResetUrl()).respond(200);
          expect(Password.requestPasswordReset('john@doe.com')).toBeAPromise();
        });

        describe('given the server responds with success', function() {
          it('should resolve the promise with data returned from server', function() {
            var promiseData;
            $httpBackend.
              expectPOST(Password.requestPasswordResetUrl()).
              respond(200, 'ok');
            Password.requestPasswordReset('john@doe.com').then(function(data) {
              promiseData = data;
            });
            $httpBackend.flush();
            expect(promiseData).toEqual('ok');
          });
        });

        describe('given the server responds with failure', function() {
          it('should reject the promise with error message', function() {
            var errorMessage;
            $httpBackend.
              expectPOST(Password.requestPasswordResetUrl()).
              respond(500, { error:'some internal error' });
            Password.requestPasswordReset('john@doe.com').
              then(function() {
              }, function(err) {
                errorMessage = err.message;
              });
            $httpBackend.flush();
            expect(errorMessage).toBe('Error 500 while trying to request password reset: some internal error');
          });
        });
      });
    }); /* end #reset() */
  });
}());
