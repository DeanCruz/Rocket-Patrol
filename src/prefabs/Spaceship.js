class Spaceship extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, texture, frame, pointValue){
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        // point value
        this.points = pointValue;   
        // time reward
        this.reward = 2;
        this.moveSpeed = game.settings.spaceshipSpeed;
    }

    update() {
        // increase speed if speedIncrease flag is true
        if (this.scene.speedIncrease) {
            this.increaseSpeed();
        }

        // move spaceship left
        this.x -= this.moveSpeed;

        // wrap around from left edge to right edge
        if(this.x <= 0 - this.width) {
            this.reset();
        }
    }
    
    // increase move speed when activated
    increaseSpeed() {
        // novice move speed
        if (game.settings.spaceshipSpeed == 3){
            this.moveSpeed = 5;
        }
        // expert move speed
        if (game.settings.spaceshipSpeed == 4){
            this.moveSpeed =7;
        }
    }

    // position reset
    reset() {
        this.x = game.config.width;
    }
}