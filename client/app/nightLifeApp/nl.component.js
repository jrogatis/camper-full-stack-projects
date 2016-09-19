import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './nl.routes';
import _Auth from '../../components/auth/auth.module';
//import ModalService from '../../components/modal/modal.service';
import oauthButtons from '../../components/oauth-buttons';
import jsonpatch from 'fast-json-patch';
import {
  requestYelp
}
from './yelp';

export class NLController {
  /*@ngInject*/
  constructor($scope, $http, Auth) {
    this.$http = $http;
    this.$scope = $scope;
    this.Auth = Auth;
    this.$scope.callbackCounter = 0;
    this.$scope.searching = false;
    this.CurUser = this.Auth.getCurrentUserSync();

  }

  CaptEnter() {
    if (event.which === 13) {
      this.searchVenue();
    }
  }

  addNewVenueOnDB(index) {
    this.$http.post('/api/nl', {
        ID: this.AllVenues(index),
        usersGoing: [{
          userID: "saco"
      }]
      })
      .then(response => {
        console.log(response);
      });
  }

  HaveThisUser(venue) {
    console.log(venue);
    let have = null;
    venue.usersGoing.map((user, index) => {
      //console.log(user, user.UserID, this.CurUser._id)
      if (user.userID === this.CurUser._id) {
        console.log('tem', index);
        have = index;
      };
    })
    return have
  }

  setUserGoing(VenueIndex) {
    //serch firt to know if this user alredy check this option
    this.$http.get(`api/nl/${this.AllVenues[VenueIndex].id}`)
      .success(venue => {
        let patches;
        const observer = jsonpatch.observe(venue)
        if (this.HaveThisUser(venue) === null) {
          venue.usersGoing.push({
            userID: this.CurUser._id
          });
          this.AllVenues[VenueIndex].QuantUsersGoing++;
        } else {
          this.AllVenues[VenueIndex].QuantUsersGoing--;
          venue.usersGoing.splice(this.HaveThisUser(venue), 1);
        }
        patches = jsonpatch.generate(observer);
        this.$http.patch(`/api/nl/${venue._id}`, patches);
      })
      .catch(error => {
      console.log(this.AllVenues[VenueIndex]);
        const toAdd = {
          ID: this.AllVenues[VenueIndex].id,
          usersGoing: [{
            userID: this.CurUser._id
          }]
        }
        this.$http.post('/api/nl', toAdd)
          .then(this.AllVenues[VenueIndex].QuantUsersGoing++);
        console.log(error);
      })
  }

  reqYelp(callback) {
    this.$scope.searching = true;
    requestYelp({
      location: this.searchTerms,
      sort: '2'
    }, this.$scope.callbackCounter, (url, param) => {
      this.$http.jsonp(url, {
          params: param
        })
        .success(ret => {
          //this.AllVenues = ret.businesses;
          //console.log('ret da consulta', this.AllVenues);
          this.$scope.searching = false;
          return callback(ret.businesses)
        })
        .catch(error => {
          console.log(error);
          this.$scope.searching = false;
        });
    });
    this.$scope.callbackCounter++;
  }

  searchVenue() {
    if (this.Auth.isLoggedInSync()) {
      let newList = []
      this.reqYelp(response => {
        response.map((venue, index) => {
          let newVenue = venue;
          this.searchForUsersGoing(venue.id, response => {
            newVenue.QuantUsersGoing = response;
            newList.push(newVenue);
          })
        })
        this.AllVenues = newList;
      })
    }
  }

  searchForUsersGoing(id, callback) {
    //firt try for each venue find if have registers on database
    //console.log('searchForUsersGoing' , id);
    this.$http.get(`/api/nl/qUsers/${id}`)
      .success(response => {
        return callback(response); // response.usersGoing.length    
      })
      .catch(error => {
        console.log(error);
      });
  };
}

export default angular.module('camperFullStackProjectsApp.nl', [ngRoute, _Auth, oauthButtons])
  .config(routing, function ($mdThemingProvider) {
    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey')
      .dark()
      .theme('dark-orange')
      .backgroundPalette('orange')
      .dark()
      .theme('dark-purple')
      .backgroundPalette('deep-purple')
      .dark()
      .theme('dark-blue')
      .backgroundPalette('blue')
      .dark();
  })
  .component('nl', {
    template: require('./nl.main.pug'),
    controller: NLController
  })
  .name;
