(function() {
  'use strict';

  describe('AdvancedReportsCtrl', function() {
    var Report, ctrl, $scope, params;
    beforeEach(module('reports'));
    beforeEach(inject(function($injector) {
      SpecHelper.setup(this);

      var $controller = $injector.get('$controller');
      Report = $injector.get('Report');
      $scope = $injector.get('$rootScope').$new();
      params = {
        'Report' : Report,
        '$scope' : $scope
      };
      ctrl = $controller('AdvancedReportsCtrl', params);
    }));

    describe('$scope', function() {
      describe('.years', function() {
        it('should be defined', function() {
          expect($scope.years).toBeDefined();
        });

        it('should be an array', function() {
          expect(_.isArray($scope.years)).toBeTruthy();
        });

        it('should include years from 2013 and 10 years more', function() {
          expect($scope.years).toEqual([
            2013,
            2014,
            2015,
            2016,
            2017,
            2018,
            2019,
            2020
          ]);
        });
      });

      describe('.months', function() {
        it('should be defined', function() {
          expect($scope.months).toBeDefined();
        });

        it('should be an array', function() {
          expect(_.isArray($scope.months)).toBeTruthy();
        });

        it('should include all months of the year', function() {
          var expected = [
            {
              name  : 'January',
              value : 1
            },
            {
              name  : 'February',
              value : 2
            },
            {
              name  : 'March',
              value : 3
            },
            {
              name  : 'April',
              value : 4
            },
            {
              name  : 'May',
              value : 5
            },
            {
              name  : 'June',
              value : 6
            },
            {
              name  : 'July',
              value : 7
            },
            {
              name  : 'August',
              value : 8
            },
            {
              name  : 'September',
              value : 9
            },
            {
              name  : 'October',
              value : 10
            },
            {
              name  : 'November',
              value : 11
            },
            {
              name  : 'December',
              value : 12
            }
          ];

          expect($scope.months).toEqual(expected);
        });
      });

      describe('.from', function() {
        it('should be defined', function() {
          expect($scope.from).toBeDefined();
        });

        it('should be an object', function() {
          expect(_.isObject($scope.from)).toBeTruthy();
        });

        it('should have value for key year set to 2013', function() {
          expect($scope.from.year).toBe(2013);
        });

        it('should have value for key month set to 1', function() {
          expect($scope.from.month).toBe(1);
        });
      });

      describe('.to', function() {
        it('should be defined', function() {
          expect($scope.to).toBeDefined();
        });

        it('should be an object', function() {
          expect(_.isObject($scope.to)).toBeTruthy();
        });

        it('should have value for key year set to 2013', function() {
          expect($scope.to.year).toBe(2013);
        });

        it('should have value for key month set to 1', function() {
          expect($scope.to.month).toBe(1);
        });
      });
    }); /* End $scope */

    describe('#getReport()', function() {
      it('should be defined in the scope', function() {
        expect($scope.getReport).toBeDefined();
      });

      it('should be defined as a function', function() {
        expect(_.isFunction($scope.getReport)).toBeTruthy();
      });

      it('should call the Report.reports method with parameters', function() {
        spyOn(Report, 'reports').andReturn(function() {});
        var expected = {
          from : { year : 2012, month : '12' },
          to   : { year : 2013, month : '12' }
        };
        $scope.from = expected.from;
        $scope.to   = expected.to;
        $scope.getReport();
        expect(Report.reports).toHaveBeenCalledWith(expected);
      });
    });
  });
}());
