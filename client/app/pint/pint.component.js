import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './pint.routes';
import _Auth from '../../components/auth/auth.module';
import ngMaterial from 'angular-material';
import ModalService from '../../components/modal/modal.service';
import _ from 'lodash';
import ngMessages from 'angular-messages';
import angularGrid from 'angulargrid';


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
    this.allPints = [];
  }

  $onInit() {
    this.$http.get('/api/pint/')
      .then(results => {
        this.allPints =  results.data;
        console.log(  this.allPints );
      });
  }

  isLoggedIn() {
    return this.Auth.isLoggedInSync() ? true : false;
  }

  addPicture() {
    const picToAdd = {
      ownerId: this.Auth.getCurrentUserSync()._id,
      imgUrl: this.UrlToAdd,
      desc: this.DescToAdd
    };
    this.$http.post('api/pint', picToAdd);

  }

}

export default angular.module('camperFullStackProjectsApp.pint', [ngRoute, _Auth, ngMessages, angularGrid])
  .config(routing)
  .component('pint', {
    template: require('./pint.main.pug'),
    controller: PintController
  })
  .name;

