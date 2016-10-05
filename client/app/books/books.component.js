import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './books.routes';
import _Auth from '../../components/auth/auth.module';
import jsonpatch from 'fast-json-patch';
import ngMaterial from 'angular-material';
import ModalService from '../../components/modal/modal.service';


export class BooksController {
  /*@ngInject*/
  constructor($scope, $http, Auth, $window, $routeParams, $mdDialog, Modal) {
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
    this.$http.get('/api/books/allBooks')
      .then(results => {
        this.UserWithBooks = results.data;
        let books = []
        results.data.map(user => {
          user.booksOwned.map(book => {
            books.push(book);
          })
        })
        this.allBooks = books;
      })
  }

  isLoggedIn() {
   return  (this.Auth.isLoggedInSync())?true:false;
  }

  showDialog(ev, bookToRequestIndex) {
    this.dialog = this.$mdDialog.show({
        scope: this.$scope,
        preserveScope: true,
        controller: DialogAllBooksController,
        templateUrl: 'selectBocktoTrade.tmpl.pug',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false,
        fullscreen: this.$scope.customFullscreen // Only for -xs, -sm breakpoints.
      })
      .then(answer => {
        this.efectTrade(answer, bookToRequestIndex);
      });
  };

  proposeTrade(ev, bookToRequestIndex) {
    this.Auth.isLoggedIn(islogged => {
      if(islogged) {
        //open a modal with all the books that user owns to propose to trade
        //show the books that yhe logged user owns.
        this.booksThatUserOwns = _.find(this.UserWithBooks, {
          userID: this.CurUser._id
        })
        this.booksThatUserOwns = this.booksThatUserOwns.booksOwned;
        this.showDialog(ev, bookToRequestIndex)

      } else {
        this.Modal.needLogin();
      }
    })
  }

  efectTrade(offerIndex, requestIndex) {
    const bookToOfferID = this.booksThatUserOwns[offerIndex]._id;
    const bookToRequestID = this.allBooks[requestIndex]._id;
    //first check if its not the current user the owner of the request book
    if(_.find(this.booksThatUserOwns, {
        _id: bookToRequestID
      })) {
      alert('You alredy own this book, please select other!')
    } else {
      this.$http.post('/api/books/bookTrade', {
        bookToOfferID: bookToOfferID,
        bookToRequestID: bookToRequestID
      });
    }
  }
}

DialogAllBooksController.$inject = ['$scope', '$mdDialog'];

function DialogAllBooksController($scope, $mdDialog) {
  $scope.hide = function () {
    $mdDialog.hide();
  };

  $scope.cancel = function () {
    $mdDialog.cancel();
  };

  $scope.answer = function (answer) {
    $mdDialog.hide(answer);
  };
}

export default angular.module('camperFullStackProjectsApp.books', [ngRoute, _Auth, ModalService, ngMaterial])
  .config(routing)
  .component('books', {
    template: require('./books.main.pug'),
    controller: BooksController
  })
  .name;
