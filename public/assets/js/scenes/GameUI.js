import { sceneEvents } from "../events/eventCenter.js";
import { eventNames } from "../events/eventNames.js";

export default class GameUI extends Phaser.Scene {
    //TODO pass # into constructor to set numberOfHearts
    constructor(){
        //the key to get it
        super("game-ui");

        this.numberOfHearts = 4
        this.hearts;
        this.scoreDisplay;

        this.weaponDisplay;
        this.numberOfWeaponChunks = 4;
        this.weaponBar;
    }

    create(){
        this.scoreDisplay = this.add.text(5, 40, "Score: 0");

        //group object for the heath hearts
        this.hearts = this.add.group({
            classType: Phaser.GameObjects.Image
        });

        //group object for the mana bar
        this.weaponBar = this.add.group({
            classType: Phaser.GameObjects.Image
        });

        //puts the hearts at the top of the screen
        this.hearts.createMultiple({
            key: "ui-heart-full",
            setXY: {
                x: 20,
                y: 20,
                stepX: 32
            },
            quantity: this.numberOfHearts
        });

        //create the mana bar chunks
        this.weaponBar.createMultiple({
            key: "mana-bar-chunk",
            setXY: {
                x: 196,
                y: 43,
                stepX: -12
            },
            quantity: this.numberOfWeaponChunks
        });

        this.weaponDisplay = this.add.image(180, 20, "axe").setScale(2.5, 2.5);

        //make the hearts bigger
        this.hearts.children.iterate(child => {
            child.setScale(2, 2);
        });

        //make mana chunks smaller
        this.weaponBar.children.iterate(child => {
            child.setScale(1, 1);
        });

        //checks for the playerHealthChanged event, and updates the ui
        sceneEvents.on(eventNames.playerHealthChanged, this.handlePlayerHealthChanged, this);
        sceneEvents.on(eventNames.scoreUpdated, this.handlePlayerScoreChanged, this);
        sceneEvents.on(eventNames.weaponChargeChanged, this.handleWeaponSwingChangeChange, this);

        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            sceneEvents.off(eventNames.playerHealthChanged, this.handlePlayerHealthChanged, this);
            sceneEvents.off(eventNames.scoreUpdated, this.handlePlayerScoreChanged, this);
            sceneEvents.off(eventNames.weaponChargeChanged, this.handleWeaponSwingChangeChange, this);
        })
    }

    handleWeaponSwingChangeChange(charges){
        this.weaponBar.children.each((gameObject, index) => {
            if(index < charges){
                gameObject.setTexture("mana-bar-chunk-empty");
            }else{
                gameObject.setTexture("mana-bar-chunk");
            }
        });
    }

    handlePlayerHealthChanged(health){
        //each heart takes 2 hits, and index starts at 0
        let healthIndex = (health / 2) - 1;
        this.hearts.children.each((gameObject, index) => {
            if(index <= healthIndex){
                gameObject.setTexture("ui-heart-full")
            //checks for the half-heart
            }else if(index < healthIndex + 1){
                gameObject.setTexture("ui-heart-half")
            }else{
                gameObject.setTexture("ui-heart-empty")
            }
        });
    }

    handlePlayerScoreChanged(score){
        this.scoreDisplay.text = "Score: " + score;
    }
}