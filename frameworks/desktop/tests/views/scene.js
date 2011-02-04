// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test htmlbody ok equals same stop start */

var pane, defaultView, initTestView, customScenesView;

module("SC.SceneView", {
  setup: function() {
    SC.RunLoop.begin();
    
    pane = SC.MainPane.design({
      childViews: 'defaultView initTestView customScenesView'.w(),
      
      defaultView: SC.SceneView.design({
        master: SC.View.design({isMasterView: YES}),
        detail: SC.View.design({isDetailView: YES})
      }),
      
      initTestView: SC.SceneView.design({
        nowShowing: 'master',
        master: SC.View.design({isMasterView: YES}),
        detail: SC.View.design({isDetailView: YES})
      }),
      
      customScenesView: SC.SceneView.design({
        scenes: 'scene1 scene2'.w(),
        
        scene1: SC.View,
        scene2: SC.View
      })
    });
    pane.append();
    
    SC.RunLoop.end();
    
    defaultView = pane.get('defaultView');
    initTestView = pane.get('initTestView');
    customScenesView = pane.get('customScenesView');
  },

  teardown: function() {
    pane = defaultView = initTestView = customScenesView = null;
  }
});

test('defaults', function() {
  equals(defaultView.get('nowShowing'), null, 'view should have null nowShowing property');
  ['master', 'detail'].forEach(function(scene) {
    ok(defaultView.get('scenes').indexOf(scene) !== -1, 'view should have master and detail scenes');
  });
});

test('intialized view with nowShowing', function() {
  ok(defaultView.getPath('contentView.isMasterView'), 'setting nowShowing on view when inited sets the contentView property');
  ok(defaultView.getPath('contentView.isVisibleInWindow'), 'setting nowShowing on view when inited shows that view');
});

test('setting nowShowing to a string', function() {
  SC.RunLoop.begin();
  defaultView.set('nowShowing', 'master');
  SC.RunLoop.end();
  
  ok(defaultView.getPath('contentView.isMasterView'), 'setting nowShowing to master sets that view to the contentView property');
  ok(defaultView.getPath('contentView.isVisibleInWindow'), 'setting nowShowing to master shows that view');
});

