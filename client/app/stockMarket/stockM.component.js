import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './stockM.routes';
import ModalService from '../../components/modal/modal.service';
import nvd3 from 'angular-nvd3';
import _ from 'lodash';
import d3 from 'd3';
//import yahooFinance from 'yahoo-finance';

export class stockMController {
  /*@ngInject*/
  constructor($scope, $http, $window, $routeParams, Modal, socket) {
    this.$http = $http;
    this.$scope = $scope;
    this.socket = socket;
    this.$window = $window;
    this.$routeParams = $routeParams;
    this.Modal = Modal;
    this.data = [];
    this.monthsFromNow = 17;
    this.periods = ('17 12 6').split(' ').map(period => {
      return { months: period };
    });

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('stocks');
    });
  }

  formatDate(date) {
    const d = new Date(date);
    let myMonth = `${(d.getMonth() + 1)}`;
    let myDay = `${d.getDate()-1}`;
    const year = d.getFullYear();

    if(myMonth.length < 2) myMonth = `0${myMonth}`;
    if(myDay.length < 2) myDay = `0${myDay}`;

    return `${year}-${myMonth}-${myDay}`;
  }

  endDateToQuery() {
    const date = new Date();
    //console.log(this.formatDate(date));
    return this.formatDate(date);
  }

  loadSocket() {
    this.socket.syncUpdates('stocks', this.stockList, (event, item) => {
      switch (event) {
      case 'deleted':
        let newData = [];
        this.data.map(dataSeries => {
          if(dataSeries.key != item.ID) {
            newData.push({key: dataSeries.key, values: dataSeries.values});
          }
        }
        );
        this.api.updateWithData(newData);
        this.api.refresh();
        break;
      case 'created':
        this.stockAdd = '';
        const qs = {
          symbol: item.ID,
          from: this.startDateToQuery(),
          to: this.endDateToQuery()
        };
        this.$http.post('/api/stocks/quotes', qs)
          .then(series => {
            this.addSeries(item.ID, series.data);
            });
        break;
      default:
        console.log('no default', event);
      }
    });
    return true;
  }

  startDateToQuery() {
    let d = new Date();
    d = d.setMonth(d.getMonth() - this.monthsFromNow);
    d = this.formatDate(d);
    return d;
  }

  $onInit() {
    this.Modal.userStoryStockM();
    this.loadDataToDisplay();
  }

  customSortDate(a, b) {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  }

  custmSortQuotes(a, b) {
    return b.Close - a.Close;
  }

  addSeries(symbol, values) {
    let stockData = {};
    stockData.key = symbol;
    stockData.values = [];
    values.sort(this.customSortDate);
    values.map(quote => {
      //console.log(quote);
      stockData.values.push(quote);
    });
    this.data.push(stockData);
    return true;
  }

  loadDataToDisplay() {
    this.data = [];
    this.$http.get('/api/stocks')
      .then(response => {
        //console.log('no load data', response)
        this.stockList = response.data;
        this.loadSocket();
        this.stockList.map(item => {
          const qs = {
            symbol: item.ID,
            from: this.startDateToQuery(),
            to: this.endDateToQuery()
          };
          this.$http.post('/api/stocks/quotes', qs)
            .then(series => {
              this.addSeries(item.ID, series.data);
            }
          );
        });
      });
     }

  CaptEnter(event) {
    if(event.which === 13) {
      this.addStock();
    }
  }

  addStock() {
    //console.log(this.stockList);
    //first check if the Stock code exists od the local database
    //avoding duplicity if exists is alreredy loaded on graph
    if(!_.find(this.stockList, {
      ID: this.stockAdd
    })
      ) {
        const qs = {
          symbol: this.stockAdd,
          from: this.startDateToQuery(),
          to: this.endDateToQuery()
        };
        this.$http.post('/api/stocks/quotes', qs)
          .then(series => {
          //check the return for a valid quotes...
          // that means more the 0 on count
          if(series.status !== 200) {
            this.Modal.invalidQuote();
          } else {
            //console.log(this.stockList);
            //its valid then add to local db
            this.$http.post('/api/stocks', {
              ID: this.stockAdd,
              DESC: ''
            });
          }
        })
        .catch(error => this.Modal.invalidQuote());
    }
  }

  deleteStock(item) {
    this.$http.delete(`/api/stocks/${item._id}`);
  }

  chartOptions = {
    chart: {
      type: 'lineChart',
      height: 550,
      margin: {
        top: 20,
        right: 20,
        bottom: 60,
        left: 40
      },

      x: d => d3.time.format('%Y-%m-%d').parse(d.date),
      y: d => d.close,

      noData: 'Loading Data from Yahoo finance API',
      interactive: true,
      tooltips: true,
      color: d3.scale.category10().range(),
      duration: 300,
      useInteractiveGuideline: true,
      clipVoronoi: false,

      xAxis: {
        axisLabel: 'Dates',
        tickFormat: d => d3.time.format('%m/%d/%y')(new Date(d)),
        showMaxMin: false

      },

      yAxis: {
        showMaxMin: false,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
      },
      yDomain: [0, 1000],
      deepWatchData: true
    }
  }
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
            //console.log(e);
            var char = e.char || String.fromCharCode(e.charCode);
            //console.log(char);
            if(!/^[A-Z0-9]$/i.test(char)) {
              e.preventDefault();
              return false;
            }
          });

          function parser(value) {
            if(ctrl.$isEmpty(value)) {
              return value;
            }
            var formatedValue = value.toUpperCase();
            if(ctrl.$viewValue !== formatedValue) {
              ctrl.$setViewValue(formatedValue);
              ctrl.$render();
            }
            return formatedValue;
          }

          function formatter(value) {
            if(ctrl.$isEmpty(value)) {
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
