'use strict';
/*globals Phaser, Cocoon*/

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Gus Suarez
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 *
 *
 */

/**
 * @author       Gus Suarez <gus@mythril.co>
 * @copyright    2014 Gus Suarez
 * @license      {@link http://opensource.org/licenses/MIT}
 */

/**
 * The Mobile plugin is for integrating the cocoon.js keyboard events directly
 * into Phaser. Currently one would otherwise have to use dialogs outside the
 * game to accept keyboard input.
 *
 * @class Phaser.Plugin.Mobile
 * @constructor
 * @param {Phaser.Game} game Current game isntance
 * @param {any} [parent] - The parent Group or DisplayObjectContainer that will hold this group, if any. If set to null the Group won't be added to the display list. If undefined it will be added to World by default.
 *
 */
Phaser.Plugin.Mobile = function (game, parent) {
    Phaser.Plugin.call(this, game, parent);

    /**
     * Creates a new Textbox object.
     *
     * @method Phaser.GameObjectFactory#textbox
     * @param {number} [x=0] - The x coordinate of the Textbox.
     * @param {number} [y=0] - The y coordinate of the Textbox.
     * @param {number} [width=500] - The width of the Textbox.
     * @param {number} [height=75] - The height of the Textbox.
     * @param {text} [text=''] - The default (startign) text string that will be displayed
     * @param {object} [style] - The The style object containing style attributes like font, font size , etc.
     * @param {Phaser.Group} [group] - Optional Group to add the object to. If not specified it will be added to the World group.
     * @return {Mobile.Textbox} The newly created textbox object
     */
    game.add.textbox = function (x, y, width, height, text, style, group) {

        if (group === undefined) { group = this.world; }

        return group.add(new Phaser.Plugin.Mobile.Textbox(this.game, x, y, width, height, '', style));

    };
};

// Extends the Phaser.Plugin template
Phaser.Plugin.Mobile.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.Mobile.prototype.constructor = Phaser.Plugin.Mobile;

/**
 * @class Mobile.Keyboard
 */
Phaser.Plugin.Mobile.Keyboard = {

    /**
     * @property {Phaser.Signal} onDeleteBackward - Event fired on delete
     */
    onDeleteBackward: new Phaser.Signal(),

    /**
     * @property {Phaser.Signal} onInsertText - Event fired when text is
     * inserted using the soft keyboard
     */
    onInsertText: new Phaser.Signal(),

    /**
     * @property {Phaser.Signal} onDismiss - Event fired when keyboard
     * is dismissed
     */
    onDismiss: new Phaser.Signal(),

    /**
     * @property {Phaser.Signal} onDone - Event fired when user taps 'done'
     * Usually where the enter key would normally be
     */
    onDone: new Phaser.Signal(),

    /**
     * @property {string} currentType - the current keyboard type, if any
     */
    currentType: '',

    /**
     * Opens the soft keyboard, forwarding the available events into Phaser Signals
     *
     * @method Mobile.Keyboard#show
     * @param {string} [type='text'] type - set the keyboard type.
     * Options are: 'text', 'num', 'phone', 'email', 'url'
     */
    show: function (type) {

        // set default
        type = type || 'text';

        this.currentType = type;

        // Forward all cocoon event into Phaser Signals
        Cocoon.Dialog.showKeyboard( {type: type} ,{
            insertText: function (inserted) {
                Phaser.Plugin.Mobile.Keyboard.onInsertText.dispatch(inserted);
            },
            deleteBackward: function () {
                Phaser.Plugin.Mobile.Keyboard.onDeleteBackward.dispatch();
            },
            done: function () {
                Phaser.Plugin.Mobile.Keyboard.onDone.dispatch();
            },
            cancel: function () {
                Phaser.Plugin.Mobile.Keyboard.onDismiss.dispatch();
            }
        });
    },

    /**
     * Close the soft keyboard
     *
     * @method Mobile.Keyboard#hide

     */
    hide: function () {

        this.currentType = '';

        Cocoon.Dialog.dismissKeyboard();

    }
};



