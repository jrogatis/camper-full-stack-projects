import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './nl.routes';
//import _Auth from '../../components/auth/auth.module';
//import angularAria from 'angular-aria';
//import angularAnimate from 'angular-animate';
//import angularMaterial from 'angular-material';
//import ModalService from '../../components/modal/modal.service';
import {
  requestYelp
}
from './yelp';

export class NLController {
  /*@ngInject*/
  constructor($http, $scope) {
    this.$http = $http;
    this.$scope = $scope;
    // //this.Auth = Auth;
    this.$scope.callbackCounter = 0;

  }

  CaptEnter(e) {
    if (event.which === 13) {
      this.searchVenue()
    }
  }

  searchVenue() {
    requestYelp({
      location: this.searchTerms,
      sort: '2'
    }, this.$scope.callbackCounter, (url, param) => {
      this.$http.jsonp(url, {
          params: param
        })
        .success(ret => {
          this.AllVenues = ret.businesses;

          console.log('ret da consulta', this.AllVenues);
        })
        .catch(error => {
          console.log(error)
        })
    })
    this.$scope.callbackCounter++
  }

}

export default angular.module('camperFullStackProjectsApp.nl', [ngRoute])
  .config(routing, function ($mdThemingProvider) {
    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
    $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
    $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
    $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
  })
  .component('nl', {
    template: require('./nl.main.pug'),
    controller: NLController
  })
  .name;
