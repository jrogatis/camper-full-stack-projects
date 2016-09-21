import angular from 'angular';
const ngRoute = require('angular-route');
import routing from './nl.routes';
import _Auth from '../../components/auth/auth.module';
import oauthButtons from '../../components/oauth-buttons';
import jsonpatch from 'fast-json-patch';


export class NLController {
  /*@ngInject*/
  constructor($scope, $http, Auth, $window) {
    this.$http = $http;
    this.$scope = $scope;
    this.Auth = Auth;
    this.$window = $window;
    this.$scope.searching = false;
    this.CurUser = this.Auth.getCurrentUserSync();
  }

  CaptEnter() {
    if(event.which === 13) {
      this.searchVenue();
    }
  }

  HaveThisUser(venue) {
    let have = null;
    venue.usersGoing.map((user, index) => {
      if(user.userID === this.CurUser._id) {
        have = index;
      }
    });
    return have;
  }

  setUserGoing(VenueIndex) {
    //serch firt to know if this user alredy check this option
    this.$http.get(`api/nl/${this.AllVenues[VenueIndex].id}`)
      .success(venue => {
        let patches;
        const observer = jsonpatch.observe(venue);
        if(this.HaveThisUser(venue) === null) {
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
        };
        this.$http.post('/api/nl', toAdd)
          .then(this.AllVenues[VenueIndex].QuantUsersGoing++);
      });
  }

  fillListVenues() {
      this.$scope.searching = true;
    let newList = [];
      this.$http.get(`/api/yelp/${this.searchTerms}`)
        .then(response => {
        response.data.businesses.map(venue => {
          let newVenue = venue;
          this.searchForUsersGoing(venue.id, quant => {
            newVenue.QuantUsersGoing = quant;
            newList.push(newVenue);
          });
        });
        this.AllVenues = newList;
        this.$scope.searching = false;
      });
  }

  searchVenue() {
    if(this.Auth.isLoggedInSync()) {
      this.fillListVenues()
    } else {
      //twitter autoeization
      console.log('aqui', this.$window.location.href)
      this.$window.location.href = `/auth/twitter/nl/${encodeURIComponent(this.$window.location.href)}`;

      // a procura

    }
  }

  searchForUsersGoing(id, callback) {
    //firt try for each venue find if have registers on database
    this.$http.get(`/api/nl/qUsers/${id}`)
      .success(response => {
        return callback(response);
      })
      .catch(error => {
        console.log(error);
      });
  }
}

export default angular.module('camperFullStackProjectsApp.nl', [ngRoute, _Auth, oauthButtons])
  .config(routing, function($mdThemingProvider) {
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
