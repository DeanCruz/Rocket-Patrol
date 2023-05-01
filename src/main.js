// Dean Cruz
// Rocket Patrol: Rocket Power
// Mod 1: Displayed Timer (10 points) - 30 mins
// Mod 2: New timer mechanism (15 points) - 1 hour
// Mod 3: Add new small space ship (15 points) - 1 hour
// Mod 4: 30 second speed up (5 points) - 20 mins
// Mod 5: 'FIRE' UI (5 points) - 10 mins
let config = {
    type: Phaser.CANVAS,
    width: 640,
    height: 480,
    scene: [ Menu, Play ]
}

let game = new Phaser.Game(config);

// reserve keyboard vars
let keyF, keyR, keyLEFT, keyRIGHT;

// set UI sizes
let borderUISize = game.config.height / 15;
let borderPadding = borderUISize / 3;