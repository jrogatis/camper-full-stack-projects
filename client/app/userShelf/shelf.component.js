'use strict';

import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './shelf.routes';
import _Auth from '../../components/auth/auth.module';
import oauthButtons from '../../components/oauth-buttons';
import jsonpatch from 'fast-json-patch';
import ModalService from '../../components/modal/modal.service';
import ngMessages from 'angular-messages';
import ngMaterial from 'angular-material';
import ngAnimate from 'angular-animate';
import vAccordion from 'v-accordion';
import _ from 'lodash';




export class ShelfController {
  /*@ngInject*/
  constructor($scope, $http, Auth, $window, $routeParams, Modal, $mdDialog, socket) {
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
    this.socket = socket;
    this.userOffers = [];
    this.userRequests = [];

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('books');
    })
  }

  loadSocket() {
    this.socket.syncUpdates('books', this.userRegistry, (event, item) => {
      switch (event) {
      case 'deleted':
        console.log(event);
        break;
      case 'created':
        console.log(event);
        break;
      default:
        console.log('no default', event);
      }
    });
    return true;
  }

  $onInit() {
    this.Auth.getCurrentUser(user => {
      this.$http.get(`/api/books/user/${user._id}`)
        .success(result => {
          this.userRegistry = result;
          this.loadSocket();
          this.findOfferDetails();
          this.findRequestDetails();
        });
    });
  }

  CaptEnter(event) {
    if (event.which === 13) {
      this.searchBook(event);
    }
  }

  searchBook(ev) {
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
        clickOutsideToClose: false,
        fullscreen: this.$scope.customFullscreen // Only for -xs, -sm breakpoints.
      })
      .then(answer => {
        this.addBookonDb(answer);
      });
  };

  addBookonDb(index) {
    const bookToAdd = this.$scope.booksJson[index];
    const book = {
      googleID: bookToAdd.id,
      title: bookToAdd.volumeInfo.title,
      author: ('authors' in bookToAdd.volumeInfo) ? bookToAdd.volumeInfo.authors[0] : '',
      imgUrl: bookToAdd.volumeInfo.imageLinks.smallThumbnail
    }
    const userReg = {
      userID: this.CurUser._id,
      userName: this.CurUser.name,
      booksOwned: [book]
    }

    //fist get to know if user have books or not
    //console.log('antes da checagem', this.userBooks, book)
    if (this.userRegistry) {
      //if this user hav books so add only the booksOwned fild.
      const observer = jsonpatch.observe(this.userRegistry);
      this.userRegistry.booksOwned.push(book);
      var patches = jsonpatch.generate(observer);
      this.$http.patch(`/api/books/${this.userRegistry.userID}`, patches)
        .then(this.titleToSearch = '');
    } else {
      // insert a full register
      this.$http.post('/api/books', userReg)
        .then(this.titleToSearch = '');
      this.userRegistry = userReg;
    }
  }

  deleteBook(index) {
    const observer = jsonpatch.observe(this.userRegistry);
    this.userRegistry.booksOwned.splice(index, 1);
    var patches = jsonpatch.generate(observer);
    this.$http.patch(`/api/books/${this.userRegistry._id}`, patches);
  }

  findOfferDetails() {
    this.userRegistry.pendingTradingOffers.map((tradingOffer, index) => {
      //get the book details to display
      this.$http.get(`/api/books/book/${tradingOffer.bookOfferID}`)
        .then(bookDetail => {
            //find details for this specific book
          const specificBookOffer = _.find(bookDetail.data.booksOwned, {
            _id: tradingOffer.bookOfferID
          });
          const specificBookRequest = _.find(this.userRegistry.booksOwned, {
            _id: tradingOffer.bookRequestedID
          });
          let offerToAdd = {

            offerBookId: specificBookOffer._id,
            offerTitle: specificBookOffer.title,
            offerUrl: specificBookOffer.imgUrl,
            requestedBookId: specificBookRequest._id,
            requestedTitle: specificBookRequest.title,
            requestedUrl: specificBookRequest.imgUrl,
          };
          this.userOffers.push(offerToAdd);
        });
    })
  }

  findRequestDetails() {
    this.userRegistry.pendingTradingRequests.map((TradingRequests, index) => {
      //get the book details to display
      this.$http.get(`/api/books/book/${TradingRequests.bookRequestedID}`)
        .then(bookDetail => {
            //find details for this specific book
          const specificBookOffer = _.find(this.userRegistry.booksOwned, {
            _id: TradingRequests.bookOfferID
          })
          const specificBookRequest = _.find(bookDetail.data.booksOwned, {
            _id: TradingRequests.bookRequestedID
          })
          const requestToAdd = {
            offerBookId: specificBookOffer._id,
            offerTitle: specificBookOffer.title,
            offerUrl: specificBookOffer.imgUrl,
            requestedBookId: specificBookRequest._id,
            requestedTitle: specificBookRequest.title,
            requestedUrl: specificBookRequest.imgUrl,
          };
          this.userRequests.push(requestToAdd);
        });
    })
  }

  acceptOffer(index) {
     this.$http.post('/api/books/acceptTrade', {pendingTradingOffers: this.userRegistry.pendingTradingOffers[index]._id})
  }
}

DialogController.$inject = ['$scope', '$mdDialog'];

function DialogController($scope, $mdDialog) {
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

export default angular.module('camperFullStackProjectsApp.shelf', [ngRoute, _Auth, ModalService, ngMessages, ngMaterial, ngAnimate, vAccordion])
  .config(routing)
  .component('shelf', {
    template: require('./shelf.main.pug'),
    controller: ShelfController
  })
  .name;
