import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './nl.routes';
//import _Auth from '../../components/auth/auth.module';
//import angularAria from 'angular-aria';
//import angularAnimate from 'angular-animate';
//import angularMaterial from 'angular-material';
//import ModalService from '../../components/modal/modal.service';
import { requestYelp }  from './yelp';

export class NLController {
  /*@ngInject*/
  constructor($http, $scope) {
    this.$http = $http;
    this.$scope = $scope;
   // //this.Auth = Auth;
     this.$scope.callbackCounter = 0;

  }

  searchVenue () {
    requestYelp( {
      location: 'San Francisco',
      sort: '2'
      }, this.$scope.callbackCounter, (url, param) => {
        this.$http.jsonp(url,{params: param})
          .success(ret => {
          this.AllVenues = ret.data;
          this.$scope.callbackCounter++
          console.log('ret da consulta',ret);
        })
          .catch(error =>{console.log(error)})
    })
  }

}

export default angular.module('camperFullStackProjectsApp.nl', [ngRoute])
  .config(routing)
  .component('nl', {
    template: require('./nl.main.pug'),
    controller: NLController
  })
  .name;