/**
 * @class Phaser.Plugin.Mobile.Textbox
 * @constructor
 *
 * @extends Phaser.Text
 *
 * @param {Phaser.Game} game - Current game instance.
 * @param {number} [x=0] - The x coordinate of the Textbox.
 * @param {number} [y=0] - The y coordinate of the Textbox.
 * @param {number} [width=500] - The width of the Textbox.
 * @param {number} [height=75] - The height of the Textbox.
 * @param {text} [text=''] - The default (startign) text string that will be displayed
 * @param {object} [style] - The The style object containing style attributes like font, font size , etc.
 * @return {Mobile.Textbox} The newly created textbox object
 * @memberof Phaser.Plugin.Mobile
 */
Phaser.Plugin.Mobile.Textbox = function (game, x, y, width, height, text, style) {

    x = x || 0;
    y = y || 0;

    width = width || 500;
    height = height || 75;

    text = text || '';

    style = style || {
        font: '48px sans-serif',
        fill: '#000'
    };


    // Inherit Phaser.Text properties
    Phaser.Text.call(this, game, x, y, text, style);

    // Add our events
    this.events.onBlur = new Phaser.Signal();
    this.events.onFocus = new Phaser.Signal();
    this.events.onComplete = new Phaser.Signal();

    // Create Phaser Rectange and keep reference
    this.clickableRegion = new Phaser.Rectangle(x, y, width, height);


    // handle click
    this.game.input.onDown.add( function handlePointerDown (pointer) {

        if (this.clickableRegion.contains(pointer.x, pointer.y)) {

            this.events.onFocus.dispatch(this);

        } else {

            this.events.onBlur.dispatch(this);
        }

    }, this);

    // Put the box in Textbox
    this.backgroundBox = this.game.add.graphics(x, y);
    this.backgroundBox.lineStyle(2, 0x000000, 0.5);
    this.backgroundBox.beginFill(0xFFFFFF, 1);
    this.backgroundBox.bounds = new PIXI.Rectangle(0,0, width, height);
    this.backgroundBox.drawRect(0, 0, width, height);
    this.backgroundBox.boundsPadding = 0;
    this.backgroundBox.endFill();
};

// Extends Phaser.Text
Phaser.Plugin.Mobile.Textbox.prototype = Object.create(Phaser.Text.prototype);
Phaser.Plugin.Mobile.Textbox.prototype.constructor = Phaser.Plugin.Mobile.Textbox;


/**
 * Enable the Keyboard
 *
 * @method Phaser.Plugin.Mobile.prototype.enableKeyboard
 * @memberof Phaser.Plugin.Mobile.Textbox
 */
Phaser.Plugin.Mobile.Textbox.prototype.enableKeyboard = function (type) {

    this.events.onFocus.add(function gotFocus () {
        this.text = '';
        Phaser.Plugin.Mobile.Keyboard.show(type);

        Phaser.Plugin.Mobile.Keyboard.onInsertText.removeAll();
        Phaser.Plugin.Mobile.Keyboard.onDeleteBackward.removeAll();



        Phaser.Plugin.Mobile.Keyboard.onDone.add(function () {

            this.events.onComplete.dispatch(this);
            this.events.onBlur.dispatch(this);

        }, this);



        Phaser.Plugin.Mobile.Keyboard.onDismiss.add(function () {

            this.events.onBlur.dispatch(this);


        }, this);



        Phaser.Plugin.Mobile.Keyboard.onInsertText.add(function insertingText (inserted) {

            this.setText(this.text += inserted);

        }, this);



        Phaser.Plugin.Mobile.Keyboard.onDeleteBackward.add(function deletingText () {

            var oldText = this.text;
            if (oldText.length > 0) {
                this.setText(oldText.slice(0, oldText.length - 1));
            }

        }, this);


    }, this);

    this.events.onBlur.add(function lostFocus () {
        Phaser.Plugin.Mobile.Keyboard.hide();

        Phaser.Plugin.Mobile.Keyboard.onDone.removeAll();
        Phaser.Plugin.Mobile.Keyboard.onDismiss.removeAll();
        Phaser.Plugin.Mobile.Keyboard.onInsertText.removeAll();
        Phaser.Plugin.Mobile.Keyboard.onDeleteBackward.removeAll();

    }, this);
};
