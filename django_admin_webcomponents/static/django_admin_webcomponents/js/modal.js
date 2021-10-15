class adminModal extends HTMLElement {
  constructor () {
    super();

    // FIXME: this.options = $.extend(true, {}, Modal.options, options);
    this.options = {
      onClose: false,
      closeOnEsc: true,
      minHeight: 400,
      minWidth: 800,
      modalDuration: 200,
      resizable: true,
      maximizable: true,
      minimizable: true
    }

    // states and events
    this.click = 'click.cms.modal';
    this.pointerDown = 'pointerdown.cms.modal contextmenu.cms.modal';
    this.pointerUp = 'pointerup.cms.modal pointercancel.cms.modal';
    this.pointerMove = 'pointermove.cms.modal';
    this.doubleClick = 'dblclick.cms.modal';
    this.touchEnd = 'touchend.cms.modal';
    this.keyUp = 'keyup.cms.modal';
    this.maximized = false;
    this.minimized = false;
    this.triggerMaximized = false;
    this.saved = false;

    this.ui = {}
  }

  _initUI() {
    this.ui = {
      modal: this.shadowRoot.querySelector('.cms-modal'),
      //body: $('html'),
      window: window,
      //toolbarLeftPart: $('.cms-toolbar-left'),
      closeButton: this.shadowRoot.querySelector('.cms-icon-close'),
      minimizeButton: this.shadowRoot.querySelector('.cms-modal-minimize'),
      maximizeButton: this.shadowRoot.querySelector('.cms-modal-maximize'),
      //title: modal.find('.cms-modal-title'),
      titlePrefix: this.shadowRoot.querySelector('.cms-modal-title-prefix'),
      titleSuffix: this.shadowRoot.querySelector('.cms-modal-title-suffix'),
      //resize: modal.find('.cms-modal-resize'),
      //breadcrumb: modal.find('.cms-modal-breadcrumb'),
      //closeAndCancel: modal.find('.cms-modal-close, .cms-modal-cancel'),
      modalButtons: this.shadowRoot.querySelector('.cms-modal-buttons'),
      modalBody: this.shadowRoot.querySelector('.cms-modal-body'),
      frame: this.shadowRoot.querySelector('.cms-modal-frame'),
      //shim: modal.find('.cms-modal-shim')
    };
  }
  _initEventListeners() {
    this.ui.closeButton.addEventListener('click', this.close.bind(this));
    this.ui.minimizeButton.addEventListener('click', this.minimize.bind(this));
    this.ui.maximizeButton.addEventListener('click', this.maximize.bind(this));
  }

  /**
   * Opens the modal either in an iframe or renders markup.
   *
   * @method open
   * @chainable
   * @param {Object} opts either `opts.url` or `opts.html` are required
   * @param {Object[]} [opts.breadcrumbs] collection of breadcrumb items
   * @param {String|HTMLNode|jQuery} [opts.html] html markup to render
   * @param {String} [opts.title] modal window main title (bold)
   * @param {String} [opts.subtitle] modal window secondary title (normal)
   * @param {String} [opts.url] url to render iframe, takes precedence over `opts.html`
   * @param {Number} [opts.width] sets the width of the modal
   * @param {Number} [opts.height] sets the height of the modal
   * @returns {Class} this
   */
  open(opts) {
     console.log("Modal: Opening")

    // setup internals
    if (!((opts && opts.url) || (opts && opts.html))) {
        throw new Error('The arguments passed to "open" were invalid.');
    }

    /*
    // We have to rebind events every time we open a modal
    // because the event handlers contain references to the instance
    // and since we reuse the same markup we need to update
    // that instance reference every time.
    this._events();

    Helpers.dispatchEvent('modal-load', {instance: this});
    // // trigger the event also on the dom element,
    // // because if we load another modal while one is already open
    // // the older instance won't receive any updates
    // this.ui.modal.trigger('cms.modal.load');

    // common elements state
    this.ui.resize.toggle(this.options.resizable);
    this.ui.minimizeButton.toggle(this.options.minimizable);
    this.ui.maximizeButton.toggle(this.options.maximizable);
    */

    var position = this._calculateNewPosition(opts);
















    /*
    this.ui.maximizeButton.removeClass('cms-modal-maximize-active');
    this.maximized = false;

    // because a new instance is called, we have to ensure minimized state is removed #3620
    if (this.ui.body.hasClass('cms-modal-minimized')) {
      this.minimized = true;
      this.minimize();
    }
    */
    // clear elements
    this.ui.modalButtons.querySelectorAll('*').forEach(n => n.remove());

    /*
    this.ui.breadcrumb.empty();

    // remove class from modal when no breadcrumbs is rendered
    this.ui.modal.removeClass('cms-modal-has-breadcrumb');

    // hide tooltip
    CMS.API.Tooltip.hide();
    */

    // redirect to iframe rendering if url is provided
    if (opts.url) {
      this._loadIframe({
        url: opts.url,
        title: opts.title,
        breadcrumbs: opts.breadcrumbs
      });
    } else {
      // if url is not provided we go for html
      this._loadMarkup({
        html: opts.html,
        title: opts.title,
        subtitle: opts.subtitle
      });
    }

    /*
    Helpers.dispatchEvent('modal-loaded', {instance: this});

    var currentContext = keyboard.getContext();

    if (currentContext !== 'modal') {
      previousKeyboardContext = keyboard.getContext();
      previouslyFocusedElement = $(document.activeElement);
    }
    */
    // display modal
    this._show({
      ...{ duration: this.options.modalDuration },
      ...position
    });
    /*

    keyboard.setContext('modal');
    this.ui.modal.trap();

    return this;

     */
  }

  /**
   * Calculates coordinates and dimensions for modal placement
   *
   * @method _calculateNewPosition
   * @private
   * @param {Object} [opts]
   * @param {Number} [opts.width] desired width of the modal
   * @param {Number} [opts.height] desired height of the modal
   * @returns {Object}
   */
  // eslint-disable-next-line complexity
  _calculateNewPosition(opts) {
    // lets set the modal width and height to the size of the browser
    var widthOffset = 300; // adds margin left and right
    var heightOffset = 300; // adds margin top and bottom;
    var screenWidth = this.ui.window.innerWidth;
    var screenHeight = this.ui.window.innerHeight;
    var modalWidth = opts.width || this.options.minWidth;
    var modalHeight = opts.height || this.options.minHeight;
    // screen width and height calculation, WC = width
    var screenWidthCalc = screenWidth >= modalWidth + widthOffset;
    var screenHeightCalc = screenHeight >= modalHeight + heightOffset;

    var width = screenWidthCalc && !opts.width ? screenWidth - widthOffset : modalWidth;
    var height = screenHeightCalc && !opts.height ? screenHeight - heightOffset : modalHeight;

    let currentLeft = window.getComputedStyle(this.ui.modal).left;
    let currentTop = window.getComputedStyle(this.ui.modal).top;
    var newLeft;
    var newTop;

    // jquery made me do it
    if (currentLeft === '50%') {
      currentLeft = screenWidth / 2;
    }
    if (currentTop === '50%') {
      currentTop = screenHeight / 2;
    }

    currentTop = parseInt(currentTop, 10);
    currentLeft = parseInt(currentLeft, 10);

    // if new width/height go out of the screen - reset position to center of screen
    if (
      width / 2 + currentLeft > screenWidth ||
      height / 2 + currentTop > screenHeight ||
      currentLeft - width / 2 < 0 ||
      currentTop - height / 2 < 0
    ) {
      newLeft = screenWidth / 2;
      newTop = screenHeight / 2;
    }

    // in case, the modal is larger than the window, we trigger fullscreen mode
    if (width >= screenWidth || height >= screenHeight) {
      this.triggerMaximized = true;
    }

    return {
      width: width,
      height: height,
      top: newTop,
      left: newLeft
    };
  }

  /**
   * Animation helper for opening the sideframe.
   *
   * @method _show
   * @private
   * @param {Object} opts
   * @param {Number} opts.width width of the modal
   * @param {Number} opts.height height of the modal
   * @param {Number} opts.left left in px of the center of the modal
   * @param {Number} opts.top top in px of the center of the modal
   * @param {Number} opts.duration speed of opening, ms (not really used yet)
   */
  _show(opts) {
    // we need to position the modal in the center
    const that = this;
    var width = opts.width;
    var height = opts.height;
    var speed = opts.duration;
    var top = opts.top;
    var left = opts.left;

    if (this.ui.modal.classList.contains('cms-modal-open')) {
      this.ui.modal.classList.add('cms-modal-morphing');
    }

    this.ui.modal.style.display = 'block';
    this.ui.modal.style.width = width + "px";
    this.ui.modal.style.height = height + "px";
    this.ui.modal.style.top = top + "px";
    this.ui.modal.style.left = left + "px";
    this.ui.modal.style.marginLeft = -(width / 2) + "px";
    this.ui.modal.style.marginTop = -(height / 2) + "px";

    // setImmediate is required to go into the next frame
    setTimeout(function () {
      that.ui.modal.classList.add("cms-modal-open");
    }, 0);

    /*
    this.ui.modal
      .one('cmsTransitionEnd', function () {
        that.ui.modal.removeClass('cms-modal-morphing');
        that.ui.modal.css({
          'margin-left': -(width / 2),
          'margin-top': -(height / 2)
        });

        // check if we should maximize
        if (that.triggerMaximized) {
          that.maximize();
        }

        // changed locked status to allow other modals again
        CMS.API.locked = false;
        Helpers.dispatchEvent('modal-shown', {instance: that});
      })
      .emulateTransitionEnd(speed);

    // add esc close event
    this.ui.body.off('keydown.cms.close').on('keydown.cms.close', function (e) {
      if (e.keyCode === KEYS.ESC && that.options.closeOnEsc) {
        e.stopPropagation();
        if (that._confirmDirtyEscCancel()) {
          that._cancelHandler();
        }
      }
    });

    */

    // set focus to modal
    this.ui.modal.focus();
  }

  /**
   * Closes the current instance.
   *
   * @method close
   * @returns {Boolean|void}
   */
  close() {
    console.log("Modal: Closing")
    /*
    var event = Helpers.dispatchEvent('modal-close', {instance: this});

    if (event.isDefaultPrevented()) {
      return false;
    }

    Helpers._getWindow().removeEventListener('beforeunload', this._beforeUnloadHandler);

    // handle refresh option
    if (this.options.onClose) {
      Helpers.reloadBrowser(this.options.onClose, false);
    }
    */
    this._hide({
      duration: this.options.modalDuration / 2
    });
    /*
    this.ui.modal.untrap();
    keyboard.setContext(previousKeyboardContext);
    try {
      previouslyFocusedElement.focus();
    } catch (e) {
    }

     */
  }


  /**
   * Animation helper for closing the iframe.
   *
   * @method _hide
   * @private
   * @param {Object} opts
   * @param {Number} [opts.duration=this.options.modalDuration] animation duration
   */
  _hide(opts) {
    var that = this;
    var duration = this.options.modalDuration;

    if (opts && opts.duration) {
      duration = opts.duration;
    }

    this.ui.frame.querySelectorAll('*').forEach(n => n.remove());
    this.ui.modalBody.classList.remove('cms-loader');
    this.ui.modal.classList.remove("cms-modal-open");

    /*
    this.ui.modal
      .one('cmsTransitionEnd', function () {
        that.ui.modal.css('display', 'none');
      })
      .emulateTransitionEnd(duration);

    // reset maximize or minimize states for #3111
    setTimeout(function () {
      if (that.minimized) {
        that.minimize();
      }
      if (that.maximized) {
        that.maximize();
      }
      hideLoader();
      Helpers.dispatchEvent('modal-closed', {instance: that});
    }, this.options.duration);

    this.ui.body.off('keydown.cms.close');

     */
  }

  maximize() {
    console.log("Modal: Maximizing")
    // cancel action when minimized
    if (this.minimized) {
      return false;
    }

    if (this.maximized === false) {
      // save initial state
      // this.ui.modal.data(
      //   'css',
      //   this.ui.modal.css(['left', 'top', 'margin-left', 'margin-top', 'width', 'height'])
      // );
      this.ui.modal.classList.add("cms-modal-maximized");

      this.maximized = true;
      //Helpers.dispatchEvent('modal-maximized', {instance: this});
    } else {
      // minimize
      this.ui.modal.classList.remove("cms-modal-maximized");

      //this.ui.modal.css(this.ui.modal.data('css'));

      this.maximized = false;
      //Helpers.dispatchEvent('modal-restored', {instance: this});
    }
  }
  minimize() {
    console.log("Modal: Minimizing")
    /*
            var MINIMIZED_OFFSET = 50;

        // cancel action if maximized
        if (this.maximized) {
            return false;
        }

        if (this.minimized === false) {
            // save initial state
            this.ui.modal.data('css', this.ui.modal.css(['left', 'top', 'margin-left', 'margin-top']));

            // minimize
            this.ui.body.addClass('cms-modal-minimized');
            this.ui.modal.css({
                left: this.ui.toolbarLeftPart.outerWidth(true) + MINIMIZED_OFFSET
            });

            this.minimized = true;
        } else {
            // maximize
            this.ui.body.removeClass('cms-modal-minimized');
            this.ui.modal.css(this.ui.modal.data('css'));

            this.minimized = false;
        }
     */
  }

  /**
   * Sets the buttons inside the modal.
   *
   * @method _setButtons
   * @private
   * @param {jQuery} iframe loaded iframe element
   */
  _setButtons(iframe) {
    console.log("_setButtons");

    const contents = iframe.contentWindow.document
    let djangoSuit = contents.querySelectorAll('.suit-columns').length > 0;
    let that = this;
    let row;
    var tmp;

    let render = document.createElement("div")
    render.classList.add("cms-modal-buttons-inner");

    if (djangoSuit) {
      row = contents.querySelector('.save-box');
    } else {
      row = contents.querySelector('.submit-row');
    }
    var form = contents.querySelector('form');

    // avoids conflict between the browser's form validation and Django's validation
    form.addEventListener('submit', function () {
      // default submit button was clicked
      // meaning, if you have save - it should close the iframe,
      // if you hit save and continue editing it should be default form behaviour
      if (that.hideFrame) {
        that.ui.modal.querySelector('.cms-modal-frame iframe').hide();
        // page has been saved, run checkup
        that.saved = true;
      }
    });
    var buttons = row.querySelectorAll('input, a, button');

    /*

    // these are the buttons _inside_ the iframe
    // we need to listen to this click event to support submitting
    // a form by pressing enter inside of a field
    // click is actually triggered by submit
    buttons.on('click', function () {
      if ($(this).hasClass('default')) {
        that.hideFrame = true;
      }
    });
    */
    // hide all submit-rows
    contents.querySelector('.submit-row').style.display = "none";
    /*
    // if there are no given buttons within the submit-row area
    // scan deeper within the form itself
    // istanbul ignore next
    if (!buttons.length) {
      row = iframe.contents().find('body:not(.change-list) #content form:eq(0)');
      buttons = row.find('input[type="submit"], button[type="submit"]');
      buttons.addClass('deletelink').hide();
    }
    */

    // loop over input buttons
    buttons.forEach(function (item, index) {
      let buttonWrapper = document.createElement("div")
      buttonWrapper.classList.add("cms-modal-item-buttons");

      item.setAttribute('data-rel', '_' + index);

      // cancel if item is a hidden input
      if (item.getAttribute('type') === 'hidden') {
        return false;
      }

      let title = item.getAttribute('value') || item.innerText;

      if (item.tagName === 'button') {
        title = item.innerText;
      }

      let cls = 'cms-btn';
      // set additional special css classes
      if (item.classList.contains('default')) {
        cls = 'cms-btn cms-btn-action';
      }
      if (item.classList.contains('deletelink')) {
        cls = 'cms-btn cms-btn-caution';
      }

      // FIXME: Was el
      let el = document.createElement("a");
      let elClassList = cls + ' ' + item.getAttribute('class');
      el.href = "#";
      el.classList.add(...elClassList.split(" "));
      el.textContent = title
      buttonWrapper.append(el);

      // FIXME: Was el.on(that.click + ' ' + that.touchEnd, function (e) {
      el.addEventListener("click", function (e) {
        e.preventDefault();

        /*
        if (item.is('a')) {
          that._loadIframe({
            url: Helpers.updateUrlWithPath(item.prop('href')),
            name: title
          });
        }

        // trigger only when blue action buttons are triggered
        if (item.hasClass('default') || item.hasClass('deletelink')) {
          // hide iframe when using buttons other than submit
          if (item.hasClass('default')) {
            // submit button uses the form's submit event
            that.hideFrame = true;
          } else {
            that.ui.modal.find('.cms-modal-frame iframe').hide();
            // page has been saved or deleted, run checkup
            that.saved = true;
            if (item.hasClass('deletelink')) {
              that.justDeleted = true;

              var action = item.closest('form').prop('action');

              // in case action is an input (see https://github.com/jquery/jquery/issues/3691)
              // it's definitely not a plugin/placeholder deletion
              if (typeof action === 'string' && action.match(/delete-plugin/)) {
                that.justDeletedPlugin = /delete-plugin\/(\d+)\//gi.exec(action)[1];
              }
              if (typeof action === 'string' && action.match(/clear-placeholder/)) {
                that.justDeletedPlaceholder = /clear-placeholder\/(\d+)\//gi.exec(action)[1];
              }
            }
          }
        }
        */
        if (item.tagName === 'input' || 'button') {
          //that.ui.modalBody.classList.add('cms-loader');

          var frm = item.closest('form');

          // In Firefox with 1Password extension installed (FF 45 1password 4.5.6 at least)
          // the item[0].click() doesn't work, which notably breaks
          // deletion of the plugin. Workaround is that if the clicked button
          // is the only button in the form - submit a form, otherwise
          // click on the button
          if (frm.querySelectorAll('button, input[type="button"], input[type="submit"]').length > 1) {
            // we need to use native `.click()` event specifically
            // as we are inside an iframe and magic is happening
            item.click();
          } else {
            // have to dispatch native submit event so all the submit handlers
            // can be fired, see #5590
            var evt = document.createEvent('HTMLEvents');

            evt.initEvent('submit', false, true);
            if (frm[0].dispatchEvent(evt)) {
              // triggering submit event in webkit based browsers won't
              // actually submit the form, while in Gecko-based ones it
              // will and calling frm.submit() would throw NS_ERROR_UNEXPECTED
              try {
                frm[0].submit();
              } catch (err) {
              }
            }
          }
        }

      });

      // append element
      render.append(buttonWrapper);
    });

    let cancelButtonWrapper = document.createElement("div")
    cancelButtonWrapper.classList.add("cms-modal-item-buttons");

    // FIXME: The cancel button used CMS.config.lang.cancel for the button text
    let cancel = document.createElement("a")
    cancel.href = "#";
    cancel.classList.add("cms-btn");
    cancel.textContent = "Cancel"
    cancelButtonWrapper.append(cancel);

    // manually add cancel button at the end
    // FIXME: Was: cancel.on(that.click, function(e) {
    cancel.addEventListener("click", function (e) {
      e.preventDefault();
      that._cancelHandler();
    });

    render.append(cancelButtonWrapper);

    /*
    // prepare groups
    render.find('.cms-btn-group').unwrap();
    tmp = render.find('.cms-btn-group').clone(true, true);
    render.find('.cms-btn-group').remove();
    render.append(tmp.wrapAll(group.clone().addClass('cms-modal-item-buttons-left')).parent());
     */
    // render buttons
    this.ui.modalButtons.append(render);
  }

  _loadIframe(opts) {
    const that = this;
    const SHOW_LOADER_TIMEOUT = 500;

    //opts.url = Helpers.makeURL(opts.url);
    opts.title = opts.title || '';
    opts.breadcrumbs = opts.breadcrumbs || '';

    //showLoader();

    // set classes
    this.ui.modal.classList.remove('cms-modal-markup');
    this.ui.modal.classList.add('cms-modal-iframe');

    // we need to render the breadcrumb
    //this._setBreadcrumb(opts.breadcrumbs);

    // now refresh the content
    let iframe = document.createElement("iframe")
    iframe.setAttribute('tabindex', "0");
    iframe.setAttribute('src', opts.url);
    iframe.setAttribute('frameborder', "0");

    this.ui.frame.appendChild(iframe)

    // set correct title
    const titlePrefix = this.ui.titlePrefix;
    const titleSuffix = this.ui.titleSuffix;

    //iframe.style.visibility = 'hidden';
    titlePrefix.textContent = opts.title || '';
    titleSuffix.textContent = '';

    // ensure previous iframe is hidden
    this.ui.frame.style.visibility = 'hidden';
    //const loaderTimeout = setTimeout(() => that.ui.modalBody.addClass('cms-loader'), SHOW_LOADER_TIMEOUT);

    // attach load event for iframe to prevent flicker effects
    // eslint-disable-next-line complexity
    iframe.addEventListener('load', function () {
      //clearTimeout(loaderTimeout);

      let messages;
      let messageList;
      let contents;
      let body;
      let innerTitle;
      let bc;

      // check if iframe can be accessed
      try {
        contents = iframe.contentWindow.document;
        body = contents.body
      } catch (error) {
        console.log("Error loading the form", error);
        /*
        CMS.API.Messages.open({
          message: '<strong>' + CMS.config.lang.errorLoadingEditForm + '</strong>',
          error: true,
          delay: 0
        });
        */
        that.close();
        return;
      }

      // tabindex is required for keyboard navigation
      body.setAttribute('tabindex', "0");
      iframe.addEventListener('focus', function () {
        if (this.contentWindow) {
          this.contentWindow.focus();
        }
      });
      /*

      Modal._setupCtrlEnterSave(document);

      if (iframe[0].contentWindow && iframe[0].contentWindow.document) {
        Modal._setupCtrlEnterSave(iframe[0].contentWindow.document);
      }
      // for ckeditor we need to go deeper
      // istanbul ignore next
      if (iframe[0].contentWindow && iframe[0].contentWindow.CMS && iframe[0].contentWindow.CMS.CKEditor) {
        $(iframe[0].contentWindow.document).ready(function () {
          // setTimeout is required to battle CKEditor initialisation
          setTimeout(function () {
            var editor = iframe[0].contentWindow.CMS.CKEditor.editor;

            if (editor) {
              editor.on('instanceReady', function (e) {
                Modal._setupCtrlEnterSave(
                  $(e.editor.container.$).find('iframe')[0].contentWindow.document
                );
              });
            }
          }, 100); // eslint-disable-line
        });
      }
      */

      var saveSuccess = Boolean(contents.querySelectorAll('.messagelist :not(.error)').length);

      // in case message didn't appear, assume that admin page is actually a success
      if (!saveSuccess) {
        saveSuccess =
          Boolean(contents.querySelectorAll('.dashboard #content-main').length) &&
          !contents.querySelectorAll('.messagelist .error').length;
      }
      /*
      // show messages in toolbar if provided
      messageList = contents.find('.messagelist');
      messages = messageList.find('li');
      if (messages.length) {
        CMS.API.Messages.open({
          message: messages.eq(0).html()
        });
      }
      messageList.remove();
       */

      // inject css class
      body.classList.add('cms-admin');
      body.classList.add('cms-admin-modal');

      /*
      // hide loaders
      that.ui.modalBody.removeClass('cms-loader');
      hideLoader();

      // determine if we should close the modal or reload
      if (messages.length && that.enforceReload) {
        that.ui.modalBody.addClass('cms-loader');
        showLoader();
        Helpers.reloadBrowser();
      }
      if (messages.length && that.enforceClose) {
        that.close();
        return false;
      }
      */

      // adding django hacks
      contents.querySelectorAll('.viewsitelink').forEach(function (link) {
        link.setAttribute('target', '_top');
      });

      // set modal buttons
      that._setButtons(iframe);

      // when an error occurs, reset the saved status so the form can be checked and validated again
      if (
        contents.querySelectorAll('.errornote').length ||
        contents.querySelectorAll('.errorlist').length ||
        (that.saved && !saveSuccess)
      ) {
        that.saved = false;
      }

      // when the window has been changed pressing the blue or red button, we need to run a reload check
      // also check that no delete-confirmation is required
      if (that.saved && saveSuccess && !contents.querySelectorAll('.delete-confirmation').length) {

        /*
        that.ui.modalBody.addClass('cms-loader');
        if (that.options.onClose) {
          showLoader();
          Helpers.reloadBrowser(
            that.options.onClose ? that.options.onClose : window.location.href,
            false,
            true
          );
        } else {
          setTimeout(function () {
            if (that.justDeleted && (that.justDeletedPlugin || that.justDeletedPlaceholder)) {
              CMS.API.StructureBoard.invalidateState(
                that.justDeletedPlaceholder ? 'CLEAR_PLACEHOLDER' : 'DELETE',
                {
                  plugin_id: that.justDeletedPlugin,
                  placeholder_id: that.justDeletedPlaceholder,
                  deleted: true
                }
              );
            }
            // hello ckeditor
            Helpers.removeEventListener('modal-close.text-plugin');
            that.close();
            // must be more than 100ms
          }, 150); // eslint-disable-line
        }
        */
      } else {
        /*
        iframe.show();
        */
        // set title of not provided
        innerTitle = contents.querySelectorAll('#content h1')[0];
        /*
        // case when there is no prefix
        // istanbul ignore next: never happens
        if (opts.title === undefined && that.ui.titlePrefix.text() === '') {
          bc = contents.find('.breadcrumbs').contents();
          that.ui.titlePrefix.text(bc.eq(bc.length - 1).text().replace('›', '').trim());
        }
        */
        if (titlePrefix.textContent.trim() === '') {
          titlePrefix.textContent = innerTitle.textContent;
        } else {
          titleSuffix.textContent = innerTitle.textContent;
        }
        innerTitle.remove();

        // than show
        that.ui.frame.style.visibility = 'visible';

        /*
        // append ready state
        iframe.data('ready', true);

        // attach close event
        body.on('keydown.cms', function (e) {
          if (e.keyCode === KEYS.ESC && that.options.closeOnEsc) {
            e.stopPropagation();
            if (that._confirmDirtyEscCancel()) {
              that._cancelHandler();
            }
          }
        });

        // figure out if .object-tools is available
        if (contents.find('.object-tools').length) {
          contents.find('#content').css('padding-top', 38); // eslint-disable-line
        }
        */
      }
      /*
      that._attachContentPreservingHandlers(iframe);
      */
    });

    /*
    // inject
    this.ui.frame.html(iframe);
    */

  }

  /**
   * Called whenever default modal action is canceled.
   *
   * @method _cancelHandler
   * @private
   */
  _cancelHandler() {
    this.options.onClose = null;
    this.close();
  }

  attributeChangedCallback(name, oldValue, newValue) {

  }

  connectedCallback () {
    this.attachShadow({mode: 'open'});
    this.render()

    this._initUI()
    this._initEventListeners()
  }
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .modal {
          display: block;
          position: fixed;
          z-index: 3000;
          padding-top: 100px;
          left: 50%;
          top: 50%;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgb(0,0,0);
          background-color: rgba(0,0,0,0.4);
          font-family: Verdana,sans-serif;
          font-size: 15px;
          line-height: 1.5;
        }
        .modal-content {
          background-color: #fefefe;
          margin: auto;
          width: 95%;
          max-width:768px;
        }
        #mydivheader {
          padding: 10px;
          z-index: 10;
          background-color: #2196F3;
          color: #fff;
        }
        #container{
          padding: 20px;
        }
        .btn, .button {
          border: none;
          display: inline-block;
          padding: 8px 16px;
          vertical-align: middle;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          background-color: inherit;
          text-align: center;
          cursor: pointer;
          white-space: nowrap;
        }
        .btn, .button {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        .display-topright {
          position: relative;
          right: -9px;
          top: -33px;
          float: right;
        }
        @media (max-width:768px){
          .modal{
            padding-top:50px;
          }
        }
        .animate-top{
          position:relative;
          animation:animatetop 0.4s;
        }
        @keyframes animatetop{
          from{top:-300px;opacity:0}
          to{top:0;opacity:1}
        }
        
        
        
.cms-modal-item-buttons .cms-btn {
  text-align: center
}


.cms-modal-item-buttons, .cms-toolbar-item-buttons {
    margin: 8px 0 8px
}

.cms-modal-item-buttons a, .cms-toolbar-item-buttons a {
    float: left;
    line-height: 30px;
    height: 30px;
    font-size: 12px;
    padding: 0 12px
}

.cms-modal-item-buttons a:first-child, .cms-toolbar-item-buttons a:first-child {
    border-radius: 3px 0 0 3px
}

.cms-modal-item-buttons a:last-child, .cms-toolbar-item-buttons a:last-child {
    margin-left: -1px;
    border-radius: 0 3px 3px 0
}

.cms-modal-item-buttons a:only-child, .cms-toolbar-item-buttons a:only-child {
    border-radius: 3px
}


.cms-modal {
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    overflow: hidden;
    z-index: 9999999;
    border-radius: 5px;
    background: #fff;
    box-shadow: 0 0 20px rgba(0, 0, 0, .5);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    opacity: 0;
    -webkit-transform: translate3d(0, -10%, 0);
    transform: translate3d(0, -10%, 0);
    transition: opacity 150ms, -webkit-transform 150ms;
    transition: transform 150ms, opacity 150ms;
    transition: transform 150ms, opacity 150ms, -webkit-transform 150ms
}

.cms-structure-mode-structure .cms-modal {
    -webkit-transform: translate3d(10%, 0, 0);
    transform: translate3d(10%, 0, 0)
}

.cms-modal-maximized .cms-modal {
    right: 0;
    bottom: 0;
    top: 0 !important;
    left: 0 !important;
    border-radius: 0;
    margin: 0 !important;
    width: auto !important;
    height: auto !important
}

.cms-modal-maximized .cms-modal .cms-modal-title {
    cursor: default
}

.cms-modal-minimized .cms-modal {
    width: auto !important;
    height: auto !important;
    top: 1px !important;
    margin: 0 !important
}

.cms-modal-minimized .cms-modal .cms-modal-body, .cms-modal-minimized .cms-modal .cms-modal-breadcrumb, .cms-modal-minimized .cms-modal .cms-modal-foot {
    display: none !important
}

.cms-modal-minimized .cms-modal .cms-modal-title {
    cursor: default;
    padding-right: 90px
}

.cms-modal-minimized .cms-modal .cms-modal-title-suffix {
    display: none
}

.cms-modal-minimized .cms-modal .cms-modal-minimize {
    right: 33px
}

.cms-modal-morphing {
    transition: all .2s
}

.cms-modal-open {
    opacity: 1
}

.cms-structure-mode-structure .cms-modal-open, .cms-modal-open {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0)
}

