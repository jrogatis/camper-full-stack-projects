import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './main.routes';

export class MainController {
/*@ngInject*/
}

export default angular.module('camperFullStackProjectsApp.main', [])
  .config(routing)
  .component('main', {
    template: require('./main.pug'),
    controller: MainController
  })
  .name;
