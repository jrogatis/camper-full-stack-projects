import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './main.routes';
import ngTouch from 'angular-touch';
import jkAngularCarousel from 'angular-jk-carousel';
export class MainController {
  /*@ngInject*/
  constructor() {
    this.images = [
      {src: '/assets/images/nl.png'},
      {src: '/assets/images/books.png'},
      {src: '/assets/images/stock.png'},
      {src: '/assets/images/voting.png'},
      {src: '/assets/images/pint.png'}
    ]
  }
}

export default angular.module('camperFullStackProjectsApp.main', ['jkAngularCarousel'])
  .config(routing)
  .component('main', {
    template: require('./main.pug'),
    controller: MainController
  })
  .name;