.cms-modal-body {
    position: absolute;
    z-index: 10;
    left: 0;
    top: 46px;
    right: 0;
    bottom: 46px;
    border-top: 1px solid #ddd;
    background: #fff;
    border-bottom: 1px solid #ddd
}

.cms-modal-foot {
    position: absolute;
    overflow: hidden;
    clear: both;
    height: 46px;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 11
}

.cms-modal-shim {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 20;
    width: 100%;
    height: 100%
}

.cms-modal-frame {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    -webkit-overflow-scrolling: touch;
    overflow-y: auto
}

.cms-modal-frame iframe {
    display: block;
    width: 100%;
    height: 100%
}

.cms-modal-head {
    position: relative
}

.cms-modal-title {
    display: block;
    color: #454545;
    font-size: 16px;
    font-weight: 700;
    line-height: 46px;
    min-height: 46px;
    padding: 0 20px;
    cursor: move;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 100px
}

.cms-modal-title .cms-modal-title-suffix {
    font-weight: 400;
    padding-left: 10px
}

.cms-modal-close, .cms-modal-maximize, .cms-modal-minimize {
    display: block;
    position: absolute;
    top: 50%;
    margin-top: -15px;
    right: 10px;
    color: #999;
    text-align: center;
    width: 30px;
    height: 30px;
    cursor: pointer
}

