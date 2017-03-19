var player;
var platforms;
var cursors;
var tetris;
var stars;
 
var goal;
var heals;
var knives;


var tetrisIsFalling = false;
var jumptime = 0;
var speedtime = 0;
var landingtime = 0;
var stucktimeLeft = 0;
var stucktimeRight = 0;

var platformCollisionGroup;
var playerCollisionGroup;
var tetrisCollisionGroup;
var enemiesCollisionGroup;
var hptext;
var spacebar; //let player speed up in either horizontal direction
// SOME PARAMETERS FOR THE GAME
var playerMass = 30;
var playerHealth = 100;
var tetrisMassOnGround = 250;
var MOMENTUM_FACTOR = 0.00007;
var WORLD_GRAVITY = 850;
var speedUp = 2000;
var STUCK_THRESHOLD = 400; //4s = die


//sounds
var sWalk;
var sHit;
var sJump;
var sTeleport;



var levelOne = { 
    preload: function() {
        
        game.load.image('sky', 'assets/sky.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('star', 'assets/star.png');
        // loading assets
        game.load.image('sky', 'assets/sky.png');  //background
        game.load.image('ground', 'assets/platform.png');
        // reaching the star = win/end game
        game.load.image('star', 'assets/star.png');
        //touching enemies = player dies
        game.load.image('knife', 'assets/knife.png');
        game.load.image('goal', 'assets/ham.png');
        game.load.image('heal', 'assets/heal.png');
        //tetris blocks
        game.load.image('i', 'assets/i.png');
        game.load.image('j', 'assets/j.png');
        game.load.image('l', 'assets/l.png');
        game.load.image('o', 'assets/o.png');
        game.load.image('s', 'assets/s.png');
        game.load.image('t', 'assets/t.png');
        game.load.image('z', 'assets/z.png');

        game.load.spritesheet('player', 'assets/devil.png', 32, 48);
        game.load.physics("physicsData", 'assets/physicsData.json');
        game.load.spritesheet('ae', 'assets/ae.png',32,48,1);

        //SOUNDS
        game.load.audio('sWalk', 'assets/sWalk.wav');
        game.load.audio('sHit', 'assets/sHit.wav');
        game.load.audio('sJump', 'assets/sJump.wav');
        game.load.audio('sTeleport', 'assets/sTeleport.wav');
        game.load.audio('sLanding','assets/sLanding.wav');
    },
    
    create: function() {
    	//SOUNDS
    	sWalk = game.add.audio('sWalk');
    	sTeleport = game.add.audio('sTeleport');
    	sJump= game.add.audio('sJump');
    	sHit= game.add.audio('sHit');
    	sLanding = game.add.audio('sLanding');

       //SYSTEM SETTING
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = WORLD_GRAVITY;
        game.physics.p2.world.defaultContactMaterial.friction = 0.3;
        game.physics.p2.restitution = 0.2; //bouncing
        //DOESNT WORK game.physics.p2.world.setGlobalStiffness(1e5);
        // Three different collision groups
        platformCollisionGroup = game.physics.p2.createCollisionGroup();
        //platformCollisionGroup.name = 'platform';
        playerCollisionGroup = game.physics.p2.createCollisionGroup();
        tetrisCollisionGroup = game.physics.p2.createCollisionGroup();
        //tetrisCollisionGroup.name = 'tetris';
        enemiesCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physics.p2.updateBoundsCollisionGroup(); // make sure object with their own collisiongroup still collide with world bounds
        //  A simple background for our game
        game.add.sprite(0, 0, 'sky');


        //PLATFORMS
        platforms = game.add.group();
        //platforms.enableBody = true; // enable physics for any object that is created in this group
        //platforms.physicsBodyType = Phaser.Physics.P2JS;
        var ground = game.add.sprite(0,game.world.height,'ground');
        ground.scale.setTo(4,2); //scale the original size 200x32 to fit width of screen
        game.physics.p2.enable(ground, false);
        ground.body.setCollisionGroup(platformCollisionGroup);
        ground.body.kinematic = true; //  the body will not be effected by physics such as gravity and collisions; Stop ground from falling away when you jump on it
        ground.body.collides([tetrisCollisionGroup, playerCollisionGroup]);
        ground.body.mass = 10000; //solid ground
        platforms.add(ground);

        //TETRISES
        tetrises = game.add.group();


        //PLAYER
        player = game.add.sprite(32, game.world.height - 500, 'player');
        game.physics.p2.enable(player, false);
        player.body.fixedRotation = true; // no rotation on player
        player.body.setCollisionGroup(playerCollisionGroup);
		player.body.collides([platformCollisionGroup]);


		player.body.collides([tetrisCollisionGroup]);
        player.health = playerHealth; //start fresh with 100 HP
        player.restitution = 0;
        player.body.mass = playerMass;

        player.body.onBeginContact.add(reduceHP);



        //ANIMATION AND CONTROLLER
        //  3 animations: walking left and right, and standing still
        player.animations.add('left', [4, 5, 6, 7], 10, true);
        player.animations.add('right', [8, 9, 10, 11], 10, true);
        player.animations.add('still', [0,1,2,3], 10, true);
        //  Player keyboard controls.
        cursors = game.input.keyboard.createCursorKeys();
        spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        // Falling blocks keyboard controls
        keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.A);
        keyRight = game.input.keyboard.addKey(Phaser.Keyboard.D);
        keyDown = game.input.keyboard.addKey(Phaser.Keyboard.S);
        keyUp = game.input.keyboard.addKey(Phaser.Keyboard.W);

        //  //ENEMIES
        // var verticalBound = game.world.height*.25 + Math.floor(Math.random() * game.world.height * .5);
        // var e1 = game.add.sprite(Math.floor(Math.random() * game.world.width), verticalBound, 'enemies');
        // game.physics.p2.enable(e1, true);
        // e1.name = 'e1';
        // e1.body.velocity[0] = 0; e1.body.velocity[1] = 0;
        // e1.body.setCollisionGroup(enemiesCollisionGroup);
        // e1.body.collides([playerCollisionGroup, platformCollisionGroup]);

        hptext =  game.add.text(16, 16, "HP: " + player.health.toString(), { fontSize: '32px', fill: '#000' });
        



        
        game.physics.p2.setPostBroadphaseCallback(checkOverlap, this);
       //create TETRIS on interval
        game.time.events.loop(Phaser.Timer.SECOND * 1,createTetris, this);
     },

    update: function() {
  
    	if (cursors.left.isDown) {
    		stucktimeLeft++;
    		if (stucktimeLeft > STUCK_THRESHOLD) { 
    			player.loadTexture('ae');
    			game.add.text(game.world.width/2, 16, "Trapped!! Game Over", { fontSize: '32px', fill: '#000' });
    			setTimeout(trapped, 2000);
    		}
		}
		if (cursors.left.isUp) {stucktimeLeft = 0;}
		if (cursors.right.isDown) {
    		stucktimeRight++;
    		if (stucktimeRight > STUCK_THRESHOLD) { 
    			player.loadTexture('ae');
    			game.add.text(game.world.width/2 , 16, "Trapped!! Game Over", { fontSize: '32px', fill: '#000' });
    			setTimeout(trapped, 2000);
    		}
		}
		if (cursors.right.isUp) {stucktimeRight = 0;}


    	//display current HP
    	hptext.text = 'HP: '+Math.round(player.health*100)/100;

        //PLAYER CONTROL
        player.body.velocity.x = 0;
        if (cursors.left.isDown)
        {	
            //  Move to the left
            player.body.velocity.x = -150;
            if (spacebar.isDown) {
            	playerSpeedUp(-speedUp);
            }
           {sWalk.play("",0,.3,false,false);}
            player.animations.play('left');
        }
        else if (cursors.right.isDown)
        {
            //  Move to the right
            player.body.velocity.x = 150;
            if (spacebar.isDown) {
            	playerSpeedUp(speedUp);
            }
            /*if (!cursors.up.isDown)*/ 
            {sWalk.play("",0,.3,false,false);}
            player.animations.play('right');
        }
        else {  player.frame = 0;	}//  Stand still 

        if (tetris != undefined) {
            //BLOCK CONTROL
            if (keyLeft.isDown) {
                tetris.body.velocity.x = -250;
            }
            if (keyRight.isDown) { 
                tetris.body.velocity.x = 250;
            }
            if (keyDown.isDown) {
                tetris.body.data.gravityScale = 3;
            }
            // consideration: should dropper allow to slow down the blocks?
            // if (keyUp.isDown & tetris.body.gravity.y > 10) {
            //     tetris.body.gravity.y = tetris.body.gravity.y - 10;
            // }
        }
    }
};


