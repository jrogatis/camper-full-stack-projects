'use strict';

import angular from 'angular';
import ngMaterial from 'angular-material';

export function Modal($rootScope, $uibModal, ngMaterial) {
  /**
   * Opens a modal
   * @param  {Object} scope      - an object to be merged with modal's scope
   * @param  {String} modalClass - (optional) class(es) to be applied to the modal
   * @return {Object}            - the instance $uibModal.open() returns
   */
  function openModal(scope = {}, modalClass = 'modal-default') {
    var modalScope = $rootScope.$new();

    angular.extend(modalScope, scope);

    return $uibModal.open({
      template: require('./modal.pug'),
      windowClass: modalClass,
      scope: modalScope
    });
  }

  // Public API here
  return {

    /* Confirmation modals */
    confirm: {

      /**
       * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
       * @param  {Function} del - callback, ran when delete is confirmed
       * @return {Function}     - the function to open the modal (ex. myModalFn)
       * o del a definição da variavel que vai conter o call back
       */
      delete(del = angular.noop) {
        /**
         * Open a delete confirmation modal
         * @param  {String} name   - name or info to show on modal
         * @param  {All}           - any additional args are passed straight to del callback
         */
        return function() {
          var args = Array.prototype.slice.call(arguments);
          //aqui ele tira o primeiro item do array.... que teoricamente seria o call back...
          var name = args.shift();
          var deleteModal;

          deleteModal = openModal({
            modal: {
              dismissable: true,
              title: 'Confirm Delete',
              html: '<p>Are you sure you want to delete <strong>' + name + '</strong> ?</p>',
              buttons: [{
                classes: 'btn-danger',
                text: 'Delete',
                click(e) {
                  deleteModal.close(e);
                }
              }, {
                classes: 'btn-default',
                text: 'Cancel',
                click(e) {
                  deleteModal.dismiss(e);
                }
              }]
            }
          }, 'modal-danger');

          deleteModal.result.then(function(event) {
            //console.log(event);
            del.apply(event, args);
          });
        };
      }
    },
    needLogin() {
      var loginModal;

      loginModal = openModal({
        modal: {
          dismissable: true,
          title: 'Please Login',
          html: '<h3>You need to be a authenticated user to do this</h3>',
          buttons: [{
            classes: 'btn-default',
            text: 'Ok',
            click(e) {
              loginModal.dismiss(e);
            }
          }]
        }
      }, 'modal-danger');
    },
    needOwnership() {
      var needOwnershipModal;
      needOwnershipModal = openModal({
        modal: {
          dismissable: true,
          title: 'need Ownership',
          html: '<h3>You need to be the owner to perform this action.</h3>',
          buttons: [{
            classes: 'btn-default',
            text: 'Ok',
            click(e) {
              needOwnershipModal.dismiss(e);
            }
          }]
        }
      }, 'modal-danger');
    },
    invalidQuote() {
      var invalidQuoteModal;
      invalidQuoteModal = openModal({
        modal: {
          dismissable: true,
          title: 'Quote Code',
          html: '<h3>This quote code is invalid!</h3>',
          buttons: [{
            classes: 'btn-default',
            text: 'Ok',
            click(e) {
              invalidQuoteModal.dismiss();
            }
          }]
        }
      }, 'modal-danger');
    },
    userStoryStockM() {
      var userStoryStockM;
      userStoryStockM = openModal({
        modal: {
          dismissable: true,
          title: 'User Story',
          html: `<ul>
                  <li>I can view a graph displaying the recent trend lines for each added stock.</li>
                  <li>I can add new stocks by their symbol name.</li>
                  <li>I can remove stocks.</li>
                  <li>I can see changes in real-time when any other user adds or removes a stock. For this you will need to use Web Sockets.</li>
                </ul>`,
          buttons: [{
            classes: 'btn-default',
            text: 'Ok',
            click(e) {
              userStoryStockM.dismiss(e);
            }
          }]
        }
      }, 'modal-info');
    },
       sameOwner() {
      var sameOwner;
      sameOwner = openModal({
        modal: {
          dismissable: true,
          title: 'Same Owner',
          html: '<h3>You alredy own this book.</h3>',
          buttons: [{
            classes: 'btn-default',
            text: 'Ok',
            click(e) {
              sameOwner.dismiss(e);
            }
          }]
        }
      }, 'modal-danger');
    },
  };
}

Modal.$inject = ['$rootScope', '$uibModal'];

export default angular.module('camperFullStackProjectsApp.Modal', [ngMaterial])
  .factory('Modal', Modal)
  .name;