.cms-modal-close:before, .cms-modal-maximize:before, .cms-modal-minimize:before {
    position: relative;
    top: 7px
}

.cms-modal-close:hover, .cms-modal-maximize:hover, .cms-modal-minimize:hover {
    color: #0bf
}

.cms-modal-minimize {
    right: 70px
}

.cms-modal-minimized .cms-modal-minimize {
    color: #0bf
}

.cms-modal-minimized .cms-modal-minimize:before {
    content: "\\E01F"
}

.cms-modal-maximized .cms-modal-minimize {
    display: none !important
}

.cms-modal-maximize {
    right: 40px
}

.cms-modal-minimized .cms-modal-maximize {
    display: none !important
}

.cms-modal-maximized .cms-modal-maximize {
    color: #0bf
}

.cms-modal-maximized .cms-modal-maximize:before {
    content: "\\E016"
}

.cms-modal-resize {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 102;
    font-size: 10px;
    color: #999;
    width: 25px;
    height: 25px;
    cursor: nw-resize
}

.cms-modal-resize span {
    position: absolute;
    bottom: 5px;
    right: 5px;
    font-size: 12px
}

.cms-modal-breadcrumb {
    display: none !important;
    font-size: 14px;
    line-height: 40px;
    padding: 0 20px;
    border-top: 1px solid #ddd;
    overflow-y: hidden;
    overflow-x: scroll;
    height: 80px;
    width: 100%;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch
}