//HELPER FUNCTIONS


function checkOverlap(body1, body2) {
    var boo1 = (body1.sprite.key == 'player') || (body2.sprite.key == 'player') ;
    var boo3 = tetrises.children.indexOf(body1.sprite) > -1;
    var boo4 = tetrises.children.indexOf(body2.sprite) > -1;
    var boo5 =platforms.children.indexOf(body1.sprite) > -1;
    var boo6 =platforms.children.indexOf(body2.sprite) > -1;

    // var boo7 =enemies.children.indexOf(body1.sprite) > -1;
    // var boo8 =enemies.children.indexOf(body2.sprite) > -1;

    // if ((boo3 && boo6) || (boo4 && boo5)) { console.log(tetrisIsFalling);
        //tetrisIsFalling = false; 
       // game.time.events.loop(Phaser.Timer.SECOND * 2,createTetris, this);
    // }
    // if (boo1 && (boo7 || boo8)) {
    //     console.log("LOSE");
    //     game.add.text(30, 30, 'KENYAN lose!', { fontSize: '300px', fill: '#000' });
    //     player.loadTexture('ae');
    //     tetris.kill();
    // }
    if ((boo3|| boo4) && (boo5 || boo6 || boo3 || boo4)) {
    	//sLanding.play();
    }
    if (boo1 && (boo3 || boo4 || boo5 || boo6) ) { 
        if (cursors.up.isDown) {  
            var start = game.time.now;
            if (start - jumptime > 1000) {
                player.body.velocity.y = -450;
                sJump.play();
                jumptime = game.time.now;
            }
        }
    }
    return true;
}




