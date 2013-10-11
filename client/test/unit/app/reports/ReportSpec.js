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

    describe('.reportsUrl', function() {
      it('should include the api endpoint', function() {
        expect(Report.reportsUrl()).toContain(Config.apiEndpoint);
      });

      it('should point to /app/trello/reports', function() {
        expect(Report.reportsUrl()).toContain('/app/trello/reports');
      });
    });

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
    });
  });
}());
