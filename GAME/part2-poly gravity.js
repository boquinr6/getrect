var player;
var platforms;
var cursors;
var tetris;
var stars;
var score = 0;
var scoreText;

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
        game.load.image('enemies', 'assets/firstaid.png');
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
    },
    
    create: function() {
       //SYSTEM SETTING
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = 850;
        game.physics.p2.world.defaultContactMaterial.friction = 0.3;
        game.physics.p2.restitution = 0.2; //bouncing
        //DOESNT WORK game.physics.p2.world.setGlobalStiffness(1e5);
        // Three different collision groups
        var platformCollisionGroup = game.physics.p2.createCollisionGroup();
        var playerCollisionGroup = game.physics.p2.createCollisionGroup();
        var tetrisCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physics.p2.updateBoundsCollisionGroup(); // make sure object with their own collisiongroup still collide with world bounds
        //  A simple background for our game
        game.add.sprite(0, 0, 'sky');


        //PLATFORMS
        platforms = game.add.group();
        //platforms.enableBody = true; // enable physics for any object that is created in this group
        //platforms.physicsBodyType = Phaser.Physics.P2JS;
        var ground = game.add.sprite(0,game.world.height,'ground');
        ground.scale.setTo(4,2); //scale the original size 200x32 to fit width of screen
        game.physics.p2.enable(ground, true);
        ground.body.setCollisionGroup(platformCollisionGroup);
        ground.body.kinematic = true; //  the body will not be effected by physics such as gravity and collisions; Stop ground from falling away when you jump on it
        ground.body.collides([tetrisCollisionGroup, playerCollisionGroup]);
        platforms.add(ground);

        //TETRISES
        tetrises = game.add.group();
        //  Create 12 of tetrises evenly spaced apart
        for (var i = 0; i < 12; i++) {
            var tetrisSprite = 'ijlostz'[Math.floor(Math.random() * 'ijlostz'.length)];
            tetris = game.add.sprite(Math.floor(Math.random() * 300),0,tetrisSprite);
            game.physics.p2.enable(tetris, true);
            tetris.body.clearShapes();
            tetris.body.loadPolygon('physicsData', tetrisSprite.toUpperCase());
            tetris.body.setCollisionGroup(tetrisCollisionGroup);
            tetris.body.collides([tetrisCollisionGroup, platformCollisionGroup,playerCollisionGroup]);
            tetrises.add(tetris);
        }

        //PLAYER
        player = game.add.sprite(32, game.world.height - 500, 'player');
        game.physics.p2.enable(player, true);
        player.body.fixedRotation = true; // no rotation on player
        player.body.setCollisionGroup(playerCollisionGroup);
        player.body.collides([tetrisCollisionGroup, platformCollisionGroup]);

        //ANIMATION AND CONTROLLER
        //  3 animations: walking left and right, and standing still
        player.animations.add('left', [4, 5, 6, 7], 10, true);
        player.animations.add('right', [8, 9, 10, 11], 10, true);
        player.animations.add('still', [0,1,2,3], 10, true);
        //  Player keyboard controls.
        cursors = game.input.keyboard.createCursorKeys();
        // Falling blocks keyboard controls
        keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.A);
        keyRight = game.input.keyboard.addKey(Phaser.Keyboard.D);
        keyDown = game.input.keyboard.addKey(Phaser.Keyboard.S);
        keyUp = game.input.keyboard.addKey(Phaser.Keyboard.W);

         
        //  The score
        scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        //  Our controls.
        cursors = game.input.keyboard.createCursorKeys();
        
        game.physics.p2.setPostBroadphaseCallback(checkOverlap, this);
    },

    update: function() {

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        //  Reset the players velocity (movement)
        player.body.velocity.x = 0;

        if (cursors.left.isDown)
        {
            //  Move to the left
            player.body.velocity.x = -150;
            player.animations.play('left');
        }
        else if (cursors.right.isDown)
        {
            //  Move to the right
            player.body.velocity.x = 150;
            player.animations.play('right');
        }
        else
        {
            //  Stand still
            player.animations.stop();
            player.frame = 4;
        }
    }
}
    
function checkOverlap(body1, body2) {
    var boo1 = (body1.sprite.key == 'player') || (body2.sprite.key == 'player') ;
    var boo4 = tetrises.children.indexOf(body1.sprite) > -1;
    var boo3 = tetrises.children.indexOf(body2.sprite) > -1;
    var boo6 =platforms.children.indexOf(body1.sprite) > -1;
    var boo5 =platforms.children.indexOf(body2.sprite) > -1;
    if (boo1 && (boo3 || boo4 || boo5 || boo6) ) { 
        if (cursors.up.isDown) {  player.body.velocity.y = -350; }
    }
    return true;
}

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'getRect');
game.state.add('start', levelOne, true);
game.state.start('start');