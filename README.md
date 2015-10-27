# Textbox-plugin
Easy to use game object for handling keyboard input in Phaser


####Example
```js
  // Set some variables
  var halfWidth = this.game.width/2,
      halfHeight = this.game.height/2,
      leftAlign = 100,
      rightAlign = this.game.width - 100,
      boxlength = this.game.width - 200,
      boxheight = 72,
      userFont = {
          font: '50px sans-serif',
          fill: '#000'
      };
  
  // Create a Mobile.Textbox
  // game.add.textbox (x, y, width, height, text, group)
  this.emailTextbox = this.add.textbox(
      leftAlign,
      halfHeight,
      boxlength,
      boxheight);
      
  // Start listening for clicks
  this.emailTextbox.enableKeyboard('phone');
```
