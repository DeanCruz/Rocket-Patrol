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
        this.moveSpeed *= 1.5;
    }
}