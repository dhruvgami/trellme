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

    // TODO:
    // * Implement #resetPassword(password, passwordConfirmation)
    // * Imlpement #resetPasswordUrl();
    //
    describe('#resetPasswordUrl()', function() {
      it('should be defined', function() {
        expect(Password.resetPasswordUrl).toBeDefined();
      });

      it('should be a function', function() {
        expect(Password.resetPasswordUrl).toBeAFunction();
      });

      it('should include Config.apiEndpoint', function() {
        expect(Password.resetPasswordUrl()).toContain(apiEndpoint);
      });

      it('should look like /password/reset', function() {
        expect(Password.resetPasswordUrl()).toMatch(/\/password$/);
      });
    }); /* end #resetPasswordUrl() */

    describe('#resetPassword()', function() {
      it('should be defined', function() {
        expect(Password.resetPassword).toBeDefined();
      });

      it('should be a function', function() {
        expect(Password.resetPassword).toBeAFunction();
      });

      describe('given that the password is blank', function() {
        it('should raise an exception', function() {
          expect(function() {
            Password.resetPassword('');
          }).toThrow("Password can't be blank");
        });
      });

      describe('given that the passwordConfirmation is blank', function() {
        it('should raise an exception', function() {
          expect(function() {
            Password.resetPassword('secret', '');
          }).toThrow("Password confirmation can't be blank");
        });
      });

      describe('given that the password does not match passwordConfirmation', function() {
        it('should raise an exception', function() {
          expect(function() {
            Password.resetPassword('foobar', 'barfoo');
          }).toThrow('Password does not match confirmation');
        });
      });

      it('should return a promise', function() {
        $httpBackend.expectGET(Password.resetPasswordUrl()).respond(200);
        expect(Password.resetPassword('a', 'a')).toBeAPromise();
      });

      it('should GET from server using tokenExistsUrl() with `token` param', function() {
        var expectedUrl = [Password.tokenExistsUrl(), '?token=abc123'].join('');
        $httpBackend.expectGET(expectedUrl).respond(200);
        spyOn(Password, 'tokenExistsUrl').andCallThrough();
        Password.tokenExists('abc123');
        expect(Password.tokenExistsUrl).toHaveBeenCalled();
        $httpBackend.flush();
      });

      describe('given that the server responds with success', function() {
        it('should resolve the promise', function() {
          var resolved    = false
            , expectedUrl = [Password.tokenExistsUrl(), '?token=abc123'].join('');
          $httpBackend.expectGET(expectedUrl).respond(200);
          Password.tokenExists('abc123').then(function() {
            resolved = true;
          });
          $httpBackend.flush();
          expect(resolved).toBeTruthy();
        });
      });

      describe('given that the server responds with error', function() {
        it('should reject the promise with error', function() {
          var errorMessage
            , expectedUrl = [Password.tokenExistsUrl(), '?token=abc123'].join('');
          $httpBackend.
            expectGET(expectedUrl).
            respond(500, { error:'some internal error' });
          Password.tokenExists('abc123').
            then(function() {
            }, function(err) {
              errorMessage = err.message;
            });
          $httpBackend.flush();
          expect(errorMessage).toBe('Error 500 while trying to verify token existence: some internal error');
        });
      });
    }); /* end #tokenExists() */

    describe('#tokenExistsUrl()', function() {
      it('should be defined', function() {
        expect(Password.tokenExistsUrl).toBeDefined();
      });

      it('should be a function', function() {
        expect(_.isFunction(Password.tokenExistsUrl)).toBeTruthy();
      });

      it('should include Config.apiEndpoint', function() {
        expect(Password.tokenExistsUrl()).toContain(apiEndpoint);
      });

      it('should look like /password/reset', function() {
        expect(Password.tokenExistsUrl()).toMatch(/\/password\/reset$/);
      });
    }); /* end #tokenExistsUrl() */

    describe('#tokenExists()', function() {
      it('should be defined', function() {
        expect(Password.tokenExists).toBeDefined();
      });

      it('should be a function', function() {
        expect(_.isFunction(Password.tokenExists)).toBeTruthy();
      });

      describe('given the `token` param is empty', function() {
        it('should raise an exception', function() {
          expect(function() {
            Password.tokenExists('');
          }).toThrow("Token can't be blank");

          expect(function() {
            Password.tokenExists();
          }).toThrow("Token can't be blank");
        });
      });

      it('should return a promise', function() {
        var expectedUrl = [Password.tokenExistsUrl(), '?token=abc123'].join('');
        $httpBackend.expectGET(expectedUrl).respond(200);
        expect(Password.tokenExists('abc123')).toBeAPromise();
      });

      it('should GET from server using tokenExistsUrl() with `token` param', function() {
        var expectedUrl = [Password.tokenExistsUrl(), '?token=abc123'].join('');
        $httpBackend.expectGET(expectedUrl).respond(200);
        spyOn(Password, 'tokenExistsUrl').andCallThrough();
        Password.tokenExists('abc123');
        expect(Password.tokenExistsUrl).toHaveBeenCalled();
        $httpBackend.flush();
      });

      describe('given that the server responds with success', function() {
        it('should resolve the promise', function() {
          var resolved    = false
            , expectedUrl = [Password.tokenExistsUrl(), '?token=abc123'].join('');
          $httpBackend.expectGET(expectedUrl).respond(200);
          Password.tokenExists('abc123').then(function() {
            resolved = true;
          });
          $httpBackend.flush();
          expect(resolved).toBeTruthy();
        });
      });

      describe('given that the server responds with error', function() {
        it('should reject the promise with error', function() {
          var errorMessage
            , expectedUrl = [Password.tokenExistsUrl(), '?token=abc123'].join('');
          $httpBackend.
            expectGET(expectedUrl).
            respond(500, { error:'some internal error' });
          Password.tokenExists('abc123').
            then(function() {
            }, function(err) {
              errorMessage = err.message;
            });
          $httpBackend.flush();
          expect(errorMessage).toBe('Error 500 while trying to verify token existence: some internal error');
        });
      });
    }); /* end #tokenExists() */

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
    }); /* end #requestPasswordResetUrl() */

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
    }); /* end #requestPasswordReset() */
  });
}());
