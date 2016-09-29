import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './shelf.routes';
import _Auth from '../../components/auth/auth.module';
import oauthButtons from '../../components/oauth-buttons';
import jsonpatch from 'fast-json-patch';
import ModalService from '../../components/modal/modal.service';
import ngMessages from 'angular-messages';
import ngMaterial from 'angular-material';



export class ShelfController {
  /*@ngInject*/
  constructor($scope, $http, Auth, $window, $routeParams, Modal, $mdDialog) {
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
    this.Auth.getCurrentUser(user => {
      this.$http.get(`/api/books/user/${user._id}`)
        .success(result => {
          this.userBooks = result.booksOwned;
          console.log(this.userBooks);
      });
    });

  }

  CaptEnter(event) {
    if(event.which === 13) {
      this.searchBook(event);
    }
  }

  searchBook(ev){
    const baseUrl = 'https://www.googleapis.com/books/v1/volumes?q=';
    const searchStr = this.titleToSearch.split(' ').join('+');
    const midleUrl = `"${searchStr}"`;
    const tailUrl = '&printType=books&key=AIzaSyDBnaoG2Rh_dq6DyNVrpglN-uBjP8lMsI8';
    const url = `${baseUrl}${midleUrl}${tailUrl}`;
    this.$http.get(url)
      .success(response => {
        this.$scope.booksJson = response.items;
        this.showDialog(ev);
      })
  }

  showDialog(ev) {
   this.dialog = this.$mdDialog.show({
        scope: this.$scope,
        preserveScope: true,
        controller: DialogController,
        templateUrl: 'selectBock.tmpl.pug',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        fullscreen: this.$scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(answer => {
         this.addBookonDb(answer);
      });
  };

  addBookonDb(index) {
    const bookToAdd = this.$scope.booksJson[index];
    const book = {
            userID:  this.CurUser._id,
            booksOwned:[{
              googleID: bookToAdd.id,
              title: bookToAdd.volumeInfo.title,
              author: bookToAdd.volumeInfo.Authors[0],
              imgUrl: bookToAdd.volumeInfo.imageLinks.smallThumbnail
            }]
          }
    //fist get to know if user have books or not
    this.$http.get(`/api/books/user/${this.CurUser._id}`)
      .success(result => {
        //if this user hav books so add only the booksOwned fild.
        const observer = jsonpatch.observe(result);
        result.booksOwned.push(book.booksOwned);
        var patches = jsonpatch.generate(observer);
        console.log(patches);
        this.$http.patch(`/api/books/${this.CurUser._id}`, patches);
      })
      .catch(error => {
        if(error.status === 404) {
          //if dont have add a complete register
          this.$http.post(`/api/books/`, book )
        }
      }
    );
  }
}

  DialogController.$inject =['$scope', '$mdDialog'];

  function DialogController($scope, $mdDialog) {
    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
  }

export default angular.module('camperFullStackProjectsApp.shelf', [ngRoute, _Auth, ModalService, ngMessages, ngMaterial])
  .config(routing)
  .component('shelf', {
    template: require('./shelf.main.pug'),
    controller: ShelfController
  })
  .name;
