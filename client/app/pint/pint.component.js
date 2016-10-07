import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './books.routes';
import _Auth from '../../components/auth/auth.module';
import ngMaterial from 'angular-material';
import ModalService from '../../components/modal/modal.service';
import _ from 'lodash';


export class PintController {
  /*@ngInject*/
  constructor($scope, $http, Auth, $window, $routeParams, Modal) {
    this.$http = $http;
    this.$scope = $scope;
    this.Auth = Auth;
    this.$window = $window;
    this.$scope.searching = false;
    this.CurUser = this.Auth.getCurrentUserSync();
    this.$routeParams = $routeParams;
    this.Modal = Modal;
    this.$mdDialog = $mdDialog;
    this.$scope.customFullscreen = false;
  }

  $onInit() {
    /*this.$http.get('/api/books/allBooks')
      .then(results => {
        this.UserWithBooks = results.data;
        let books = [];
        results.data.map(user => {
          user.booksOwned.map(book => {
            books.push(book);
          });
        });
        this.allBooks = books;
      });*/
  }

  isLoggedIn() {
    return this.Auth.isLoggedInSync() ? true : false;
  }

}

export default angular.module('camperFullStackProjectsApp.pint', [ngRoute, _Auth])
  .config(routing)
  .component('pint', {
    template: require('./pint.main.pug'),
    controller: PintController
  })
  .name;

