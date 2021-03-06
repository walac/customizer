/* global View */

var mainViewTemplate =
`<style scoped>
  .fxos-customizer-main-view {
    font-size: 14px;

    /** Grey Colors
     ---------------------------------------------------------*/

    --color-alpha: #333333;
    --color-beta: #ffffff;
    --color-gamma: #4d4d4d;
    --color-delta: #5f5f5f;
    --color-epsilon: #858585;
    --color-zeta: #a6a6a6;
    --color-eta: #c7c7c7;
    --color-theta: #e7e7e7;
    --color-iota: #f4f4f4;

  /** Brand Colors
   ---------------------------------------------------------*/

    --color-darkblue: #00539f;
    --color-blue: #00caf2;
    --color-turquoise: #27c8c2;
    --color-darkorange: #e66000;
    --color-orange: #ff9500;
    --color-yellow: #ffcb00;
    --color-violet: #c40c84;

    --color-warning: #fbbd3c;
    --color-destructive: #e2443a;
    --color-preffered: #00ba91;

    /** Background
     ---------------------------------------------------------*/

    --background: var(--color-alpha);
    --background-plus: var(--color-gamma);
    --background-minus: #2B2B2B;
    --background-minus-minus: #1a1a1a;

    /** Borders
     ---------------------------------------------------------*/

    --border-color: var(--color-gamma);

    /** Highlight Color
     ---------------------------------------------------------*/

    --highlight-color: var(--color-blue);

    /** Text Color
     ---------------------------------------------------------*/

    --text-color: var(--color-beta);
    --text-color-minus: var(--color-eta);

    /** Button
     ---------------------------------------------------------*/

    --button-background: var(--background-plus);

    /** Links
     ---------------------------------------------------------*/

    --link-color: var(--highlight-color);

    /** Inputs
     ---------------------------------------------------------*/

    --input-background: var(--background-plus);
    --input-color: var(--color-alpha);
    --input-clear-background: #909ca7;

    /** Buttons
     ---------------------------------------------------------*/

     --button-box-shadow: none;
     --button-box-shadow-active: none;

    /** Header
     ---------------------------------------------------------*/

    --header-background: var(--background);
    --header-icon-color: var(--text-color);
    --header-button-color: var(--highlight-color);
    --header-disabled-button-color: rgba(255,255,255,0.3);

    /** Text Input
     ---------------------------------------------------------*/

    --text-input-background: var(--background-minus);

    /** Switch
     ---------------------------------------------------------*/

    --switch-head-border-color: var(--background-minus-minus);
    --switch-background: var(--background-minus-minus);

    /** Checkbox
     ---------------------------------------------------------*/

    --checkbox-border-color: var(--background-minus-minus);
  }

  div.fxos-customizer-container {
    background-color: var(--background);
    position: fixed;
    left: 0;
    right: 0;
    top: 100%; /* off-screen by default, animated translate to show and hide */
    height: 50vh;
    border-top: 1px solid #ccc;
    /*
     * this needs to go on top of the regular app, but below
     * gaia-modal and gaia-dialog which we override elsewhere.
     */
    z-index: 10000000;

    /* We show and hide this with an animated transform */
    transition: transform 150ms;
  }

  /*
   * Add this show class to animate the container onto the screen,
   * and remove it to animate the container off.
   */
  .fxos-customizer-container.show {
    transform: translateY(-100%);
  }
</style>
<style class="fxos-customizer-global-styles" disabled>
/*
 * These styles need to be applied globally to the app when the customizer
 * is displayed so that the user can scroll to see all of the app even
 * with the customizer taking up the bottom half of the screen.
 *
 * Note that this stylesheet is not scoped and is disabled by default.
 */
html, body {
  overflow: initial !important;
}

body {
  padding-bottom: 50vh !important;
}
</style>
<div class="fxos-customizer-container"><fxos-customizer></fxos-customizer></div>
<div class="fxos-customizer-child-views">
<fxos-customizer-highlighter></fxos-customizer-highlighter>
</div>`;

