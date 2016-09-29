import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './books.routes';
import _Auth from '../../components/auth/auth.module';
import oauthButtons from '../../components/oauth-buttons';
import jsonpatch from 'fast-json-patch';


export class BooksController {
  /*@ngInject*/
  constructor($scope, $http, Auth, $window, $routeParams) {
    this.$http = $http;
    this.$scope = $scope;
    this.Auth = Auth;
    this.$window = $window;
    this.$scope.searching = false;
    this.CurUser = this.Auth.getCurrentUserSync();
    this.$routeParams = $routeParams;
  }

  $onInit() {

  }

  CaptEnter(event) {
    if(event.which === 13) {

    }
  }

}

export default angular.module('camperFullStackProjectsApp.books', [ngRoute, _Auth])
  .config(routing)
  .component('books', {
    template: require('./books.main.pug'),
    controller: BooksController
  })
  .name;
