'use strict';

angular.module('fireideaz').controller('MessageCtrl', [
  '$scope',
  '$window',
  'FirebaseService',
  'ModalService',
  'VoteService',
  function($scope, $window, firebaseService, modalService, voteService) {
    function mergeCardVotes(first, second) {
      voteService.mergeMessages($scope.userId, first, second);
    }
    $scope.modalService = modalService;
    $scope.userId = $window.location.hash.substring(1);

    $scope.dropCardOnCard = function(dragEl, dropEl) {
      if (dragEl !== dropEl) {
        $scope.dragEl = dragEl;
        $scope.dropEl = dropEl;

        modalService.openMergeCards($scope);
      }
    };

    $scope.dropped = function(dragEl, dropEl) {
      var drag = $('#' + dragEl);
      var drop = $('#' + dropEl);
      var firstCardId = drag.attr('messageId');
      var secondCardId = drop.attr('messageId');
      var firstCardReference = firebaseService.getMessageRef(
        $scope.userId,
        firstCardId
      );
      var secondCardReference = firebaseService.getMessageRef(
        $scope.userId,
        secondCardId
      );

      secondCardReference.once('value', function(firstCard) {
        firstCardReference.once('value', function(secondCard) {
          secondCardReference.update({
            text: firstCard.val().text + '\n' + secondCard.val().text,
            votes: firstCard.val().votes + secondCard.val().votes
          });

          mergeCardVotes(firstCardId, secondCardId);
          firstCardReference.remove();
          modalService.closeAll();
        });
      });
    };
  }
]);