export default class MainView extends View {
  constructor(options) {
    super(options);

    // Give this view a unique ID.
    this.el.id = 'customizer-' + Date.now();
    this.el.className = 'fxos-customizer-main-view';

    this.render();
  }

  init(controller) {
    super(controller);

    this.container = this.$('div.fxos-customizer-container');
    this.childViews = this.$('div.fxos-customizer-child-views');
    this.customizer = this.$('fxos-customizer');
    this.highlighter = this.$('fxos-customizer-highlighter');
    this.globalStyleSheet = this.$('style.fxos-customizer-global-styles');

    // When the customizer is closed, we want its impact on the
    // running app to be minimal, so we remove all of the children of
    // this view except for the container and the stylesheet and only
    // add them back when we actually open the customizer.
    this.container.removeChild(this.customizer);
    this.el.removeChild(this.childViews);

    // We put all of the other view elements that the app needs into the
    // childViews container, so that we can add and remove them all at once.
    this.childViews.appendChild(this.actionMenuView.el);
    this.childViews.appendChild(this.editView.el);
    this.childViews.appendChild(this.settingsView.el);
    this.childViews.appendChild(this.viewSourceView.el);
    this.childViews.appendChild(this.appendChildView.el);
    this.childViews.appendChild(this.moveView.el);

    // Hide this view from the DOM tree.
    this.customizer.gaiaDomTree.filter = '#' + this.el.id;

    this.on('menu', 'fxos-customizer', (evt) => {
      this.customizer.unwatchChanges();
      this.controller.settingsController.open();

      setTimeout(this.customizer.watchChanges.bind(this.customizer), 1000);
    });

    this.on('action', 'fxos-customizer', (evt) => {
      this.customizer.unwatchChanges();
      this.controller.actionMenuController.open(evt.detail);

      setTimeout(this.customizer.watchChanges.bind(this.customizer), 1000);
    });

    this.on('selected', 'fxos-customizer', (evt) => {
      this.highlighter.highlight(evt.detail);
    });
  }

  template() {
    return mainViewTemplate;
  }

  _addChildViews() {
    // We need all of these things for the customizer to work
    // But we don't want them sitting in the document tree when the
    // customizer is closed, so we add them all only when we open.
    this.container.appendChild(this.customizer); // the <fxos-customizer>
    this.el.appendChild(this.childViews); // The highlighter and child views
  }

  _removeChildViews() {
    // When we close the customizer we can remove these elements from the
    // document, leaving only this.el, this.container and this.globalStyleSheet
    this.container.removeChild(this.customizer);
    this.el.removeChild(this.childViews);
  }

  open() {
    return new Promise((resolve, reject) => {
      // Start the opening animation for the customizer
      this.container.classList.add('show');

      // Wait for the animation to end, then:
      var listener = () => {
        this.container.removeEventListener('transitionend', listener);
        // Add the fxos-customizer element and the other elements we need
        this._addChildViews();
        // Enable the global stylesheet
        this.globalStyleSheet.disabled = false;
        // Resolve the promise
        resolve();
      };
      this.container.addEventListener('transitionend', listener);
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      // Start hiding the customizer with an animated transition
      this.container.classList.remove('show');

      // Erase any highlight right away
      this.highlighter.highlight(null);

      // Scroll the app to the top before beginning the transition
      // so we don't see the blank white padding as the panel slides down
      document.body.scrollIntoView();

      // Wait for the transition to end, then:
      var listener = () => {
        this.container.removeEventListener('transitionend', listener);
        // Disable the global stylesheet
        this.globalStyleSheet.disabled = true;
        // Remove all the unnecessary elements from the document
        this._removeChildViews();
        // And resolve the promise
        resolve();
      };
      this.container.addEventListener('transitionend', listener);
    });
  }
}
