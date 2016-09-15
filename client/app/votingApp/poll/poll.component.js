import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './poll.routes';
import _Auth from '../../../components/auth/auth.module';
import ModalService from '../../../components/modal/modal.service';
import jsonpatch from 'fast-json-patch';
import chart from 'angular-chart.js';

export class PollController {
  /*@ngInject*/
  constructor($http, $routeParams, $scope, socket, Auth, Modal) {
    this.$http = $http;
    this.$routeParams = $routeParams;
    this.socket = socket;
    this.Auth = Auth;
    this.Modal = Modal;
    this.$scope = $scope;
    this.chartColors = ['black', 'rgba(151, 187, 205, 0.83)', 'rgb(220, 220, 220, 0.83)', '#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'];
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('poll');
    });
  }

  $onInit() {
    //console.log('id', this.$routeParams);
    this.$http.get(`/api/polls/${this.$routeParams.id}`)
      .then(response => {
        this.Poll = response.data;
        this.labels = this.Poll.items.map(item => item.item);
        this.data = this.Poll.items.map(item => item.votes);
        this.series = ['Votes'];
      });
  }

  updateChart() {
    this.labels = this.Poll.items.map(item => item.item);
    this.data = this.Poll.items.map(item => item.votes);
  }

  deletePollItem(pollItemIndex) {
    if(this.Auth.isLoggedInSync()) {
      const user = this.Auth.getCurrentUserSync();
      console.log(user, this.Poll.owner);
      if(user._id === this.Poll.owner) {
        const observer = jsonpatch.observe(this.Poll);
        this.Poll.items.splice(pollItemIndex, 1);
        var patches = jsonpatch.generate(observer);
        this.$http.patch(`/api/polls/${this.Poll._id}`, patches);
        this.newPollItem = '';
        this.updateChart();
      } else {
        this.Modal.needOwnership();
      }
    } else {
      this.Modal.needLogin();
    }
  }

  vote(index) {
    const observer = jsonpatch.observe(this.Poll);
    this.Poll.items[index].votes++;
    var patches = jsonpatch.generate(observer);
    this.$http.patch(`/api/polls/${this.Poll._id}`, patches);
    this.updateChart();
  }

  addPollItem() {
    if(this.newPollItem && this.Auth.isLoggedInSync()) {
      const user = this.Auth.getCurrentUserSync();
      if(user._id === this.Poll.owner) {
        const observer = jsonpatch.observe(this.Poll);
        this.Poll.items.push({item: this.newPollItem, votes: 0});
        var patches = jsonpatch.generate(observer);
        this.$http.patch(`/api/polls/${this.Poll._id}`, patches);
        this.newPollItem = '';
        this.updateChart();
      } else {
        this.Modal.needOwnership();
      }
    } else {
      this.Modal.needLogin();
    }
  }
}

export default angular.module('camperFullStackProjectsApp.poll', [ngRoute, _Auth, ModalService, chart])
  .config(routing)
  .component('poll', {
    template: require('./poll.pug'),
    controller: PollController
  })
  .name;
