import Phaser from "phaser";

const gameWidth = 1280;
const gameHeight = 768;
const spriteSize = 32;

const getLevelArray = (levelWidth = 40, levelHeight = 24) => {
  // Initialize a 40x24 array with default value 104
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

class Pong extends Phaser.Scene
{

  duck;
  paddlePlayer; // TODO
  paddleEnemy; // TODO

  preload ()
  {
    // https://caz-creates-games.itch.io/ducky-2
    this.load.spritesheet('duck', 'assets/ducky_2_spritesheet.png', { frameWidth: spriteSize, frameHeight: spriteSize, startFrame: 12, endFrame: 15 });
    // https://beeler.itch.io/top-down-earth-tileset
    this.load.image('background-tiles', 'assets/TileSet_V2.png');
    this.load.image('leaf', 'assets/leaf.png');
  }

  create ()
  {
    const map = this.make.tilemap({ 
      data: getLevelArray( gameWidth / spriteSize, gameHeight / spriteSize), 
      tileWidth: spriteSize, 
      tileHeight: spriteSize 
    });
    const tiles = map.addTilesetImage('background-tiles');
    map.createLayer(0, tiles, 0, 0);

    this.anims.create({
      key: 'duckAnimation',
      frames: this.anims.generateFrameNumbers('duck'),
      frameRate: 10,
      repeat: -1
    });

    this.duck = 
      this.add
        .sprite((gameWidth - spriteSize) / 2, (gameHeight - spriteSize) / 2, 'duck')
        .setScale(2, 2)
        .play('duckAnimation');

    this.paddlePlayer = this.add.image(32, gameHeight / 2, 'leaf').setScale(1.5, 1.5);

    this.paddleEnemy = this.add.image(gameWidth - 32, gameHeight / 2, 'leaf').setFlipX(true).setScale(1.5, 1.5);
  } 

  update ()
  {
    this.duck.rotation += 0.01;
    this.duck.x -= 1; 
  }
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  scene: Pong,
  autoCenter: true,
};

const game = new Phaser.Game(config);
