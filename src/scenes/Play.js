class Play extends Phaser.Scene {
    constructor() {
        super("playScene");

        // add text to display time
        this.timeText = null;

        // add timer for speed up
        this.speedTimer = 0;

        // add music
        this.music = null;

        // default player
        this.activePlayer = 'P1';
    }

    // initialize game settings
    init(settings) {
        this.settings = settings;
        this.gameTimer = settings.gameTimer;
    }

    preload(){
        // load images/tile sprites
        this.load.image('rocket', './assets/rocket.png');
        this.load.image('spaceship', './assets/spaceship.png');
        this.load.image('starfield', './assets/starfield.png');
        this.load.image('smallShip', './assets/smallShip.png');
        // load spritesheet
        this.load.spritesheet('explosion', './assets/explosion.png', {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});
        // load music
        this.load.audio('backgroundMusic', ['./assets/rocketpatrolbackground.mp3']);

    }

    create() {
        // create music
        this.music = this.sound.add('backgroundMusic');
        this.music.setVolume(0.5);
        this.music.play();
        
        // place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0,0);
        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);
        
        // add rocket (p1)
        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0);
        // add rocket (p2)
        this.p2Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0);
        // add spaceships (x3)
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4, 'spaceship', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'spaceship', 0, 20).setOrigin(0,0);
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'spaceship', 0, 10).setOrigin(0,0);
        // add smallShip (bonus)
        this.smolShip = new SmallShip(this, game.config.width + borderUISize*8, this.ship01.y, 'smallShip', 0, 50).setOrigin(0, 0);
        
        // white borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0,0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0,0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0,0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0,0);

        // initialize starting positions for each player
        this.startingPlayer1Position = { x: this.p1Rocket.x, y: this.p1Rocket.y };
        this.startingPlayer2Position = { x: this.p2Rocket.x, y: this.p2Rocket.y };

        // end screen text
        this.endScreenText = [];
        
        // timer
        this.remainingTime = this.settings.gameTimer / 1000;
        let timerConfig = {
            fontFamily: 'Courier',
            fontSize: '22px',
            backgroundColor:'#F3B141',
            color: '#843605',
            align: 'right',
            padding:{
                top: 5,
                bottom: 5,
            },
            fixedWidth: 150
        };
        this.timeText = this.add.text(game.config.width - borderUISize - borderPadding - timerConfig.fixedWidth, borderUISize + borderPadding * 2, '', timerConfig);
        this.timeText.setText('Time: ' + this.remainingTime);
        
        // add a speed timer that counts to 30
        let speedTimer = 0;

        // dislay time
        this.time.addEvent({
            delay: 1000, 
            callback: () => { // end game when time is out
                if (this.remainingTime <= 0) {
                    this.endGame();
                    this.timeText.setText('Time: 0');
                }
                else { // decrement time
                    this.remainingTime--;
                    // increment speed timer until it reaches 30
                    this.speedTimer++;
                    if (this.speedTimer >= 30) {
                        // activate spaceship speed increase
                        this.speedIncrease = true;
                    }
                    // display time
                    this.timeText.setText('Time: ' + this.remainingTime);
                }
            },
            callbackScope: this,
            loop: true
        });

        // define keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        // add key for player 2 start
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // add mouse controls
        if (this.activePlayer === 'P1') {
            this.input.on('pointermove', (pointer) => {
                this.handlePointerMove(pointer);
            });
            this.input.on('pointerdown', (pointer) => {
                this.handlePointerDown(pointer);
            });
        } else { // add mouse controls for p2
            this.input.on('pointermove', (pointer) => {
                this.handlePointerMoveP2(pointer);
            });
            this.input.on('pointerdown', (pointer) => {
                this.handlePointerDown(pointer);
            });
        }
        
        
        // animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { 
                start: 0, 
                end: 9, 
                first: 0
            }),
            frameRate: 30
        });

        // initialize score
        this.p1Score = 0;
        // display score
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '22px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, scoreConfig);

        // display high score
        this.highScoreText = this.add.text(borderUISize + borderPadding * 12, borderUISize + borderPadding * 2, `High Score: ${gameData.highScore}`, {

            fontFamily: 'Courier',
            fontSize: '22px',
            color: '#000000',
            backgroundColor: '#F3B141',
            padding: {
                top: 5,
                bottom: 5,
            },
        });

        // add 'FIRE' text
        this.fireText = this.add.text(game.config.width/2, borderUISize + borderPadding * 2, 'FIRE', {
            fontFamily: 'Courier',
            fontSize: '22px',
            color: '#000000',
            backgroundColor: '#F3B141',
            padding: {
                top: 5,
                bottom: 5,
            },
        }).setOrigin(-1, 0);

        // add active player indicator (p1)
        if (this.activePlayer == 'P1'){
            this.playerIndicator = this.add.text(borderUISize + borderPadding, game.config.height - borderUISize - borderPadding, 'P1', {
                fontFamily: 'Courier',
                fontSize: '18px',
                color: '#FFFFFF',
                backgroundColor: '#FF0000',
                padding: {
                    top: 2,
                    bottom: 2,
                },
            }).setOrigin(0, 1);
        }
        // add active player indicator (p2)
        if (this.activePlayer == 'P2'){
            this.playerIndicator = this.add.text(borderUISize + borderPadding, game.config.height - borderUISize - borderPadding, 'P2', {
                fontFamily: 'Courier',
                fontSize: '18px',
                color: '#FFFFFF',
                backgroundColor: '#0066FF',
                padding: {
                    top: 2,
                    bottom: 2,
                },
            }).setOrigin(0, 1);
        }
        // game over flag
        this.gameOver = false;
        // 30 second speed increase flag
        this.speedIncrease = false;
        // power down flag
        this.powerDown = false;
    }

    update() {
        // update tile sprite
        this.starfield.tilePositionX -= 4;  

        // make active rocket visible
        if(this.activePlayer == 'P1') { // P1 active
            this.p1Rocket.visible = true;
            this.p2Rocket.visible = false;
        }
        else { // P2 active
            this.p1Rocket.visible = false;
            this.p2Rocket.visible = true;
        }

        // update the correct rocket
        if(!this.gameOver) {
            if (this.activePlayer === 'P1') {
                this.p1Rocket.update();
            } else {
                this.p2Rocket.update();
            }            
            //  update spaceships
            this.ship01.update();              
            this.ship02.update();
            this.ship03.update();
            this.smolShip.update();
        }

        // 'FIRE' text
        if (this.p1Rocket.isFiring || this.p2Rocket.isFiring) {
            this.fireText.visible = true;
        } 
        else { // only display while firing
            this.fireText.visible = false;
        }

        // check collisions
        if (this.activePlayer === 'P1') { // handle P1 collisions
            this.checkAndHandleCollisions(this.p1Rocket);
        } 
        else { // handle P2 collisions
            this.checkAndHandleCollisions(this.p2Rocket);
        }
    }

    // allow collision handling for both rockets for each spaceship
    checkAndHandleCollisions(rocket) {
        if (this.checkCollision(rocket, this.ship03)) {
            this.shipExplode(this.ship03);
            this.time.delayedCall(1000, () => { // add delay before allowing firing again
                rocket.reset();
            });
        }
        if (this.checkCollision(rocket, this.ship02)) {
            this.shipExplode(this.ship02);
            this.time.delayedCall(1000, () => { // add delay before allowing firing again
                rocket.reset();
            });
        }
        if (this.checkCollision(rocket, this.ship01)) {
            this.shipExplode(this.ship01);
            this.time.delayedCall(1000, () => { // add delay before allowing firing again
                rocket.reset();
            });
        }
        if (this.checkCollision(rocket, this.smolShip)) {
            this.shipExplode(this.smolShip);
            this.time.delayedCall(1000, () => { // add delay before allowing firing again
                rocket.reset();
            });
        }
    }

    checkCollision(rocket, ship) {
        // using Phaser's Rectangle class for collision checking
        let rocketRect = new Phaser.Geom.Rectangle(rocket.x, rocket.y, rocket.width, rocket.height);
        let shipRect = new Phaser.Geom.Rectangle(ship.x, ship.y, ship.width * ship.scaleX, ship.height * ship.scaleY);
        return Phaser.Geom.Rectangle.Overlaps(rocketRect, shipRect);
    }

    shipExplode(ship) {
        // temporarily hide ship
        ship.alpha = 0;                         
        // create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');             // play explode animation
        boom.on('animationcomplete', () => {    // callback after anim completes
            ship.reset();                         // reset ship position
            ship.alpha = 1;                       // make ship visible again
            boom.destroy();                       // remove explosion sprite
        });

        if (this.activePlayer === 'P1') {
            this.p1Rocket.reset();
        } else {
            this.p2Rocket.reset();
        }

        // score add and repaint
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score; 

        // update high score if necessary
        if (this.p1Score > gameData.highScore) {
            gameData.highScore = this.p1Score;
        }
        this.highScoreText.text = `High Score: ${gameData.highScore}`;

        // increase timer
        this.remainingTime += ship.reward;
        this.timeText.setText('Time: ' + this.remainingTime);

        // play randomized explosion sound
        this.playRandomExplosion();
    }

    handlePointerMove(pointer) {
        // mouse movement for P1
        if (this.activePlayer === 'P1') {
            if (!this.p1Rocket.isFiring) {
                this.p1Rocket.x = Phaser.Math.Clamp(pointer.x, borderUISize + borderPadding, game.config.width - borderUISize - borderPadding);
            }
        } else { // mouse movement for P2
            if (!this.p2Rocket.isFiring) {
                this.p2Rocket.x = Phaser.Math.Clamp(pointer.x, borderUISize + borderPadding, game.config.width - borderUISize - borderPadding);
            }
        }
    }
    
    handlePointerDown(pointer) {
        if (!this.gameOver && !this.p1Rocket.isFiring || !this.gameOver && !this.p2Rocket.isFiring) {
            if (pointer.x < game.config.width / 2) {
                // P1
                this.p1Rocket.isFiring = true;
                this.sound.play('sfx_rocket');
            } else if (!this.p2Rocket.isFiring){
                // P2
                this.p2Rocket.isFiring = true;
                this.sound.play('sfx_rocket');
            }
        }
    }

    endGame() {
        // add end game sfx
        if (!this.powerDown){
            this.sound.play('power_down');
            this.powerDown = true;
        }
        // display text
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        };
        this.speedTimer = 0;
        // end screen text
        this.gameOverText = this.add.text(game.config.width / 2, game.config.height / 2 - 64, 'GAME OVER', scoreConfig).setOrigin(0.5);
        this.restartText = this.add.text(game.config.width / 2, game.config.height / 2, 'Press (R) to Restart or ← to Menu', scoreConfig).setOrigin(0.5);
        // space to start end screen
        this.spaceToStartText = this.add.text(game.config.width / 2, game.config.height / 2 + 64, 'Press SPACE to Start Next Player', scoreConfig).setOrigin(0.5);

        // flag game over condition
        this.gameOver = true;
    
        // store end screen text objects in the array
        this.endScreenText.push(this.gameOverText);
        this.endScreenText.push(this.restartText);
        this.endScreenText.push(this.spaceToStartText);

        // check space key input event to alternate players
        this.spaceKeydown = () => {
            if (this.gameOver == true) {
                this.toggleActivePlayer(); // switch from p1 to p2
                this.resetGame(); 
                this.endScreenText.forEach(text => { // remove end screen text
                    if (text) {
                        text.visible = false;
                    }
                });
                // remove flag for end sound
                this.powerDown = false;
                // remove listener
                this.input.keyboard.removeListener('keydown-SPACE', this.spaceKeydown);
            }
        };
        this.input.keyboard.on('keydown-SPACE', this.spaceKeydown);
        
        // check key input to restart
        this.rKeydown = () => {
            if (this.gameOver) {
                if (this.activePlayer == 'P2') {
                    this.toggleActivePlayer();
                }
                this.resetGame();
                this.endScreenText.forEach(text => {
                    if (text) {
                        text.visible = false;
                    }
                });
                // remove flag for end sound
                this.powerDown = false;
                // remove listener
                this.input.keyboard.removeListener('keydown-R', this.rKeydown);
            }
        };
        this.input.keyboard.on('keydown-R', this.rKeydown);

        // check key input to return to menu
        this.leftKeydown = () => {
            if (this.gameOver) { // if P2, switch back to P1
                if (this.activePlayer == 'P2'){
                    this.toggleActivePlayer();
                }
                // stop music so it doesnt loop over itself
                this.music.stop();
                // return to menu
                this.scene.start("menuScene");
                this.resetGame();
                // remove flag for end sound
                this.powerDown = false;
                // remove listener
                this.input.keyboard.removeListener('keydown-LEFT', this.leftKeydown);
            }
        };
        this.input.keyboard.on('keydown-LEFT', this.leftKeydown);
    }

    resetGame() {
        // reset player positions
        this.p1Rocket.setPosition(this.startingPlayer1Position.x, this.startingPlayer1Position.y);
        this.p2Rocket.setPosition(this.startingPlayer2Position.x, this.startingPlayer2Position.y);
    
        // reset game timer
        this.remainingTime = this.settings.gameTimer / 1000;
        this.timeText.setText('Time: ' + this.remainingTime);

        // reset score
        this.p1Score = 0;
        this.scoreLeft.text = this.p1Score;

        // reset rockets and spaceships
        this.p1Rocket.reset();
        this.p2Rocket.reset();
        this.ship01.reset();
        this.ship02.reset();
        this.ship03.reset();
        this.smolShip.reset();
        this.resetSpaceshipSpeed();

        // restart loop
        this.gameOver = false;
    }

    resetSpaceshipSpeed() {
        this.ship01.setMoveSpeed(game.settings.spaceshipSpeed);
        this.ship02.setMoveSpeed(game.settings.spaceshipSpeed);
        this.ship03.setMoveSpeed(game.settings.spaceshipSpeed);
        this.smolShip.setMoveSpeed(game.settings.smolshipSpeed);
        this.speedIncrease = false;
    }

    hideEndScreen() {
        // hide text after restarting game
        this.endScreenText.forEach(text => text.visible = false);
    }

    toggleActivePlayer() {
        // switch active player
        this.activePlayer = this.activePlayer === 'P1' ? 'P2' : 'P1';
        this.playerIndicator.setText(this.activePlayer);

        // update the indicator color based on the active player
        if (this.activePlayer === 'P1') { // red P1 indicator
            this.playerIndicator.setStyle({
                color: '#FFFFFF',
                backgroundColor: '#FF0000'
            });
        } else { // blue P2 indicator
            this.playerIndicator.setStyle({
                color: '#FFFFFF',
                backgroundColor: '#0066FF'
            });
        }
    }

    playRandomExplosion() {
        // randomize explosion sounds
        const explosionIndex = Phaser.Math.Between(1, 5);
        this.sound.play(`sfx_explosion${explosionIndex}`);
    }
}