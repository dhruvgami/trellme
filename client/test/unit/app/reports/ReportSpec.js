(function() {
  'use strict';

  describe('Report', function() {
    var $httpBackend, Report, Config;
    beforeEach(module('reports'));
    beforeEach(inject(function($injector) {
      SpecHelper.setup(this);
      $httpBackend = $injector.get('$httpBackend');
      Report       = $injector.get('Report');
      Config       = $injector.get('Config');
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('.collectUrl', function() {
      it('should include the api endpoint', function() {
        expect(Report.collectUrl()).toContain(Config.apiEndpoint);
      });

      it('should point to /app/trello/collect', function() {
        expect(Report.collectUrl()).toContain('/app/trello/collect');
      });
    });

    describe('.reportsUrl', function() {
      it('should include the api endpoint', function() {
        expect(Report.reportsUrl()).toContain(Config.apiEndpoint);
      });

      it('should point to /app/trello/reports', function() {
        expect(Report.reportsUrl()).toContain('/app/trello/reports');
      });
    });

    describe('.advancedReportsUrl', function() {
      describe('given no dateRange param', function() {
        it('should thrown an exception', function() {
          expect(function() {
            Report.advancedReportsUrl();
          }).toThrow('dateRange param is not a POJO');
        });
      });

      describe('given a dateRange param', function() {
        describe('given it is not an POJO', function() {
          it('should throw an exception', function() {
            ['foo', 1234, false].forEach(function(testValue) {
              expect(function() {
                Report.advancedReportsUrl(testValue);
              }).toThrow('dateRange param is not a POJO');
            });
          });
        });

        describe('given it is a POJO', function() {
          describe('given it does not match the expected form', function() {
            it('should thrown an exception', function() {
              [
                {},
                { from : 123, to : 321     },
                { from : '123', to : '321' },
                { from : true, to : true   }
              ].forEach(function(testValue) {
                expect(function() {
                  Report.advancedReportsUrl(testValue);
                }).toThrow('dateRange is not valid');
              });
            });
          });

          describe('given it matches the expected format', function() {
            var dateRange, advancedReportsUrl;
            beforeEach(function() {
              dateRange          = {
                from : { year : '2013', month : '01', day : '01' },
                to   : { year : '2013', month : '12', day : '30' }
              };
              advancedReportsUrl = Report.advancedReportsUrl(dateRange);
            });

            it('should return a string', function() {
              expect(_.isString(advancedReportsUrl)).toBeTruthy();
            });

            it('should include the api endpoint', function() {
              expect(advancedReportsUrl).toContain(Config.apiEndpoint);
            });

            it('should match /app/trello/reports/from/xxxx/yy/zz/to/aaaa/bb/cc', function() {
              expect(advancedReportsUrl).
                toMatch(/\/app\/trello\/reports\/from\/\d{4}\/\d{2}\/\d{2}\/to\/\d{4}\/\d{2}\/\d{2}/);
            });
          });
        });
      });
    }); /* end .advancedReportsUrl */

    describe('.advancedReports', function() {
      var dateRange;
      beforeEach(function() {
        dateRange = {
          from : { year : '2012', month : '01', day : '01' },
          to   : { year : '2012', month : '12', day : '30' }
        };
      });

      it('should call advancedReportsUrl with `dateRange`', function() {
        $httpBackend.expectGET(Report.advancedReportsUrl(dateRange)).respond(200);
        spyOn(Report, 'advancedReportsUrl').andCallThrough();
        Report.advancedReports(dateRange);
        expect(Report.advancedReportsUrl).toHaveBeenCalledWith(dateRange);
        $httpBackend.flush();
      });

      it('should GET from the server using advancedReportsUrl', function() {
        $httpBackend.expectGET(Report.advancedReportsUrl(dateRange)).respond(200);
        Report.advancedReports(dateRange);
        $httpBackend.flush();
      });

      it('should return a promise', function() {
        $httpBackend.expectGET(Report.advancedReportsUrl(dateRange)).respond(200);
        expect(Report.advancedReports(dateRange)).toBeAPromise();
        $httpBackend.flush();
      });

      describe('given the server responds with success', function() {
        it('should resolve the promise with data returned from server', function() {
          var promiseData;
          $httpBackend.expectGET(Report.advancedReportsUrl(dateRange)).respond(200, 'ok');
          Report.advancedReports(dateRange).then(function(data) {
            promiseData = data;
          });
          $httpBackend.flush();
          expect(promiseData).toEqual('ok');
        });
      });

      describe('given the server responds with failure', function() {
        it('should reject the promise with error message', function() {
          var errorMessage;
          $httpBackend.expectGET(Report.advancedReportsUrl(dateRange)).respond(500, 'some internal error');
          Report.advancedReports(dateRange).then(function() {}, function(err) {
            errorMessage = err.message;
          });
          $httpBackend.flush();
          expect(errorMessage).toBe('Error 500 while fetching advanced reports: some internal error');
        });
      });
    }); /* end .advancedReports */

    describe('.collect', function() {
      it('should GET from the server using collectUrl', function() {
        $httpBackend.expectGET(Report.collectUrl()).respond(200);
        Report.collect();
        $httpBackend.flush();
      });

      it('should return a promise', function() {
        $httpBackend.expectGET(Report.collectUrl()).respond(200);
        expect(Report.collect()).toBeAPromise();
        $httpBackend.flush();
      });

      describe('given the server responds with success', function() {
        it('should resolve the promise with data returned from server', function() {
          var promiseData;
          $httpBackend.expectGET(Report.collectUrl()).respond(200, 'ok');
          Report.collect().then(function(data) {
            promiseData = data;
          });
          $httpBackend.flush();
          expect(promiseData).toEqual('ok');
        });
      });

      describe('given the server responds with failure', function() {
        it('should reject the promise with error message', function() {
          var errorMessage;
          $httpBackend.expectGET(Report.collectUrl()).respond(500, 'some internal error');
          Report.collect().then(function() {}, function(err) {
            errorMessage = err.message;
          });
          $httpBackend.flush();
          expect(errorMessage).toBe('Error 500 while collecting: some internal error');
        });
      });
    }); /* end .collect */

    describe('.reports', function() {
      it('should GET from server using reportsUrl', function() {
        $httpBackend.expectGET(Report.reportsUrl()).respond(200);
        Report.reports().then(function() {});
        $httpBackend.flush();
      });

      it('should return a promise', function() {
        $httpBackend.expectGET(Report.reportsUrl()).respond(200);
        var r = Report.reports();
        $httpBackend.flush();
        expect(r).toBeAPromise();
      });

      describe('given extra params "to" and "from" are passed as argument', function() {
        it('should send it to the server via GET', function() {
          var params = {
                from : { year : 2012, month : 12 },
                to   : { year : 2013, month : 12 }
              },
              expectedURL = new RegExp(Report.reportsUrl());
          $httpBackend.expectGET(expectedURL).respond(200);
          Report.reports(params);
          $httpBackend.flush();
        });
      });

      describe('given the server responds with success', function() {
        it('should resolve the promise with data returned from server', function() {
          var promiseData,
              reports = [{ title : 'foo' }, { title : 'bar' }];
          $httpBackend.expectGET(Report.reportsUrl()).respond(200, reports);
          Report.reports().then(function(data) {
            promiseData = data;
          });
          $httpBackend.flush();
          expect(promiseData).toEqual(reports);
        });
      });

      describe('given the server responds with failure', function() {
        it('should reject the promise with error message', function() {
          var errorMessage;
          $httpBackend.expectGET(Report.reportsUrl()).respond(500, 'some internal error');
          Report.reports().then(function() {}, function(err) {
            errorMessage = err.message;
          });
          $httpBackend.flush();
          expect(errorMessage).toBe('Error 500 while fetching reports: some internal error');
        });
      });
    }); /* end .reports */
  });
}());
