import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './pint.routes';
import _Auth from '../../components/auth/auth.module';
import ngMaterial from 'angular-material';
import ModalService from '../../components/modal/modal.service';
import _ from 'lodash';
import ngMessages from 'angular-messages';
import angularGrid from 'angulargrid';
import jsonpatch from 'fast-json-patch';


export class PintController {
  /*@ngInject*/
  constructor($scope, $http, Auth, $window, $routeParams, Modal, angularGridInstance, socket) {
    this.$http = $http;
    this.$scope = $scope;
    this.Auth = Auth;
    this.$window = $window;
    this.$scope.searching = false;
    this.CurUser = this.Auth.getCurrentUserSync();
    this.$routeParams = $routeParams;
    this.Modal = Modal;
    this.allPints = [];
    this.angularGridInstance = angularGridInstance;
    this.socket = socket;

     $scope.$on('$destroy', function() {
      socket.unsyncUpdates('pints');
    });
  }

  $onInit() {
   this.loadImages();
  }

  loadSocket() {
    this.socket.unsyncUpdates('pint');
    this.socket.syncUpdates('pint', this.allPints, (event, item) => {
      console.log('sockrt')
      switch (event) {
      case 'deleted':
         let newAllPints = [];
          this.allPints.map(pint => {
            if (pint._id != item._id) {
              newAllPints.push(pint)
            };
            this.allPints = newAllPints;
            this.angularGridInstance.gallery.refresh();
          })

        break;
      case 'created':
        console.log(item);
          const indexToAdd = _.findIndex(this.allPints,  pint => {
            return pint._id.toString() === item._id
          })
        this.$http.get(`/api/users/userInfo/${item.ownerId}`)
          .then(result => {
           const info = result.data
            if (info.provider === 'twitter') {
              this.allPints[indexToAdd].userImage = info.twitter.profile_image_url_https;
              this.allPints[indexToAdd].userName = info.name;
            }
          this.angularGridInstance.gallery.refresh()
        })
        console.log('no create', event);
        break;
      default:
        console.log('no default', event);
      }
    });
    return true;
  }

  loadImages() {
     this.$http.get('/api/pint/')
      .then(results => {
        this.allPints =  results.data;
        this.loadSocket();
        this.allPints.map( (pint, index) =>{
          this.$http.get(`/api/users/userInfo/${pint.ownerId}`)
            .then(result => {
             const info = result.data
              if (info.provider === 'twitter') {
                pint.userImage = info.twitter.profile_image_url_https;
                pint.userName = info.name;
              }
          })
        })
        this.angularGridInstance.gallery.refresh()
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



  isOwner(index) {
   return this.isLoggedIn() && this.allPints[index].ownerId ===  this.Auth.getCurrentUserSync()._id.toString();
  }

  vote(index) {
    if (this.Auth.isLoggedInSync()) {
      //fist check if the user alredy vote for this
      const curUserVotesIndex = _.findIndex(this.allPints[index].likes, likes => {
        return likes.userId === this.Auth.getCurrentUserSync()._id
      })
       const observer = jsonpatch.observe(this.allPints[index]);
      if(curUserVotesIndex === -1 ) {
        this.allPints[index].likes.push({
          userId: this.Auth.getCurrentUserSync()._id
        });
      } else {
        this.allPints[index].likes.splice(curUserVotesIndex,1);
      }
      var patches = jsonpatch.generate(observer);
      this.$http.patch(`/api/pint/${this.allPints[index]._id}`, patches);
    } else {
      this.Modal.needLogin();
    }
  }

  deletePint(index) {
      console.log('delete')
      this.$http.delete(`/api/pint/${this.allPints[index]._id}`)
      }
}


export default angular.module('camperFullStackProjectsApp.pint', [ngRoute, _Auth, ngMessages, angularGrid])
  .config(routing)
  .component('pint', {
    template: require('./pint.main.pug'),
    controller: PintController
  })
  .name


