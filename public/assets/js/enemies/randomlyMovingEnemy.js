import Enemy from "./enemyClass.js";

export default class RandomlyMovingEnemy extends Enemy{
    constructor(scene, x, y, texture, frame){
        super(scene, x, y, texture, frame);

        //determine movement constraints
        this.canBeStill = true;
        this.canMoveDiagonally = false;
        //determines if it waits for an event to start moving
        this.movesFromTheStart = true;
        this.changeDirectionInterval = 2000;
        //check that it's started moving, so the direction change doesn't go off early
        this.hasStartedMoving = false;
        //used by shootingEnemies to have them hold still while firing
        this.stopped = false;

        //used for enemy classes that just use this for movement and have other things that determine movement
        this.dontChangeDirectionUntilTold = false;

        //storing this here so it can be destroyed when the object is destroyed
        this.randomMovementEvent = Phaser.Time.TimerEvent;

        //changes their direction every few seconds
        this.randomMovementEvent = scene.time.addEvent({
            delay: this.changeDirectionInterval,
            callback: () => {
                if(this.hasStartedMoving){
                    this.setMovementInRandomDirection();
                }
            },
            loop: true
        });

        //to hadle wall collisions
        scene.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this);
    }

    //run this at the end of the constructor of a descendant class
    descendantStartMethod(){
        //start them moving, if they move from start
        //NOTE calling this here instead of the parent class to make sure it uses the movesFromTheStart of the descendant
        if(this.movesFromTheStart){
            this.setMovementInRandomDirection();
        }

        //keep them from changing direction at interval if told not to
        if(this.dontChangeDirectionUntilTold){
            this.randomMovementEvent.destroy();
        }
    }

    //stop triggering events when this object is gone
    preDestroy(){
        this.randomMovementEvent.destroy();
    }

    //have goblin change direction when it hits a wall
    handleTileCollision(gameObject, tile){
        if(gameObject !== this){
            return;
        }

        this.setMovementInRandomDirection();
    }

    //set their movement them in a random direction
    setMovementInRandomDirection(){
        //starts them moving
        this.hasStartedMoving = true;

        if(this.stopped){
            return;
        }

        //set random movement
        if(this.canMoveDiagonally){
            this.directionTracker.up = this.coinFlip();
            this.directionTracker.down = this.coinFlip();
            this.directionTracker.right = this.coinFlip();
            this.directionTracker.left = this.coinFlip();
        //if they can't move diagonally
        }else{
            if(this.coinFlip()){
                this.directionTracker.up = false;
                this.directionTracker.down = false;
                this.directionTracker.right = this.coinFlip();
                this.directionTracker.left = this.coinFlip();
            }else{
                this.directionTracker.up = this.coinFlip();
                this.directionTracker.down = this.coinFlip();
                this.directionTracker.right = false;
                this.directionTracker.left = false;
            }
        }

        //prevent conflicting movement instructions
        if(this.directionTracker.up && this.directionTracker.down){
            this.coinFlip() ? this.directionTracker.up = false : this.directionTracker.down = false;
        }
        if(this.directionTracker.right && this.directionTracker.left){
            this.coinFlip() ? this.directionTracker.right = false : this.directionTracker.left = false;
        }

        //force it move in a random direction if it's not allowed to stay still
        if(!this.canBeStill && 
            !this.directionTracker.up &&
            !this.directionTracker.down &&
            !this.directionTracker.right &&
            !this.directionTracker.left){
            if(this.canMoveDiagonally){
                this.directionTracker.up = this.coinFlip();
                this.directionTracker.down = !this.directionTracker.up;
                this.directionTracker.right = this.coinFlip();
                this.directionTracker.left = !this.directionTracker.right;
            }else{
                if(this.coinFlip()){
                    this.directionTracker.up = false;
                    this.directionTracker.down = false;
                    this.directionTracker.right = this.coinFlip();
                    this.directionTracker.left = !this.directionTracker.right;
                }else{
                    this.directionTracker.up = this.coinFlip();
                    this.directionTracker.down = !this.directionTracker.up;
                    this.directionTracker.right = false;
                    this.directionTracker.left = false;
                }
            }
        }
    }
}