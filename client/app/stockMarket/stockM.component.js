import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './stockM.routes';
import ModalService from '../../components/modal/modal.service';
import nvd3 from 'angular-nvd3';
import _ from 'lodash';


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
    //this.api;
    this.periods = (`17 12 6`).split(' ').map( period =>{ return { months: period }; });

    $scope.$on('$destroy', function () {
      this.socket.unsyncUpdates('stocks');
    });
  }

  formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  endDateToQuery() {
    const date = new Date();
    //console.log(this.formatDate(date));
    return this.formatDate(date);
  }

  loadSocket() {
     this.socket.syncUpdates('stocks', this.stockList, (event, item, array) => {
        switch (event) {
          case 'deleted':
             let newData =[]
             this.data.map(dataSeries => {
               console.log('no map', dataSeries, item.ID)
                if(dataSeries.key != item.ID ) {
                 newData.push({key:dataSeries.key, values: dataSeries.values})
               }
              }
            )
            this.api.updateWithData(newData);
            this.api.refresh();
            break;
          case 'created':
             this.stockAdd = '';
             this.$http.get(this.urlForYahooQuery(item.ID))
              .success( ret => {
                this.addSeries(item.ID, ret.query.results.quote);

              })
             break;
          default:
            console.log('no default', event)
        }
      })
  }

  deleteSeries(item) {
    let series = _.find(this.data,{key: item.ID})


  }

  startDateToQuery(){
    let d = new Date();
    d = d.setMonth(d.getMonth() - this.monthsFromNow);
    d = this.formatDate(d);
    //console.log(d)
    return d;
  }

  $onInit() {
      //this.Modal.userStoryStockM();
      this.loadDataToDisplay();

  }

  customSortDate(a, b) {
    return new Date(a.Date).getTime() - new Date(b.Date).getTime();
}

  custmSortQuotes(a,b) {
  return b.Close - a.Close ;
}

  addSeries(key, values) {
    let stockData = {};
    stockData.key = key;
    stockData.values = [];
    let newValues =  values.sort(this.customSortDate);
    values.map(quote => {
      stockData.values.push(quote);
    })
     this.data.push(stockData);

  }

  loadDataToDisplay() {
     this.data = [];
     this.$http.get('/api/stocks')
       .success(response => {
          //console.log(response);
          this.stockList = response;
          this.loadSocket();
          response.map(item => {
          this.$http.get(this.urlForYahooQuery(item.ID))
            .success( ret => {
              this.addSeries(item.ID, ret.query.results.quote);
            }
          )
        })
    })
  }

  CaptEnter(event) {
    if (event.which === 13) {
      this.addStock();
    }
  }

  addStock() {
    //console.log(this.stockList);
    //first check if the Stock code exists od the local database
    //avoding duplicity if exists is alreredy loaded on graph
    if (!_.find(this.stockList, {
        ID: this.stockAdd
      })) {
      this.$http.get(this.urlForYahooQuery(this.stockAdd))
        .success(data => {
          //check the return for a valid quotes...
          // that means more the 0 on count
          if (data.query.count === 0) {
            this.Modal.invalidQuote();
          } else {
            //console.log(this.stockList);
            //its valid then add to local db
            this.$http.post('/api/stocks', {
                ID: this.stockAdd,
                DESC: ''
              })

          }
        })
        .catch(error => console.log(error))
    }
  }

  deleteStock(item) {
    this.$http.delete(`/api/stocks/${item._id}`)
  }

  //Quanti api iKjZVpmzmah-k5o1zDKS
  //startDate = '2015-01-01', endDate = '2016-01-08'
  urlForYahooQuery (stockIDs) {
    const baseUrl = 'http://query.yahooapis.com/v1/public/yql?q=';
    const url = encodeURIComponent(`select Date,Close from yahoo.finance.historicaldata where symbol in ("${stockIDs}") and startDate = "${this.startDateToQuery()}" and endDate = "${this.endDateToQuery()}"`);
    const tailUrl = '&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys&callback=';
    const completeUrl = baseUrl + url + tailUrl;
    //console.log('completeUrl', decodeURIComponent(completeUrl));
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
        left: 40
      },


      x: d => d3.time.format('%Y-%m-%d').parse(d['Date']),
      y: d => d['Close'],

      noData: 'Loading Data from Yahoo finance API',
      interactive: true,
      tooltips: true,
      color: d3.scale.category10().range(),
      duration: 300,
      useInteractiveGuideline: true,
      clipVoronoi: false,
      //forceY: [0, this.MaxValueY],

      xAxis: {
        axisLabel: "Dates",
        tickFormat: d => d3.time.format('%m/%d/%y')(new Date(d)),
        showMaxMin: false

      },

      yAxis: {
       showMaxMin: false,
       "margin": {
         "top": 0,
         "right": 0,
         "bottom": 0,
         "left": 0
       },
      },
      yDomain: [0,1000],
      deepWatchData: true
    }
  }

  chartConfig = {
    visible: true, // default: true
    extended: true, // default: false
    disabled: false, // default: false
    refreshDataOnly: true, // default: true
    deepWatchOptions: true, // default: true
    deepWatchData: true, // default: true
    deepWatchDataDepth: 2, // default: 2
    debounce: 10 // default: 10
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