.cms-modal-breadcrumb a {
    color: #0bf
}

.cms-modal-breadcrumb a:hover {
    color: #007099
}

.cms-modal-breadcrumb a:after {
    content: "/";
    color: #ddd;
    text-decoration: none;
    padding: 0 10px
}

.cms-modal-breadcrumb a.active {
    color: #999
}

.cms-modal-breadcrumb a:last-child:after {
    content: ""
}

.cms-modal-buttons {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 101;
    padding: 0 25px 0 10px
}

.cms-modal-item-buttons {
    float: right;
    margin-left: 8px
}

.cms-modal-item-buttons-left {
    float: left
}

.cms-modal-markup .cms-modal-foot {
    height: 23px
}

.cms-modal-markup .cms-modal-body {
    bottom: 23px
}

.cms-modal-has-breadcrumb .cms-modal-body {
    top: 86px !important
}

.cms-modal-has-breadcrumb .cms-modal-breadcrumb {
    display: block !important
}

.cms-modal-maximized {
    overflow: hidden !important
}

.cms-modal-maximized .cms.cms-toolbar-debug .cms-modal {
    top: 3px !important
}

.cms-modal-minimized .cms.cms-toolbar-debug .cms-modal {
    top: 4px !important
}

.cms-modal-markup .cms-clipboard-containers {
    display: block !important
}

