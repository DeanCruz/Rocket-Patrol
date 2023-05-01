class Play extends Phaser.Scene {
    constructor() {
        super("playScene");

        // Add text to display time
        this.timeText = null;

        // Add timer for speed up
        this.speedTimer = 0;

        // Add music
        this.music = null;

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

        // timer
        this.remainingTime = this.settings.gameTimer / 1000;
        let timerConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
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
        // decrement time and display
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.remainingTime <= 0) {
                    this.endGame();
                    this.timeText.setText('Time: 0');
                }
                else {
                    this.remainingTime--;
                    this.speedTimer++;
                    if (this.speedTimer >= 30) {
                        this.speedIncrease = true;
                    }
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
            fontSize: '28px',
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

        // add FIRE text
        this.fireText = this.add.text(game.config.width/2, borderUISize + borderPadding * 2, 'FIRE', {
            fontFamily: 'Courier',
            fontSize: '28px',
            color: '#000000',
            backgroundColor: '#F3B141',
            padding: {
                top: 5,
                bottom: 5,
            },
        }).setOrigin(0.5, 0);

        // GAME OVER flag
        this.gameOver = false;
        // 30 second speed increase flag
        this.speedIncrease = false;
    }

    update() {
        // check key input for restart / menu
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }

        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }

        // update tile sprite
        this.starfield.tilePositionX -= 4;  

        if(!this.gameOver) {
            this.p1Rocket.update();             
            this.ship01.update();              
            this.ship02.update();
            this.ship03.update();
            this.smolShip.update();
        }

        console.log(this.p1Rocket.isFiring)
        if (this.p1Rocket.isFiring) {
            this.fireText.visible = true;
          } else {
            this.fireText.visible = false;
          }

        // check collisions
        if(this.checkCollision(this.p1Rocket, this.ship03)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
        }
        if (this.checkCollision(this.p1Rocket, this.ship02)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
        }
        if (this.checkCollision(this.p1Rocket, this.ship01)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
        }
        if (this.checkCollision(this.p1Rocket, this.smolShip)) {
            this.p1Rocket.reset();
            this.shipExplode(this.smolShip);
        }
    }
    
    endGame() {
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
        this.add.text(game.config.width / 2, game.config.height / 2, 'GAME OVER', scoreConfig).setOrigin(0.5);
        this.add.text(game.config.width / 2, game.config.height / 2 + 64, 'Press (R) to Restart or ← to Menu', scoreConfig).setOrigin(0.5);
        this.gameOver = true;
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
        // score add and repaint
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score; 
        
        // increase timer
        this.remainingTime += ship.reward;
        this.timeText.setText('Time: ' + this.remainingTime);

        this.sound.play('sfx_explosion');
      }
}