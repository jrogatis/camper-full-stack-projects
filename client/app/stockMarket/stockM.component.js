import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './stockM.routes';
import ModalService from '../../components/modal/modal.service';
import nvd3 from 'angular-nvd3';


export class stockMController {
  /*@ngInject*/
  constructor($scope, $http, $window, $routeParams, Modal, socket) {
    this.$http = $http;
    this.$scope = $scope;
    this.socket = socket;
    this.$window = $window;
    this.$routeParams = $routeParams;
    this.Modal = Modal;

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('stocks');
    });
  }

  $onInit() {
    //this.Modal.userStoryStockM();
    this.$http.get('/api/stocks')
      .then(response => {
        this.stockList = response.data;
        //now load each series to display
        this.socket.syncUpdates('stocks', this.stockList);
      });
  }

  CaptEnter(event) {
    if (event.which === 13) {
      this.addStock();
    }
  }

  addStock() {
    //first check if the Stock code exists od the local database
    //avoding duplicity if exists is alreredy loaded on graph
    if (this.stockAdd) {
      this.$http.get(`/api/stocks/${this.stockAdd}`)
        .success(result => {
          this.stockAdd = '';
        })
        .catch(error => {
          //if not exists then check for know if its a valid code
          //fist querying the yahoo db
          this.$http.get(this.urlForYahooQuery(this.stockAdd, '2015-01-01', '2016-01-08'))
            .success(data => {
              //check the return for a valid quotes...
              // that means more the 0 on count
              if (data.query.count === 0) {
                this.Modal.invalidQuote();
              } else {
                //its valid then add to local db
                this.$http.post('/api/stocks', {
                    ID: this.stockAdd,
                    DESC: ''
                  })
                  .success(ret => {
                    //now load to graph
                    console.log(data);
                  })
              }
            })
        })
    }
  }

  deleteStock(stock_id) {
    this.$http.delete(`/api/stocks/${stock_id}`)
  }

  //Quanti api iKjZVpmzmah-k5o1zDKS
  //startDate = '2015-01-01', endDate = '2016-01-08'
  urlForYahooQuery (stockIDs, startDate, endDate) {
    const baseUrl = 'http://query.yahooapis.com/v1/public/yql?q=';
    const url = encodeURIComponent(`select Close, Date from yahoo.finance.historicaldata where symbol in ("${stockIDs}") and startDate = "${startDate}" and endDate = "${endDate}"`);
    const tailUrl = '&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys&callback=';
    const completeUrl = baseUrl + url + tailUrl;
    console.log(completeUrl);
    return completeUrl;
  }

  chartOptions = {
    chart: {
      type: 'lineChart',
      height: 550,
      margin: {
        top: 20,
        right: 20,
        bottom: 60,
        left: 65
      },

      x: d => d3.time.format('%Y-%m-%d').parse(d['Date']),
      y: d => d['Close'],

      color: d3.scale.category10().range(),
      duration: 300,
      useInteractiveGuideline: true,
      clipVoronoi: false,

      xAxis: {
        "axisLabel": "Dates",
        tickFormat: d =>  d3.time.format('%m/%d/%y')(new Date(d)),
        "showMaxMin": false
      },
      xDomain:[d3.time.format('%Y-%m-%d').parse('2016-05-01'), d3.time.format('%Y-%m-%d').parse('2016-05-04')] ,

      yAxis: {
        "axisLabel": "Stock Price",
        "showMaxMin": false
      },
      zoom: {
      "enabled": true,
      "scaleExtent": [
        1,
        10
      ],
      "useFixedDomain": false,
      "useNiceScale": false,
      "horizontalOff": false,
      "verticalOff": true,
      "unzoomEventType": "dblclick.zoom"
    }
    },

  }

  data = [{
    key: 'AAPL',
    values: [
      {
        "Close": "96.959999",
        "Date": "2016-05-01"
      }, {
        "Close": "96.449997",
        "Date": "2016-05-02"
      }, {
        "Close": "100.699997",
        "Date": "2016-05-03"
      }, {
        "Close": "102.709999",
        "Date": "2016-05-04"
      }
    ]
  }]

}

export default angular.module('camperFullStackProjectsApp.stockm', [ngRoute, ModalService, nvd3])
  .config(routing)
  .component('stockm', {
    template: require('./stockM.main.pug'),
    controller: stockMController
  })
  .directive('uppercaseOnly', [
  // Dependencies

    // Directive
    function() {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
          element.on('keypress', function(e) {
            var char = e.char || String.fromCharCode(e.charCode);
            if (!/^[A-Z0-9]$/i.test(char)) {
              e.preventDefault();
              return false;
            }
          });

          function parser(value) {
            if (ctrl.$isEmpty(value)) {
              return value;
            }
            var formatedValue = value.toUpperCase();
            if (ctrl.$viewValue !== formatedValue) {
              ctrl.$setViewValue(formatedValue);
              ctrl.$render();
            }
            return formatedValue;
          }

          function formatter(value) {
            if (ctrl.$isEmpty(value)) {
              return value;
            }
            return value.toUpperCase();
          }

          ctrl.$formatters.push(formatter);
          ctrl.$parsers.push(parser);
        }
      };
    }
])
  .name;
