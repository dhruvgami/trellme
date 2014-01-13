(function() {
  'use strict';

  describe('AdvancedReportsCtrl', function() {
    var Report, ctrl, $scope, params, generateController;
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

      generateController = function(_params) {
        if (!_params) {
          _params = params;
        }
        return $controller('AdvancedReportsCtrl', _params);
      };
    }));

    describe('$scope', function() {
      describe('.noRecordsFound', function() {
        it('should be defined', function() {
          expect($scope.noRecordsFound).toBeDefined();
        });

        it('should be false by default', function() {
          expect($scope.noRecordsFound).toBeFalsy();
        });
      });
      describe('.reports', function() {
        it('should be defined', function() {
          expect($scope.reports).toBeDefined();
        });

        it('should be an array', function() {
          expect(_.isArray($scope.reports)).toBeTruthy();
        });

        it('should be empty by default', function() {
          expect(_.isEmpty($scope.reports)).toBeTruthy();
        });
      });
      describe('.years', function() {
        it('should be defined', function() {
          expect($scope.years).toBeDefined();
        });

        it('should be an array', function() {
          expect(_.isArray($scope.years)).toBeTruthy();
        });

        it('should include years from 2013 and 10 years more', function() {
          expect($scope.years).toEqual([
            '2013',
            '2014',
            '2015',
            '2016',
            '2017',
            '2018',
            '2019',
            '2020'
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
              value : '01'
            },
            {
              name  : 'February',
              value : '02'
            },
            {
              name  : 'March',
              value : '03'
            },
            {
              name  : 'April',
              value : '04'
            },
            {
              name  : 'May',
              value : '05'
            },
            {
              name  : 'June',
              value : '06'
            },
            {
              name  : 'July',
              value : '07'
            },
            {
              name  : 'August',
              value : '08'
            },
            {
              name  : 'September',
              value : '09'
            },
            {
              name  : 'October',
              value : '10'
            },
            {
              name  : 'November',
              value : '11'
            },
            {
              name  : 'December',
              value : '12'
            }
          ];

          expect($scope.months).toEqual(expected);
        });
      });

      describe('.days', function() {
        it('should be defined', function() {
          expect($scope.days).toBeDefined();
        });

        it('should be an array', function() {
          expect(_.isArray($scope.days)).toBeTruthy();
        });

        it('should be an array of 31 days as string', function() {
          expect($scope.days).toEqual([
            '01',
            '02',
            '03',
            '04',
            '05',
            '06',
            '07',
            '08',
            '09',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '20',
            '21',
            '22',
            '23',
            '24',
            '25',
            '26',
            '27',
            '28',
            '29',
            '30',
            '31'
          ]);
        });
      });

      describe('.from', function() {
        it('should be defined', function() {
          expect($scope.from).toBeDefined();
        });

        it('should be an object', function() {
          expect(_.isObject($scope.from)).toBeTruthy();
        });

        it('should have value for key year set to "2013"', function() {
          expect($scope.from.year).toBe('2013');
        });

        it('should have value for key month set to "01"', function() {
          expect($scope.from.month).toBe('01');
        });

        it('should have value for key day set to "01"', function() {
          expect($scope.from.day).toBe('01');
        });
      });

      describe('.to', function() {
        it('should be defined', function() {
          expect($scope.to).toBeDefined();
        });

        it('should be an object', function() {
          expect(_.isObject($scope.to)).toBeTruthy();
        });

        it('should have value for key year set to "2013"', function() {
          expect($scope.to.year).toBe('2013');
        });

        it('should have value for key month set to "01"', function() {
          expect($scope.to.month).toBe('01');
        });

        it('should have value for key day set to "01"', function() {
          expect($scope.to.day).toBe('01');
        });
      });
    }); /* End $scope */

    describe('#getReports()', function() {
      it('should be defined in the scope', function() {
        expect($scope.getReports).toBeDefined();
      });

      it('should be defined as a function', function() {
        expect(_.isFunction($scope.getReports)).toBeTruthy();
      });

      it('should call the Report.advancedReports method with parameters', function() {
        spyOn(Report, 'advancedReports').andCallThrough();
        var expected = {
          from : { year : 2012, month : '12' },
          to   : { year : 2013, month : '12' }
        };
        $scope.from = expected.from;
        $scope.to   = expected.to;
        $scope.getReports();
        expect(Report.advancedReports).toHaveBeenCalledWith(expected);
      });
    }); /* end #getReports() */

    describe('#assignReports()', function() {
      it('should be a function', function() {
        var ctrl = generateController();
        expect(ctrl.assignReports).toBeAFunction();
      });

      it('should expose whatever pass as param to reports variable in $scope', function() {
        var ctrl = generateController();
        $scope.reports = null;
        ctrl.assignReports({ foo : 'bar' });
        expect($scope.reports).toEqual({ foo : 'bar' });
      });
    }); /* end #assignReports() */
  });
}());
