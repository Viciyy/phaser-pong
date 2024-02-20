import Phaser from "phaser";

const gameWidth = 1280;
const gameHeight = 768;
const spriteSize = 32;

/**
 * Generate a random integer between min and max values
 * @param {integer} min minimum value
 * @param {integer} max maximum value
 * @returns random integer between min and max values
 */
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

/**
 * Generate an array for the background tiles of the level
 * Uses specific tiles from the tileset for corners, borders and middle tiles
 * @param {integer} levelWidth width of the level
 * @param {integer} levelHeight height of the level
 * @returns array for the background tiles
 */
const getLevelArray = (levelWidth = 40, levelHeight = 24) => {
  // Initialize an array with default value 104
  const array2D = Array.from({ length: 24 }, () => Array(40).fill(104));

  // Set specific values
  array2D[0][0] = 90;    // top left corner
  array2D[0][levelWidth - 1] = 92;   // top right corner
  array2D[levelHeight - 1][0] = 96;   // bottom left corner
  array2D[levelHeight - 1][levelWidth - 1] = 94;  // bottom right corner

  // Set values for sides
  for (let i = 1; i < levelHeight - 1; i++) {
      array2D[i][0] = 72;   // left side
      array2D[i][levelWidth - 1] = 80;  // right side
  }

  for (let j = 1; j < levelWidth - 1; j++) {
      array2D[0][j] = 76;   // top side
      array2D[levelHeight - 1][j] = 84;  // bottom side
  }

  // Set value for the middle
  for (let i = 1; i < levelHeight - 1; i++) {
      for (let j = 1; j < levelWidth - 1; j++) {
          array2D[i][j] = 104;  // middle
      }
  }
  return array2D;
};

/**
 * Duck collision callback/handler for a duck and a paddle
 * @param {Phaser.physics} duck duck
 * @param {Phaser.physics} paddle paddle
 * @param {Phaser.sound} sound sound effect to play on the collision
 */
const duckCollision = (duck, paddle, sound) => {
  var newVelocityX = duck.body.velocity.x;
  if (duck.body.velocity.x >= 3000 || duck.body.velocity.x <= -3000) {
    newVelocityX = duck.body.velocity.x;
  } else if (duck.body.velocity.x > 0) {
    newVelocityX = duck.body.velocity.x + 15;
  } else if (duck.body.velocity.x < 0) {
    newVelocityX = duck.body.velocity.x - 15;
  }

  duck.setVelocityY(duck.body.velocity.y + (paddle.body.velocity.y / 2) + randomBetween(-50, 50)).setVelocityX(newVelocityX);
  playSoundEffect(sound);
}

/**
 * Play a sound effect once
 * @param {Phaser.sound} sound sound effect to be played
 */
const playSoundEffect = (sound) => {
  sound.play();
}

class Pong extends Phaser.Scene
{
  duck;
  duck2;
  paddlePlayer; 
  paddleEnemy; 
  buttons;
  playerPoints = 0;
  enemyPoints = 0;
  playerScoreText;
  enemyScoreText;
  quackSound;
  bonkSound;

  preload ()
  {
    // https://caz-creates-games.itch.io/ducky-2
    this.load.spritesheet('duck', 'assets/ducky_2_spritesheet.png', { frameWidth: spriteSize, frameHeight: spriteSize, startFrame: 12, endFrame: 15 });
    // https://caz-creates-games.itch.io/ducky-3
    this.load.spritesheet('duck2', 'assets/ducky_3_spritesheet.png', { frameWidth: spriteSize, frameHeight: spriteSize, startFrame: 12, endFrame: 15 });
    // https://beeler.itch.io/top-down-earth-tileset
    this.load.image('background-tiles', 'assets/TileSet_V2.png');
    this.load.image('leaf', 'assets/leaf2.png');
    // https://www.myinstants.com/en/instant/quackmp3/
    this.load.audio('quack', 'assets/quack_5.mp3');
    // https://www.myinstants.com/en/instant/bamboo-hit-18672/
    this.load.audio('bonk', 'assets/bamboo-hit-sound-effect.mp3');
  }