.cms-modal-markup .cms-clipboard-containers .cms-is-dragging {
    display: block !important;
    opacity: .3
}

.cms-modal-markup .cms-plugin-picker {
    display: block
}

.cms-modal-markup .cms-quicksearch {
    display: block
}


:not(.cms-modal):focus {
    outline: 2px dotted #454545;
    outline-offset: -3px
}

:not(.cms-modal):focus::-moz-focus-inner {
    border: 0 !important
}

@media screen and (-webkit-min-device-pixel-ratio: 0) {
    :not(.cms-modal):focus {
        outline: 5px auto -webkit-focus-ring-color;
        outline-offset: -3px
    }
}

:not(.cms-modal):focus .cms-hover-tooltip {
    display: none
}



span.cms-icon img {
    width: 20px;
    height: 20px;
    float: left;
    display: inline-block;
}
span.cms-icon {
    width: 20px;
    height: 20px;
    margin-top: 6px;
    float: left;
    display: inline-block;

    text-rendering: auto; 
    display: inline-block; 
    line-height: 1rem; 
    vertical-align: 20%; 
    margin-top: -2px !important; 
}



.cms-btn {
    background-image: none;
    margin-bottom: 0;
    border-radius: 3px;
    color: #555;
    background-color: #fff;
    border: 1px solid #ddd;
    background-clip: padding-box;
    -webkit-appearance: none
}

