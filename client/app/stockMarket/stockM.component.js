import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './stockM.routes';



export class stockMController {
  /*@ngInject*/
  constructor($scope, $http, $window, $routeParams) {
    this.$http = $http;
    this.$scope = $scope;
    this.$window = $window;
    this.$routeParams = $routeParams;
  }

  $onInit() {

  }

  CaptEnter(event) {
    if(event.which === 13) {
      this.searchVenue();
    }
  }

  }


export default angular.module('camperFullStackProjectsApp.stockm', [ngRoute])
  .config(routing)
  .component('stockm', {
    template: require('./stockM.main.pug'),
    controller: stockMController
  })
  .name;