  create ()
  {
    // Add keyboard inputs
    this.buttons = this.input.keyboard.createCursorKeys();

    // Make a background from the tilemap
    const map = this.make.tilemap({ 
      data: getLevelArray( gameWidth / spriteSize, gameHeight / spriteSize), 
      tileWidth: spriteSize, 
      tileHeight: spriteSize 
    });
    const tiles = map.addTilesetImage('background-tiles');
    map.createLayer(0, tiles, 0, 0);

    // Initialize score texts
    this.playerScoreText = this.add.text(176, 64, this.playerPoints || '0', { fontSize: '32px', fill: '#000' });
    this.enemyScoreText = this.add.text(gameWidth - 192, 64, this.enemyPoints || '0', { fontSize: '32px', fill: '#000' });

    // Animate ducks from spritesheet frames
    this.anims.create({
      key: 'duckAnimation',
      frames: this.anims.generateFrameNumbers('duck'),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'duck2Animation',
      frames: this.anims.generateFrameNumbers('duck2'),
      frameRate: 10,
      repeat: -1
    });

    // Add ducks as a physics object and set base values
    this.duck = 
      this.physics.add
        .sprite((gameWidth - spriteSize) / 2, (gameHeight - spriteSize) / 2, 'duck')
        .setScale(2, 2)
        .play('duckAnimation')
        .setVelocityX(-300)
        .setBounce(1, 1)
        .setCollideWorldBounds(true);

    this.duck2 = 
      this.physics.add
        .sprite((gameWidth - spriteSize) / 2, (gameHeight - spriteSize) / 2, 'duck2')
        .setScale(2, 2)
        .play('duck2Animation')
        .setVelocityX(200)
        .setBounce(1, 1)
        .setCollideWorldBounds(true);

    // Initialize sound effects
    this.quackSound = this.sound.add('quack', { volume: 0.2 });
    this.bonkSound = this.sound.add('bonk', { volume: 0.2 });

    // Add player and enemy paddles and set base values
    this.paddlePlayer = 
      this.physics.add
        .image(32, gameHeight / 2, 'leaf')
        .setScale(1.5, 1.5)
        .setImmovable(true)
        .setCollideWorldBounds(true);

    this.paddleEnemy = 
      this.physics.add
        .image(gameWidth - 32, gameHeight / 2, 'leaf')
        .setFlipX(true)
        .setScale(1.5, 1.5)
        .setImmovable(true)
        .setCollideWorldBounds(true);

    // Add colliders between ducks and paddles
    this.physics.add.collider(this.duck, this.paddlePlayer, (duck, paddle) => duckCollision(duck, paddle, this.bonkSound));
    this.physics.add.collider(this.duck, this.paddleEnemy, (duck, paddle) => duckCollision(duck, paddle, this.bonkSound));

    this.physics.add.collider(this.duck2, this.paddlePlayer, (duck, paddle) => duckCollision(duck, paddle, this.bonkSound));
    this.physics.add.collider(this.duck2, this.paddleEnemy, (duck, paddle) => duckCollision(duck, paddle, this.bonkSound));

    this.physics.add.collider(this.duck, this.duck2, () => playSoundEffect(this.quackSound));
  } 

  update ()
  {
    // Rotate ducks
    this.duck.rotation += 0.01;
    this.duck2.rotation -= 0.01;
    
    // Player controls
    if (this.buttons.up.isDown) {
      this.paddlePlayer.setVelocityY(-300);
    } else if (this.buttons.down.isDown) {
      this.paddlePlayer.setVelocityY(300);
    } else {
      this.paddlePlayer.setVelocityY(0);
    }

    // Simple AI
    this.simpleAi();

    // Score conditions
    this.checkDidDuckMissPaddle(this.duck, -300);
    this.checkDidDuckMissPaddle(this.duck2, 200);
  }

  /**
   * Method for making a simple AI for enemy paddle
   * Follows the duck that is closest to the paddle
   */
  simpleAi() {
    var closerDuck = this.duck;

    if (this.duck2.body.x > this.duck.body.x) {
      closerDuck = this.duck2;
    }

    if (closerDuck.y < this.paddleEnemy.body.y + 60) {
      this.paddleEnemy.setVelocityY(-250);
    } else if (closerDuck.y > this.paddleEnemy.body.y + 70) {
      this.paddleEnemy.setVelocityY(250);
    } else {
      this.paddleEnemy.setVelocityY(0);
    }
  }

  /**
   * Check if a duck has missed a paddle (reached the end)
   * Add scores according to the side that was hit
   * Resets the duck position and velocity
   * @param {Phaser.physics} duck duck
   * @param {integer} startVelocity Start velocity for the duck
   */
  checkDidDuckMissPaddle(duck, startVelocity) {
    if (duck.body.x < 32) { // Hit the left side
      this.resetDuck(duck, startVelocity);
      this.enemyPoints++;
      this.enemyScoreText.setText(this.enemyPoints);
    }
    if (duck.body.x > 1186) { // Hit the right side
      this.resetDuck(duck, startVelocity);
      this.playerPoints++;
      this.playerScoreText.setText(this.playerPoints);
    }
  }

  /**
   * Reset duck position and velocity
   * Play a sound effect
   * @param {Phaser.physics} duck duck
   * @param {integer} startVelocity Start velocity for the duck
   */
  resetDuck(duck, startVelocity) {
    playSoundEffect(this.quackSound);
    duck.body.x = (gameWidth - spriteSize) / 2;
    duck.body.y = (gameHeight - spriteSize) / 2;
    duck.setVelocityY(0).setVelocityX(startVelocity);
  }
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  scene: Pong,
  autoCenter: true,
  physics: {
    default: 'arcade',
    arcade: {
        debug: false
    }
  }
};

const game = new Phaser.Game(config);