.cms-btn.focus, .cms-btn:focus {
    color: #555;
    background-color: #f2f2f2;
    border-color: #d0d0d0;
    text-decoration: none
}

.cms-btn:hover {
    color: #555;
    background-color: #f2f2f2;
    border-color: #d0d0d0;
    text-decoration: none
}

.cms-btn.cms-btn-active, .cms-btn:active, .cms-dropdown-open .cms-btn.cms-dropdown-toggle {
    color: #555;
    background-color: #e6e6e6;
    border-color: #c3c3c3;
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125)
}

.cms-btn.cms-btn-active.focus, .cms-btn.cms-btn-active:focus, .cms-btn.cms-btn-active:hover, .cms-btn:active.focus, .cms-btn:active:focus, .cms-btn:active:hover, .cms-dropdown-open .cms-btn.cms-dropdown-toggle:focus, .cms-dropdown-open .cms-btn.cms-dropdown-toggle:hover, .cms-dropdown-open .cms-btn.focus.cms-dropdown-toggle {
    color: #555;
    background-color: #d4d4d4;
    border-color: #9d9d9d
}

.cms-btn.cms-btn-active, .cms-btn:active, .cms-dropdown-open .cms-btn.cms-dropdown-toggle {
    background-image: none
}

.cms-btn.cms-btn-disabled, .cms-btn.cms-btn-disabled.cms-btn-active, .cms-btn.cms-btn-disabled.focus, .cms-btn.cms-btn-disabled:active, .cms-btn.cms-btn-disabled:focus, .cms-btn.cms-btn-disabled:hover, .cms-btn[disabled], .cms-btn[disabled].cms-btn-active, .cms-btn[disabled].focus, .cms-btn[disabled]:active, .cms-btn[disabled]:focus, .cms-btn[disabled]:hover, .cms-dropdown-open .cms-btn.cms-btn-disabled.cms-dropdown-toggle, .cms-dropdown-open .cms-btn[disabled].cms-dropdown-toggle {
    background-color: rgba(255, 255, 255, .4);
    border-color: rgba(221, 221, 221, .4);
    color: #d5d5d5;
    cursor: not-allowed;
    box-shadow: none
}

