// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  Displays several views as scenes that can slide on and off the screen.  The
  scene view is a nice way to provide a simple effect of moving from a 
  higher level screen to a more detailed level screen.  You will be able to
  optionally choose the kind of animation used to transition the two scenes 
  as well if supported on the web browser.
  
  h1. Using The View
  
  To setup the scene view, you should define the 'scenes' property with an 
  array of scene names.  These will be the properties on the scene view that
  you can shift in an out of view as needed.  You can edit the scenes property
  at any time.  It will only be used when you start to transition from one
  scene to another.
  
  Next you should set your nowShowing property to the name of the scene you 
  would like to display.  This will cause the view to transition scenes if it
  is visible on screen.  Otherwise, it will simply make the new scene view 
  the current content view and that's it.

  @extends SC.View
  @since SproutCore 1.0
*/
SC.SceneView = SC.ContainerView.extend(
/** @scope SC.SceneView.prototype */ {

  // ..........................................................
  // Properties
  // 

  /**
    The currently showing scene.  Changing this property will cause the 
    scene view to transition to the new scene.  If you set this property to 
    null, an empty string, or a non-existant scene, then the scene will appear
    empty.

    @property {String|SC.View}
    @default null
  */
  nowShowing: null,

  /**
    Array of scene names.  Scenes will slide on and off screen in the order
    that you specifiy them here.  That is, if you shift from a scene at index
    2 to a scene at index 1, the scenes will animation backwards.  If you
    shift to a scene at index 3, the scenes will animate forwards.
    
    The default scenes defined are 'master' and 'detail'.  You can replace or 
    augment this array as you like.
    
    @property {Array}
    @default ['master', 'detail']
  */
  scenes: ['master', 'detail'],

  /**
    Speed of transition.  Should be expressed in msec.
    
    @property {Number}
    @default 300
  */
  transitionDuration: 300,
  
  /**
    The ease to use on the transition.
    
    @property {String}
    @default 'ease-out'
  */
  transitionTiming: 'ease-out',


  // ..........................................................
  // Content Handling
  // 

  /**
    Whenever called to change the content, save the nowShowing state and
    then animate in by adjusting the layout.
  */
  replaceContent: function(content) {
    if (content && this._state === SC.SceneView.READY) this._animateScene(content);
    else this._replaceScene(content, YES);
    return this;
  },


  // ..........................................................
  // Internal Support
  // 

  /** @private
    Possible values:
      - SC.SceneView.NO_VIEW
      - SC.SceneView.ANIMATING
      - SC.SceneView.READY
    
    @property {String}
    @default SC.SceneView.NO_VIEW
  */
  _state: 'NO_VIEW',

  /** @private
    Invoked whenever we just need to swap the scenes without playing an
    animation.
    
    @param {SC.View} newContent The content to use as the new scene
    @param {Boolean} removeChildren If true, removes the children currently appended
  */
  _replaceScene: function(newContent, removeChildren) {
    var layout = SC.SceneView.STANDARD_LAYOUT,
        scenes = this.get('scenes'),
        idx = scenes ? scenes.indexOf(this.get('nowShowing')) : -1;
    
    if (removeChildren) this.removeAllChildren();
    
    if (newContent) {
      newContent.set('layout', layout);
      this.appendChild(newContent);
    }
    
    this._targetView = newContent;
    
    this._state = newContent ? SC.SceneView.READY : SC.SceneView.NO_VIEW;
  },

  /** @private
    Invoked whenever we need to animate in the new scene.
    
    @param {SC.View} newContent The content to use as the new scene
  */
  _animateScene: function(newContent) {
    var oldContent = this._targetView,
        outIdx = this._targetIndex,
        scenes = this.get('scenes'),
        inIdx = scenes ? scenes.indexOf(this.get('nowShowing')) : -1,
        info = {duration: this.get('transitionDuration') / 1000, timing: this.get('transitionTiming')},
        oldContentFrame = oldContent ? oldContent.get('frame') : null,
        frame = SC.clone(this.get('frame')),
        that = this, left;
    
    if (outIdx < 0 || inIdx < 0 || outIdx === inIdx || !newContent || !oldContent) {
      return this._replaceScene(newContent, YES);
    }
    
    delete frame.x;
    delete frame.y;
    delete oldContentFrame.x;
    delete oldContentFrame.y;
    
    // we want widths/heights set on the view before animating left
    oldContent.adjust(oldContentFrame);
    
    if (inIdx < outIdx) {
      left = oldContentFrame.width;
      frame.left = -frame.width;
    } else {
      left = -oldContentFrame.width;
      frame.left = frame.width;
    }
    
    newContent.adjust(frame);
    
    this.appendChild(newContent);
    
    this._targetView = newContent;
    this._targetIndex = inIdx;
    
    oldContent.invokeLater('animate', 1, 'left', left, info, function() {
      if (oldContent.get('parentView') === that) that.removeChild(oldContent);
    });
    
    newContent.invokeLater('animate', 1, 'left', 0, info, function() {
      that._replaceScene(newContent, NO);
    });
  }

});

SC.SceneView.NO_VIEW = 'NO_VIEW';
SC.SceneView.ANIMATING = 'ANIMATING';
SC.SceneView.READY = 'READY';

/** @private - standard layout assigned to views at rest */
SC.SceneView.STANDARD_LAYOUT = {bottom: 0, left: 0, right: 0, top: 0};
