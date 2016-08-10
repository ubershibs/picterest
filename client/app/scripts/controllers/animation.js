(function() {
  'use strict';
  angular
    .module('picterestApp')
    .controller('AnimationCtrl', AnimationCtrl)
    .controller('DialogCtrl', DialogCtrl);

  AnimationCtrl.$inject = ['$mdPanel'];

  function AnimationCtrl($mdPanel) {
    this._mdPanel = $mdPanel;
    this.openFrom = 'button';
    this.closeTo = 'button';
    this.animationType = 'none';
  }

  AnimationCtrl.prototype.showDialog = function() {
    var position = this._mdPanel.newPanelPosition()
        .absolute()
        .center()
        .center();
    var animation = this._mdPanel.newPanelAnimation();
    animation.openFrom('.animation-target');
    animation.closeTo('.animation-target');
    animation.withAnimation(this._mdPanel.animation.SCALE);
    var config = {
      animation: animation,
      attachTo: angular.element(document.body),
      controller: DialogCtrl,
      controllerAs: 'ctrl',
      templateUrl: 'views/login.panel.html',
      panelClass: 'demo-dialog-example',
      position: position,
      trapFocus: true,
      zIndex: 150,
      clickOutsideToClose: true,
      clickEscapeToClose: true,
      hasBackdrop: true
    };

    this._mdPanel.open(config);
  };

  // Necessary to pass locals to the dialog template.
  function DialogCtrl(mdPanelRef) {
    this._mdPanelRef = mdPanelRef;
  }
  DialogCtrl.prototype.closeDialog = function() {
    this._mdPanelRef.close();
  };
})();