.cms-btn.cms-btn-disabled.cms-btn-active:before, .cms-btn.cms-btn-disabled.focus:before, .cms-btn.cms-btn-disabled:active:before, .cms-btn.cms-btn-disabled:before, .cms-btn.cms-btn-disabled:focus:before, .cms-btn.cms-btn-disabled:hover:before, .cms-btn[disabled].cms-btn-active:before, .cms-btn[disabled].focus:before, .cms-btn[disabled]:active:before, .cms-btn[disabled]:before, .cms-btn[disabled]:focus:before, .cms-btn[disabled]:hover:before, .cms-dropdown-open .cms-btn.cms-btn-disabled.cms-dropdown-toggle:before, .cms-dropdown-open .cms-btn[disabled].cms-dropdown-toggle:before {
    color: rgba(85, 85, 85, .4)
}

.cms-btn-action {
    background-image: none;
    margin-bottom: 0;
    border-radius: 3px;
    color: #fff;
    background-color: #0bf;
    border: 1px solid #0bf;
    background-clip: padding-box;
    -webkit-appearance: none
}

.cms-btn-action.focus, .cms-btn-action:focus {
    color: #fff;
    background-color: #00a8e6;
    border-color: #00a8e6;
    text-decoration: none
}

.cms-btn-action:hover {
    color: #fff;
    background-color: #00a8e6;
    border-color: #00a8e6;
    text-decoration: none
}

.cms-btn-action.cms-btn-active, .cms-btn-action:active, .cms-dropdown-open .cms-btn-action.cms-dropdown-toggle {
    color: #fff;
    background-color: #0096cc;
    border-color: #0096cc;
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125)
}

.cms-btn-action.cms-btn-active.focus, .cms-btn-action.cms-btn-active:focus, .cms-btn-action.cms-btn-active:hover, .cms-btn-action:active.focus, .cms-btn-action:active:focus, .cms-btn-action:active:hover, .cms-dropdown-open .cms-btn-action.cms-dropdown-toggle:focus, .cms-dropdown-open .cms-btn-action.cms-dropdown-toggle:hover, .cms-dropdown-open .cms-btn-action.focus.cms-dropdown-toggle {
    color: #fff;
    background-color: #007ba8;
    border-color: #005e80
}

.cms-btn-action.cms-btn-active, .cms-btn-action:active, .cms-dropdown-open .cms-btn-action.cms-dropdown-toggle {
    background-image: none
}

.cms-btn-action.cms-btn-disabled, .cms-btn-action.cms-btn-disabled.cms-btn-active, .cms-btn-action.cms-btn-disabled.focus, .cms-btn-action.cms-btn-disabled:active, .cms-btn-action.cms-btn-disabled:focus, .cms-btn-action.cms-btn-disabled:hover, .cms-btn-action[disabled], .cms-btn-action[disabled].cms-btn-active, .cms-btn-action[disabled].focus, .cms-btn-action[disabled]:active, .cms-btn-action[disabled]:focus, .cms-btn-action[disabled]:hover, .cms-dropdown-open .cms-btn-action.cms-btn-disabled.cms-dropdown-toggle, .cms-dropdown-open .cms-btn-action[disabled].cms-dropdown-toggle {
    background-color: rgba(0, 187, 255, .4);
    border-color: rgba(0, 187, 255, .4);
    color: #fff;
    cursor: not-allowed;
    box-shadow: none
}

