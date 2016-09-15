import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './vote.routes';
import _Auth from '../../components/auth/auth.module';
import ModalService from '../../components/modal/modal.service';

export class VoteController {
  /*@ngInject*/
  constructor($http, $scope, $location, socket, Auth, Modal) {
    this.$http = $http;
    this.socket = socket;
    this.Auth = Auth;
    this.Modal = Modal;
    this.$location = $location;

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('poll');
    });
  }

  $onInit() {
    this.$http.get('/api/polls')
      .then(response => {
        this.allPolls = response.data;
        this.socket.syncUpdates('poll', this.allPolls);
      });
  }

  deletePoll(name, pollId) {
    if(this.Auth.isLoggedInSync()) {
      const user = this.Auth.getCurrentUserSync();
      const actualPoll = this.allPolls.filter(poll => {
        return poll._id === pollId;
      });
      if(user._id === actualPoll[0].owner) {
        this.Modal.confirm.delete(PollId => {
          this.$http.delete(`/api/polls/${PollId}`);
        })(name, pollId);
      } else {
        this.Modal.needOwnership();
      }
    } else {
      this.Modal.needLogin();
    }
  }

  addPoll() {
    if(this.newPoll && this.Auth.isLoggedInSync()) {
      const user = this.Auth.getCurrentUserSync();
      this.$http.post('/api/polls', {name: this.newPoll, owner: user._id})
        .then(response => {
          this.$location.path(`/vote/${response.data._id}`);
          this.newPoll = '';
        });
    } else {
      this.Modal.needLogin();
    }
  }
}

export default angular.module('camperFullStackProjectsApp.vote', [ngRoute, _Auth, ModalService])
  .config(routing)
  .component('vote', {
    template: require('./vote.main.pug'),
    controller: VoteController
  })
  .name;
