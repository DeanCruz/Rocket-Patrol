// Dean Cruz
// Rocket Patrol: Rocket Power
// Mod 1: Displayed Timer (10 points) - 30 mins
// Mod 2: New timer mechanism (15 points) - 1 hour
// Mod 3: Add new small space ship (15 points) - 1 hour
// Mod 4: 30 second speed up (5 points) - 20 mins
// Mod 5: 'FIRE' UI (5 points) - 10 mins
// Mod 6: Background Music (5 points) - 10 mins
// Mod 7: Persistent high score (5 points) - 15 mins
// Mod 8: Add mouse controls (15 points) - 20 mins
// Mod 9: Add alternating players (15 points) - 2 hours
//        2 players activated by pressing space on end screen
//        Pressing R will reset player 1 for 1 player mode
//        There is an indicator on the bottom left that indicates
//        which player is currently active.
// Mod 10: Add & randomize 4 explosion sounds (10 points) - 15 mins
//         Added 4 additional sounds and an end game sound when the end
//         screen is displayed
// Citations: I only referenced ChatGPT for error messages (I have previous javascript experience)

// save highscore locally
const gameData = {
    highScore: 0
};

// configure game
let config = {
    type: Phaser.CANVAS,
    width: 640,
    height: 480,
    scene: [ Menu, Play ]
}

// game declaration
let game = new Phaser.Game(config);

// reserve keyboard vars
let keyF, keyR, keyLEFT, keyRIGHT, keySPACE;

// set UI sizes
let borderUISize = game.config.height / 15;
let borderPadding = borderUISize / 3;