// create a random tetris block
function createTetris() {
	var tetrisSprite = 'ijlostz'[Math.floor(Math.random() * 'ijlostz'.length)];
	tetris = game.add.sprite(game.world.width/2, 0, tetrisSprite);
	game.physics.p2.enable(tetris, false);
	tetris.body.clearShapes();
	tetris.body.loadPolygon('physicsData', tetrisSprite.toUpperCase());
	tetris.body.setCollisionGroup(tetrisCollisionGroup);
	tetris.body.collides([tetrisCollisionGroup, platformCollisionGroup,playerCollisionGroup]);
	tetris.body.fixedRotation = false;
	// heavify block after it lands
	game.time.events.loop(Phaser.Timer.SECOND * (0.9),
		function() {tetris.body.mass = tetrisMassOnGround;}, this);

	tetris.body.onBeginContact.add(landingSound);
	tetrises.add(tetris);
}
function landingSound(body,shape1,shape2,equation) {
    if ("ijlostz".includes(body.sprite.key) || 
    	body.sprite.key == "ground") {
    	var momentum = - body.velocity.y * body.mass;
    	if (momentum > 8000 || momentum == -0) {
    		sLanding.play("", 0,1,false,false);
    	}
	
	}

}

function reduceHP(body, shape1, shape2, equation) {
	var v = body.velocity.y;
	var m = body.mass;
	var damage = -m * v * MOMENTUM_FACTOR;
	if (damage > 0.3) {
		sHit.play();
	}
	if (m*v < 0 ) {
	player.damage(damage);
	}
}

function playerSpeedUp(speed) {
	var current = game.time.now;
    if (current - speedtime > 2000) {
		player.body.velocity.x = speed;
		sTeleport.play();
		speedtime = game.time.now;
    }


}

function trapped() {
	player.kill();
}

//START GAME @ LEVELONE
var game = new Phaser.Game(450, 600, Phaser.CANVAS, 'getRect');
game.state.add('start', levelOne, true);
game.state.start('start');