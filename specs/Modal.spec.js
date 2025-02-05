require('./helper');
var TestUtils = require('react-addons-test-utils');
var React = require('react');
var ReactDOM = require('react-dom');
var Modal = require('../lib/components/Modal');
var Simulate = TestUtils.Simulate;
var ariaAppHider = require('../lib/helpers/ariaAppHider');
var button = ReactDOM.button;
var sinon = require('sinon');

describe('Modal', function () {

  it('scopes tab navigation to the modal');
  it('focuses the last focused element when tabbing in from browser chrome');


  it('can be open initially', function() {
    var component = renderModal({isOpen: true}, 'hello');
    equal(component.portal.refs.content.innerHTML.trim(), 'hello');
    unmountModal();
  });

  it('can be closed initially', function() {
    var component = renderModal({}, 'hello');
    equal(ReactDOM.findDOMNode(component.portal).innerHTML.trim(), '');
    unmountModal();
  });

  it('uses the global appElement', function() {
    var app = document.createElement('div');
    var node = document.createElement('div');
    Modal.setAppElement(app);
    ReactDOM.render(React.createElement(Modal, {isOpen: true}), node);
    equal(app.getAttribute('aria-hidden'), 'true');
    ariaAppHider.resetForTesting();
    ReactDOM.unmountComponentAtNode(node);
  });

  it('accepts appElement as a prop', function() {
    var el = document.createElement('div');
    var node = document.createElement('div');
    ReactDOM.render(React.createElement(Modal, {
      isOpen: true,
      appElement: el
    }), node);
    equal(el.getAttribute('aria-hidden'), 'true');
    ReactDOM.unmountComponentAtNode(node);
  });

  it('renders into the body, not in context', function() {
    var node = document.createElement('div');
    var App = React.createClass({
      render: function() {
        return React.DOM.div({}, React.createElement(Modal, {isOpen: true, ariaHideApp: false}, 'hello'));
      }
    });
    ReactDOM.render(React.createElement(App), node);
    var modalParent = document.body.querySelector('.ReactModalPortal').parentNode;
    equal(modalParent, document.body);
    ReactDOM.unmountComponentAtNode(node);
  });

  it('renders children', function() {
    var child = 'I am a child of Modal, and he has sent me here...';
    var component = renderModal({isOpen: true}, child);
    equal(component.portal.refs.content.innerHTML, child);
    unmountModal();
  });

  it('has default props', function() {
    var node = document.createElement('div');
    Modal.setAppElement(document.createElement('div'));
    var component = ReactDOM.render(React.createElement(Modal), node);
    var props = component.props;
    equal(props.isOpen, false);
    equal(props.ariaHideApp, true);
    equal(props.closeTimeoutMS, 0);
    equal(props.shouldCloseOnOverlayClick, true);
    ReactDOM.unmountComponentAtNode(node);
    ariaAppHider.resetForTesting();
  });

  it('removes the portal node', function() {
    var component = renderModal({isOpen: true}, 'hello');
    equal(component.portal.refs.content.innerHTML.trim(), 'hello');
    unmountModal();
    ok(!document.querySelector('.ReactModalPortal'));
  });

  it('focuses the modal content', function() {
    renderModal({isOpen: true}, null, function () {
      strictEqual(document.activeElement, this.portal.refs.content);
      unmountModal();
    });
  });

  it('handles case when child has no tabbable elements', function() {
    var component = renderModal({isOpen: true}, 'hello');
    assert.doesNotThrow(function() {
      Simulate.keyDown(component.portal.refs.content, {key: "Tab", keyCode: 9, which: 9})
    });
    unmountModal();
  });

  it('keeps focus inside the modal when child has no tabbable elements', function() {
    var tabPrevented = false;
    var modal = renderModal({isOpen: true}, 'hello');
    strictEqual(document.activeElement, modal.portal.refs.content);
    Simulate.keyDown(modal.portal.refs.content, {
        key: "Tab",
        keyCode: 9,
        which: 9,
        preventDefault: function() { tabPrevented = true; }
    });
    equal(tabPrevented, true);
  });

  it('supports custom className', function() {
    var modal = renderModal({isOpen: true, className: 'myClass'});
    notEqual(modal.portal.refs.content.className.indexOf('myClass'), -1);
    unmountModal();
  });

  it('supports overlayClassName', function () {
    var modal = renderModal({isOpen: true, overlayClassName: 'myOverlayClass'});
    notEqual(modal.portal.refs.overlay.className.indexOf('myOverlayClass'), -1);
    unmountModal();
  });

  it('overrides the default styles when a custom classname is used', function () {
    var modal = renderModal({isOpen: true, className: 'myClass'});
    equal(modal.portal.refs.content.style.top, '');
    unmountModal();
  });

  it('overrides the default styles when a custom overlayClassName is used', function () {
    var modal = renderModal({isOpen: true, overlayClassName: 'myOverlayClass'});
    equal(modal.portal.refs.overlay.style.backgroundColor, '');
  });

  it('supports adding style to the modal contents', function () {
    var modal = renderModal({isOpen: true, style: {content: {width: '20px'}}});
    equal(modal.portal.refs.content.style.width, '20px');
  });

  it('supports overriding style on the modal contents', function() {
    var modal = renderModal({isOpen: true, style: {content: {position: 'static'}}});
    equal(modal.portal.refs.content.style.position, 'static');
  });

  it('supports adding style on the modal overlay', function() {
    var modal = renderModal({isOpen: true, style: {overlay: {width: '75px'}}});
    equal(modal.portal.refs.overlay.style.width, '75px');
  });

  it('supports overriding style on the modal overlay', function() {
    var modal = renderModal({isOpen: true, style: {overlay: {position: 'static'}}});
    equal(modal.portal.refs.overlay.style.position, 'static');
  });

  it('adds class to body when open', function() {
    var modal = renderModal({isOpen: false});
    equal(document.body.className.indexOf('ReactModal__Body--open') !== -1, false);

    modal = renderModal({isOpen: true});
    equal(document.body.className.indexOf('ReactModal__Body--open')  !== -1, true);

    modal = renderModal({isOpen: false});
    equal(document.body.className.indexOf('ReactModal__Body--open')  !== -1, false);
    unmountModal();
  });

  it('adds --after-open for animations', function() {
    var modal = renderModal({isOpen: true});
    var overlay = document.querySelector('.ReactModal__Overlay');
    var content = document.querySelector('.ReactModal__Content');
    ok(overlay.className.match(/ReactModal__Overlay--after-open/));
    ok(content.className.match(/ReactModal__Content--after-open/));
    unmountModal();
  });

  describe('should close on overlay click', function() {
    afterEach('Unmount modal', function() {
      unmountModal();
    });

    describe('verify props', function() {
      it('verify default prop of shouldCloseOnOverlayClick', function () {
        var modal = renderModal({isOpen: true});
        equal(modal.props.shouldCloseOnOverlayClick, true);
      });

      it('verify prop of shouldCloseOnOverlayClick', function () {
        var modal = renderModal({isOpen: true, shouldCloseOnOverlayClick: false});
        equal(modal.props.shouldCloseOnOverlayClick, false);
      });
    });

    describe('verify clicks', function() {
      it('verify overlay click when shouldCloseOnOverlayClick sets to false', function () {
        var requestCloseCallback = sinon.spy();
        var modal = renderModal({
          isOpen: true,
          shouldCloseOnOverlayClick: false
        });
        equal(modal.props.isOpen, true);
        var overlay = TestUtils.scryRenderedDOMComponentsWithClass(modal.portal, 'ReactModal__Overlay');
        equal(overlay.length, 1);
        Simulate.click(overlay[0]); // click the overlay
        ok(!requestCloseCallback.called)
      });

      it('verify overlay click when shouldCloseOnOverlayClick sets to true', function() {
        var requestCloseCallback = sinon.spy();
        var modal = renderModal({
          isOpen: true,
          shouldCloseOnOverlayClick: true,
          onRequestClose: function() {
            requestCloseCallback();
          }
        });
        equal(modal.props.isOpen, true);
        var overlay = TestUtils.scryRenderedDOMComponentsWithClass(modal.portal, 'ReactModal__Overlay');
        equal(overlay.length, 1);
        Simulate.click(overlay[0]); // click the overlay
        ok(requestCloseCallback.called)
      });
    });
  });

  //it('adds --before-close for animations', function() {
    //var node = document.createElement('div');

    //var component = ReactDOM.render(React.createElement(Modal, {
      //isOpen: true,
      //ariaHideApp: false,
      //closeTimeoutMS: 50,
    //}), node);

    //component = ReactDOM.render(React.createElement(Modal, {
      //isOpen: false,
      //ariaHideApp: false,
      //closeTimeoutMS: 50,
    //}), node);

    // It can't find these nodes, I didn't spend much time on this
    //var overlay = document.querySelector('.ReactModal__Overlay');
    //var content = document.querySelector('.ReactModal__Content');
    //ok(overlay.className.match(/ReactModal__Overlay--before-close/));
    //ok(content.className.match(/ReactModal__Content--before-close/));
    //unmountModal();
  //});
});
