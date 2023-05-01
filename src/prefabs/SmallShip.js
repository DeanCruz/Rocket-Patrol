class SmallShip extends Spaceship {
    constructor(scene, x, y, texture, frame, pointValue) {
        super(scene, x, y, texture, frame, pointValue);

        // make the ship small
        this.setScale(0.025);

        // points value
        this.points = 100;

        // time reward
        this.reward = 5;

        // increase the ship speed
        this.moveSpeed = 5;
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
    
    // bonus ship increased move speed
    increaseSpeed() {
       this.moveSpeed = 9;
    }

    // position reset
    reset() {
        this.x = game.config.width;
    }

    setMoveSpeed(newSpeed) {
        this.moveSpeed = newSpeed;
    }
}