.cms-btn-action.cms-btn-disabled.cms-btn-active:before, .cms-btn-action.cms-btn-disabled.focus:before, .cms-btn-action.cms-btn-disabled:active:before, .cms-btn-action.cms-btn-disabled:before, .cms-btn-action.cms-btn-disabled:focus:before, .cms-btn-action.cms-btn-disabled:hover:before, .cms-btn-action[disabled].cms-btn-active:before, .cms-btn-action[disabled].focus:before, .cms-btn-action[disabled]:active:before, .cms-btn-action[disabled]:before, .cms-btn-action[disabled]:focus:before, .cms-btn-action[disabled]:hover:before, .cms-dropdown-open .cms-btn-action.cms-btn-disabled.cms-dropdown-toggle:before, .cms-dropdown-open .cms-btn-action[disabled].cms-dropdown-toggle:before {
    color: rgba(255, 255, 255, .4)
}

.cms-btn-caution {
    background-image: none;
    margin-bottom: 0;
    border-radius: 3px;
    color: #fff;
    background-color: #ff4000;
    border: 1px solid #ff4000;
    background-clip: padding-box;
    -webkit-appearance: none
}

.cms-btn-caution.focus, .cms-btn-caution:focus {
    color: #fff;
    background-color: #e63900;
    border-color: #e63900;
    text-decoration: none
}

.cms-btn-caution:hover {
    color: #fff;
    background-color: #e63900;
    border-color: #e63900;
    text-decoration: none
}

.cms-btn-caution.cms-btn-active, .cms-btn-caution:active, .cms-dropdown-open .cms-btn-caution.cms-dropdown-toggle {
    color: #fff;
    background-color: #c30;
    border-color: #c30;
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125)
}

.cms-btn-caution.cms-btn-active.focus, .cms-btn-caution.cms-btn-active:focus, .cms-btn-caution.cms-btn-active:hover, .cms-btn-caution:active.focus, .cms-btn-caution:active:focus, .cms-btn-caution:active:hover, .cms-dropdown-open .cms-btn-caution.cms-dropdown-toggle:focus, .cms-dropdown-open .cms-btn-caution.cms-dropdown-toggle:hover, .cms-dropdown-open .cms-btn-caution.focus.cms-dropdown-toggle {
    color: #fff;
    background-color: #a82a00;
    border-color: #802000
}

.cms-btn-caution.cms-btn-active, .cms-btn-caution:active, .cms-dropdown-open .cms-btn-caution.cms-dropdown-toggle {
    background-image: none
}

.cms-btn-caution.cms-btn-disabled, .cms-btn-caution.cms-btn-disabled.cms-btn-active, .cms-btn-caution.cms-btn-disabled.focus, .cms-btn-caution.cms-btn-disabled:active, .cms-btn-caution.cms-btn-disabled:focus, .cms-btn-caution.cms-btn-disabled:hover, .cms-btn-caution[disabled], .cms-btn-caution[disabled].cms-btn-active, .cms-btn-caution[disabled].focus, .cms-btn-caution[disabled]:active, .cms-btn-caution[disabled]:focus, .cms-btn-caution[disabled]:hover, .cms-dropdown-open .cms-btn-caution.cms-btn-disabled.cms-dropdown-toggle, .cms-dropdown-open .cms-btn-caution[disabled].cms-dropdown-toggle {
    background-color: rgba(255, 64, 0, .4);
    border-color: rgba(255, 64, 0, .4);
    color: #fff;
    cursor: not-allowed;
    box-shadow: none
}

.cms-btn-caution.cms-btn-disabled.cms-btn-active:before, .cms-btn-caution.cms-btn-disabled.focus:before, .cms-btn-caution.cms-btn-disabled:active:before, .cms-btn-caution.cms-btn-disabled:before, .cms-btn-caution.cms-btn-disabled:focus:before, .cms-btn-caution.cms-btn-disabled:hover:before, .cms-btn-caution[disabled].cms-btn-active:before, .cms-btn-caution[disabled].focus:before, .cms-btn-caution[disabled]:active:before, .cms-btn-caution[disabled]:before, .cms-btn-caution[disabled]:focus:before, .cms-btn-caution[disabled]:hover:before, .cms-dropdown-open .cms-btn-caution.cms-btn-disabled.cms-dropdown-toggle:before, .cms-dropdown-open .cms-btn-caution[disabled].cms-dropdown-toggle:before {
    color: rgba(255, 255, 255, .4)
}

.cms-btn-disabled img {
    opacity: .2 !important
}
      </style>
      <div class="cms-modal" tabindex="-1" data-touch-action="none">
        <div class="cms-modal-head" data-touch-action="none">
            <span class="cms-modal-title" data-touch-action="none">
                <span class="cms-modal-title-prefix">Title Prefix</span>
                <span class="cms-modal-title-suffix">Title Suffix</span>
            </span>
            <span tabindex="0" class="cms-modal-minimize cms-icon cms-icon-minus" title="Minimize">
              <img src="img/minus.svg" />
            </span>
            <span tabindex="0" class="cms-modal-maximize cms-icon cms-icon-window" title="Maximize">
              <img src="img/window-maximize.svg" />
            </span>
            <span tabindex="0" class="cms-modal-close cms-icon cms-icon-close" title="Close">
              <img src="img/window-close.svg" />
            </span>
        </div>
        <div class="cms-modal-breadcrumb" data-touch-action="pan-x"></div>
        <div class="cms-modal-body">
            <div class="cms-modal-shim"></div>
            <div class="cms-modal-frame"></div>
        </div>
        <div class="cms-modal-foot">
            <div class="cms-modal-buttons"></div>
            <div class="cms-modal-resize"><span class="cms-icon cms-icon-handler"></span></div>
        </div>
      </div>
`;

  }
}

window.customElements.define('admin-modal', adminModal);
