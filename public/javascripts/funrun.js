
window.onload = function(){

    var socket,
        gameover = false,
        posSync;

    var gameOverCallback = function () {
        socket.emit('arrived', {
            room: myLib.roomNum,
            username: myLib.username
        });
        clearInterval(posSync);
    };

    var gameObj = (function (){
        var playerCount = 0;
        var player = [];
        var playerArray;
        var updateplayer={};
        var sync=false;
        var map;
        player[1] = new Phaser.Signal();
        player[2] = new Phaser.Signal();
        player[3] = new Phaser.Signal();

        //var nameList=[];
        var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');
        //

        //
        var PhaserGame = function () {

            this.bg = null;
            this.trees = null;
            this.stationary = null;
            this.clouds = null;
            this.barriers= null;
            this.destination= null;
            this.prop=null;

            this.players = [];
            playerArray = this.players;
            this.playerCount = playerCount;
            //this.nameList = nameList;
            this.character = ["1","2","3","4","5"];
            this.keys = ['UP','LEFT','RIGHT','ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE'];
            this.currentPlayer = 0;

            for (var i = 0; i < this.playerCount;i++){
                var gamer = {};
                gamer.player = null;
                //gamer.name = this.nameList[i];
                gamer.facing = 'right';
                gamer.jumpTimer = 0;
                gamer.cursors={};
                gamer.locked = false;
                gamer.lockedTo = null;
                gamer.wasLocked = false;
                gamer.willJump = false;
                gamer.willwin = false;
                this.players.push(gamer);
            }

        };

        PhaserGame.prototype = {

            init: function () {

                this.game.renderer.renderSession.roundPixels = true;

                this.world.resize(640*15, 480*2);

                this.physics.startSystem(Phaser.Physics.ARCADE);

                this.physics.arcade.gravity.y = 600;

            },

            preload: function () {

                //  We need this because the assets are on Amazon S3
                //  Remove the next 2 lines if running locally
                // this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue004/';
                this.load.crossOrigin = 'anonymous';

                this.load.image('trees', '/assets/trees-h.png');
                this.load.image('background', '/assets/clouds-h.png');
                this.load.image('platform', '/assets/platform.png');
                this.load.image('platform3', '/assets/platform3.png');
                this.load.image('cloud-platform', '/assets/cloud-platform.png');
                this.load.image('ground', '/assets/ground.png');
                this.load.image('game-ground', '/assets/gameground.png');
                this.load.image('barrier', '/assets/barrier.png');
                this.load.image('destination', '/assets/destination.png');
                this.load.image('stone', '/assets/stone.png');
                this.load.image('road', '/assets/road.png');
                this.load.image('prop', '/assets/prop.png');
                this.load.image('large-barrier', '/assets/largebarrier.png');
                this.load.image('finish', '/assets/finish.png');
                this.load.spritesheet('1', '/assets/1.png', 32, 48);
                this.load.spritesheet('2', '/assets/2.png', 32, 48);
                this.load.spritesheet('3', '/assets/3.png', 32, 48);
                this.load.spritesheet('4', '/assets/4.png', 32, 48);
                this.load.spritesheet('5', '/assets/5.png', 32, 48);
                //  Note: Graphics are Copyright 2015 Photon Storm Ltd.

            },

            create: function () {

                var i;

                this.background = this.add.tileSprite(0, 0, 640, 480, 'background');
                this.background.fixedToCamera = true;

                this.trees = this.add.tileSprite(0, 364, 640, 116, 'trees');
                this.trees.fixedToCamera = true;



                if (map==0){
                    this.barriers = this.add.physicsGroup();
                    this.stationary = this.add.physicsGroup();
                    this.destination = this.add.physicsGroup();
                    this.prop = this.add.physicsGroup();

                    var groundGroup = [];
                    for (var i = 0; i < 20;i++ ){
                        groundGroup[i] = this.stationary.create(i*952, game.world.height - 64, 'game-ground');
                        groundGroup[i].body.immovable = true;
                        groundGroup[i].body.allowGravity = false;

                        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
                        groundGroup[i].scale.setTo(4, 1);
                    }
                    var barrier1 = this.stationary.create(1000, game.world.height - 150, 'barrier');
                    barrier1.body.immovable = true;
                    barrier1.body.allowGravity = false;
                    barrier1.scale.setTo(1, 2);

                    var barrier2 = this.stationary.create(1500, game.world.height - 250, 'barrier');
                    barrier2.body.immovable = true;
                    barrier2.body.allowGravity = false;
                    barrier2.scale.setTo(1,2);

                    var barrier3 = this.stationary.create(2500, game.world.height - 150, 'barrier');
                    barrier3.body.immovable = true;
                    barrier3.body.allowGravity = false;
                    barrier3.scale.setTo(1, 2);

                    var road1 = this.stationary.create(2800, game.world.height - 190, 'road');
                    road1.body.immovable = true;
                    road1.body.allowGravity = false;
                    road1.scale.setTo(1,1);

                    var road2 = this.stationary.create(3150, game.world.height - 280, 'road');
                    road2.body.immovable = true;
                    road2.body.allowGravity = false;
                    road2.scale.setTo(1,1);

                    var road3 = this.stationary.create(3500, game.world.height - 370, 'road');
                    road3.body.immovable = true;
                    road3.body.allowGravity = false;
                    road3.scale.setTo(1,1);

                    var road2 = this.stationary.create(3850, game.world.height - 460, 'road');
                    road2.body.immovable = true;
                    road2.body.allowGravity = false;
                    road2.scale.setTo(1,1);

                    var barrier4 = this.stationary.create(3600, game.world.height - 150, 'barrier');
                    barrier4.body.immovable = true;
                    barrier4.body.allowGravity = false;
                    barrier4.scale.setTo(1, 2);

                    var barrier5 = this.stationary.create(3800, game.world.height - 250, 'barrier');
                    barrier5.body.immovable = true;
                    barrier5.body.allowGravity = false;
                    barrier5.scale.setTo(1, 2);

                    var barrier6 = this.stationary.create(4000, game.world.height - 250, 'barrier');
                    barrier6.body.immovable = true;
                    barrier6.body.allowGravity = false;
                    barrier6.scale.setTo(1, 2);

                    var barrier7 = this.stationary.create(4000, game.world.height - 350, 'barrier');
                    barrier7.body.immovable = true;
                    barrier7.body.allowGravity = false;
                    barrier7.scale.setTo(1, 2);

                    var barrier8 = this.stationary.create(4220, game.world.height - 250, 'barrier');
                    barrier8.body.immovable = true;
                    barrier8.body.allowGravity = false;
                    barrier8.scale.setTo(1, 2);

                    var road3 = this.stationary.create(4620, game.world.height - 300, 'road');
                    road3.body.immovable = true;
                    road3.body.allowGravity = false;
                    road3.scale.setTo(1,1);

                    var road4 = this.stationary.create(5000, game.world.height - 400, 'road');
                    road4.body.immovable = true;
                    road4.body.allowGravity = false;
                    road4.scale.setTo(1,1);

                    var road5 = this.stationary.create(5500, game.world.height - 300, 'road');
                    road5.body.immovable = true;
                    road5.body.allowGravity = false;
                    road5.scale.setTo(1,1);

                    var barrier9 = this.stationary.create(5850, game.world.height - 250, 'barrier');
                    barrier9.body.immovable = true;
                    barrier9.body.allowGravity = false;
                    barrier9.scale.setTo(1, 2);

                    var barrier9 = this.stationary.create(6350, game.world.height - 250, 'barrier');
                    barrier9.body.immovable = true;
                    barrier9.body.allowGravity = false;
                    barrier9.scale.setTo(1, 2);


                    var barrier10 = this.stationary.create(6750, game.world.height - 950, 'large-barrier');
                    barrier10.body.immovable = true;
                    barrier10.body.allowGravity = false;
                    barrier10.scale.setTo(5, 3);

                    var stone = this.stationary.create(7050, game.world.height - 130, 'stone');
                    stone.body.immovable = true;
                    stone.body.allowGravity = false;
                    stone.scale.setTo(3, 1);

                    var barrier11 = this.stationary.create(8500, game.world.height - 700, 'large-barrier');
                    barrier11.body.immovable = true;
                    barrier11.body.allowGravity = false;
                    barrier11.scale.setTo(5, 3);

                    var destination = this.destination.create(9000, game.world.height - 706, 'finish');
                    destination.body.immovable = true;
                    destination.body.allowGravity = false;
                    destination.scale.setTo(1, 1);

                    var prop1 = this.prop.create(1250, game.world.height - 200, 'prop');
                    prop1.body.immovable = true;
                    prop1.body.allowGravity = false;
                    prop1.scale.setTo(1, 1);


                    var prop3 = this.prop.create(5600, game.world.height - 330, 'prop');
                    prop3.body.immovable = true;
                    prop3.body.allowGravity = false;
                    prop3.scale.setTo(1, 1);

                    var prop3 = this.prop.create(6700, game.world.height - 500, 'prop');
                    prop3.body.immovable = true;
                    prop3.body.allowGravity = false;
                    prop3.scale.setTo(1, 1);
                    //destination


                    //here is the end of map


                    //this.stationary.create(0, 580, 'platform');

                    this.stationary.setAll('body.allowGravity', false);
                    this.stationary.setAll('body.immovable', true);

                    //  Platforms that move
                    this.clouds = this.add.physicsGroup();
                    this.barriers=this.add.physicsGroup();
                }
                else if (map==1){
                    this.barriers = this.add.physicsGroup();
                    this.stationary = this.add.physicsGroup();
                    this.destination = this.add.physicsGroup();
                    this.prop = this.add.physicsGroup();

                    var ground = this.stationary.create(0, game.world.height - 64, 'ground');
                    ground.body.immovable = true;
                    ground.body.allowGravity = false;

                    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
                    ground.scale.setTo(5, 2);

                    var ground1 = this.stationary.create(2125, game.world.height - 64, 'ground');
                    ground1.body.immovable = true;
                    ground1.body.allowGravity = false;

                    ground1.scale.setTo(15, 2);

                    var ground3 = this.stationary.create(5200, game.world.height - 64, 'ground');
                    ground3.body.immovable = true;
                    ground3.body.allowGravity = false;

                    ground3.scale.setTo(21, 2);
                    // here is the start of map
                    var barrier1 = this.stationary.create(1000, game.world.height - 100, 'barrier');
                    barrier1.body.immovable = true;
                    barrier1.body.allowGravity = false;
                    barrier1.scale.setTo(1, 2);

                    var barrier2 = this.stationary.create(2450/2, game.world.height - 150, 'barrier');
                    barrier2.body.immovable = true;
                    barrier2.body.allowGravity = false;
                    barrier2.scale.setTo(1,2);

                    var barrier3 = this.stationary.create(2900/2, game.world.height - 200, 'barrier');
                    barrier3.body.immovable = true;
                    barrier3.body.allowGravity = false;
                    barrier3.scale.setTo(1, 2);

                    var barrier4 = this.stationary.create(3350/2, game.world.height - 250, 'barrier');
                    barrier4.body.immovable = true;
                    barrier4.body.allowGravity = false;
                    barrier4.scale.setTo(1, 2);

                    var barrier5 = this.stationary.create(1900, game.world.height - 300, 'barrier');
                    barrier5.body.immovable = true;
                    barrier5.body.allowGravity = false;
                    barrier5.scale.setTo(1, 3);

                    var barrier5 = this.stationary.create(2200, game.world.height - 580, 'barrier');
                    barrier5.body.immovable = true;
                    barrier5.body.allowGravity = false;
                    barrier5.scale.setTo(3, 3);

                    var barrier6 = this.stationary.create(4800, game.world.height - 680, 'barrier');
                    barrier6.body.immovable = true;
                    barrier6.body.allowGravity = false;
                    barrier6.scale.setTo(3, 6);

                    var barrier6 = this.stationary.create(3200, game.world.height - 350, 'barrier');
                    barrier6.body.immovable = true;
                    barrier6.body.allowGravity = false;
                    barrier6.scale.setTo(1.3, 4);

                    var barrier7 = this.stationary.create(3600, game.world.height - 500, 'barrier');
                    barrier7.body.immovable = true;
                    barrier7.body.allowGravity = false;
                    barrier7.scale.setTo(1.5, 4);

                    var barrier7 = this.stationary.create(3600, game.world.height - 500, 'barrier');
                    barrier7.body.immovable = true;
                    barrier7.body.allowGravity = false;
                    barrier7.scale.setTo(1.5, 4);

                    var stone1 = this.stationary.create(2400, game.world.height - 134, 'stone');
                    stone1.body.immovable = true;
                    stone1.body.allowGravity = false;
                    stone1.scale.setTo(1, 1);

                    var stone2 = this.stationary.create(2600, game.world.height - 194, 'stone');
                    stone2.body.immovable = true;
                    stone2.body.allowGravity = false;
                    stone2.scale.setTo(1, 1);

                    var stone3 = this.stationary.create(2750, game.world.height - 134, 'stone');
                    stone3.body.immovable = true;
                    stone3.body.allowGravity = false;
                    stone3.scale.setTo(2, 1);

                    var road1 = this.stationary.create(6100, game.world.height - 300, 'road');
                    road1.body.immovable = false;
                    road1.body.allowGravity = false;
                    road1.scale.setTo(3, 1);



                    this.stationary.create(3100, game.world.height - 650, 'platform');
                    this.stationary.create(3550, game.world.height - 700, 'platform');
                    this.stationary.create(4100, game.world.height - 630, 'platform');
                    this.stationary.create(4500, game.world.height - 680, 'platform');

                    var prop1 = this.prop.create(6000, game.world.height - 500, 'prop');
                    prop1.body.immovable = true;
                    prop1.body.allowGravity = false;
                    prop1.scale.setTo(1, 1);


                    //destination
                    var destination = this.destination.create(9000, game.world.height - 64, 'destination');
                    destination.body.immovable = true;
                    destination.body.allowGravity = false;
                    destination.scale.setTo(7, 2);

                    //here is the end of map


                    //this.stationary.create(0, 580, 'platform');

                    this.stationary.setAll('body.allowGravity', false);
                    this.stationary.setAll('body.immovable', true);

                    //  Platforms that move
                    this.clouds = this.add.physicsGroup();
                    this.barriers=this.add.physicsGroup();


                    var barrier8 = this.stationary.create(7500, game.world.height - 150, 'barrier');
                    barrier8.body.immovable = true;
                    barrier8.body.allowGravity = false;
                    barrier8.scale.setTo(1, 2);


                    var barrier9 = this.stationary.create(7700, game.world.height - 250, 'barrier');
                    barrier9.body.immovable = true;
                    barrier9.body.allowGravity = false;
                    barrier9.scale.setTo(1, 2);

                    var cloud1 = new CloudPlatform(this.game, 8000, 500, 'cloud-platform', this.clouds);
                    cloud1.addMotionPath([
                        { x: "+0", xSpeed: 2000, xEase: "Linear", y: "+200", ySpeed: 2000, yEase: "Sine.easeIn" },
                        { x: "-0", xSpeed: 2000, xEase: "Linear", y: "-200", ySpeed: 2000, yEase: "Sine.easeOut" }
                    ]);
                }
                /* var cloud1 = new CloudPlatform(this.game, 300, 450, 'cloud-platform', this.clouds);

                 cloud1.addMotionPath([
                 { x: "+200", xSpeed: 2000, xEase: "Linear", y: "-200", ySpeed: 2000, yEase: "Sine.easeIn" },
                 { x: "-200", xSpeed: 2000, xEase: "Linear", y: "-200", ySpeed: 2000, yEase: "Sine.easeOut" },
                 { x: "-200", xSpeed: 2000, xEase: "Linear", y: "+200", ySpeed: 2000, yEase: "Sine.easeIn" },
                 { x: "+200", xSpeed: 2000, xEase: "Linear", y: "+200", ySpeed: 2000, yEase: "Sine.easeOut" }
                 ]);*/

                /*var barrier1 = new Barrier(this.game, 400, 0, 'platform3', this.barriers);

                 barrier1.addMotionPath([
                 { x: "+0", xSpeed: 2000, xEase: "Linear", y: "+100", ySpeed: 2000, yEase: "Sine.easeIn" },
                 { x: "-0", xSpeed: 2000, xEase: "Linear", y: "-100", ySpeed: 2000, yEase: "Sine.easeOut" }
                 ]);*/

                //var cloud3 = new CloudPlatform(this.game, 1300, 290, 'cloud-platform', this.clouds);

                /*cloud3.addMotionPath([
                 { x: "+500", xSpeed: 4000, xEase: "Expo.easeIn", y: "-200", ySpeed: 3000, yEase: "Linear" },
                 { x: "-500", xSpeed: 4000, xEase: "Expo.easeOut", y: "+200", ySpeed: 3000, yEase: "Linear" }
                 ]);*/

                /* cloud3.addMotionPath([
                 { x: "+0", xSpeed: 2000, xEase: "Linear", y: "+300", ySpeed: 2000, yEase: "Sine.easeIn" },
                 { x: "-0", xSpeed: 2000, xEase: "Linear", y: "-300", ySpeed: 2000, yEase: "Sine.easeOut" }
                 ]);*/

                //  The Player
                for(i = 0; i < this.playerCount;i++){
                    this.players[i].player = this.add.sprite(20,game.world.height - 115, this.character[i]);

                    this.physics.arcade.enable(this.players[i].player);

                    this.players[i].player.body.collideWorldBounds = true;
                    this.players[i].player.body.setSize(20, 32, 5, 16);

                    this.players[i].player.animations.add('left', [4,5,6,7], 16, true);
                    //this.players[i].player.add('turn', [4], 20, true);
                    this.players[i].player.animations.add('right', [8,9,10,11], 10, true);
                    this.players[i].player.body.normalVelocity =350;
                    if (i!=0){
                        this.players[i].cursors.up = {};
                        this.players[i].cursors.up.isDown=false;
                        var save = this;
                        player[i].add(function(){
                            var cnt=i;
                            return function(){
                                save.players[cnt].cursors.up.isDown=true;
                                setTimeout(function(){save.players[cnt].cursors.up.isDown=false;}, 200);
                            }
                        }(),this);
                        this.players[i].cursors.left = this.input.keyboard.addKey(Phaser.Keyboard[this.keys[i*3+1]]);
                        this.players[i].cursors.right = this.input.keyboard.addKey(Phaser.Keyboard[this.keys[i*3+2]]);
                    }

                    // key bindings

                }
                this.players[0].cursors.up = this.input.keyboard.addKey(Phaser.Keyboard[this.keys[0]]);
                this.players[0].cursors.left = this.input.keyboard.addKey(Phaser.Keyboard[this.keys[1]]);
                this.players[0].cursors.right = this.input.keyboard.addKey(Phaser.Keyboard[this.keys[2]]);
                //follow the first player in the array
                this.camera.follow(this.players[0].player);


                this.clouds.callAll('start');

            },

            customSep: function (player, platform) {

                if (!this.locked && player.body.velocity.y > 0)
                {
                    this.locked = true;
                    this.lockedTo = platform;
                    platform.playerLocked = true;

                    player.body.velocity.y = 0;
                }

            },

            checkLock: function () {
                for (var i=0; i < this.playerCount;i++){
                    this.players[i].player.body.velocity.y = 0;

                    //  If the player has walked off either side of the platform then they're no longer locked to it
                    if (this.players[i].player.body.right < this.players[i].lockedTo.body.x || this.players[i].player.body.x > this.players[i].lockedTo.body.right)
                    {
                        this.players[i].wasLocked = true;
                        this.players[i].locked = false;
                    }


                }
            },

            win: function(){
                this.willwin = true;
            },

            preRender: function () {

                if (this.game.paused)
                {
                    //  Because preRender still runs even if your game pauses!
                    return;
                }

                for (var i=0; i < this.playerCount;i++){
                    if (this.players[i].locked || this.players[i].wasLocked)
                    {
                        this.players[i].player.x += this.players[i].lockedTo.deltaX;
                        this.players[i].player.y = this.players[i].lockedTo.y - 48;

                        if (this.players[i].player.body.velocity.x !== 0)
                        {
                            this.players[i].player.body.velocity.y = 0;
                        }
                    }

                    if (this.players[i].willJump)
                    {
                        this.players[i].willJump = false;

                        if (this.players[i].lockedTo && this.players[i].lockedTo.deltaY < 0 && this.players[i].wasLocked)
                        {
                            //  If the platform is moving up we add its velocity to the players jump
                            this.players[i].player.body.velocity.y = -400 + (this.players[i].lockedTo.deltaY * 10);
                        }
                        else
                        {
                            this.players[i].player.body.velocity.y = -400;
                        }

                        this.players[i].jumpTimer = this.time.time + 750;
                    }

                    if (this.players[i].wasLocked)
                    {
                        this.players[i].wasLocked = false;
                        this.players[i].lockedTo.playerLocked = false;
                        this.players[i].lockedTo = null;
                    }
                }
            },

            update: function () {

                this.background.tilePosition.x = -(this.camera.x * 0.7);
                this.trees.tilePosition.x = -(this.camera.x * 0.9);
                for (var i=0; i < this.playerCount;i++){
                    this.physics.arcade.collide(this.players[i].player, this.stationary);
                    this.physics.arcade.collide(this.players[i].player, this.barriers);
                    this.physics.arcade.collide(this.players[i].player, this.clouds, this.customSep, null, this.players[i]);
                    this.physics.arcade.collide(this.players[i].player, this.destination, this.win, null, this.players[i]);

                    //  Do this AFTER the collide check, or we won't have blocked/touching set
                    var standing = this.players[i].player.body.blocked.down || this.players[i].player.body.touching.down || this.players[i].locked||this.players[i].player.body.touching.right||this.players[i].player.body.touching.left;
                    var win ;
                    this.players[i].player.body.acceleration.x = 100;
                    this.players[i].player.animations.play('right');

                    if(sync)  {
                        playerArray[1].player.x=updateplayer.x;
                        playerArray[1].player.y=updateplayer.y;
                        sync=false;

                    }

                    this.players[i].player.body.maxVelocity.x = this.players[i].player.body.normalVelocity;
                    if(this.players[i].willwin){
                        this.players[i].player.body.velocity.x = 0;
                        if (!gameover) {
                            gameOverCallback();
                            gameover = true;
                        }
                        this.players[i].willwin = false;
                    }

                    // if (this.players[i].cursors.left.isDown)
                    // {
                    //     this.players[i].player.body.velocity.x = -500;

                    //     if (this.players[i].facing !== 'left')
                    //     {
                    //         this.players[i].player.play('left');
                    //         this.players[i].facing = 'left';
                    //     }
                    // }
                    // else
                    if (this.players[i].cursors.right.isDown)
                    {

                    }
                    else
                    {
                        if (this.players[i].facing !== 'idle')
                        {
                            this.players[i].player.animations.stop();

                            if (this.players[i].facing === 'left')
                            {
                                this.players[i].player.frame = 0;
                            }
                            else
                            {
                                this.players[i].player.frame = 5;
                            }

                            this.players[i].facing = 'idle';
                        }
                    }

                    if (standing && this.players[i].cursors.up.isDown && this.time.time > this.players[i].jumpTimer)
                    {
                        if (this.players[i].locked)
                        {
                            this.players[i].wasLocked = true;
                            this.players[i].locked = false;
                        }

                        this.players[i].willJump = true;
                    }

                    if (this.players[i].locked)
                    {
                        this.players[i].player.body.velocity.y = 0;
                        if (this.players[i].player.body.right < this.players[i].lockedTo.body.x || this.players[i].player.body.x > this.players[i].lockedTo.body.right)
                        {
                            this.players[i].wasLocked = true;
                            this.players[i].locked = false;
                        }
                    }
                }


            }

        };

        Barrier=function(game,x,y,key,group){
            if (typeof group === 'undefined') { group = game.world; }
            Phaser.Sprite.call(this, game, x, y, key);

            game.physics.arcade.enable(this);

            this.body.allowGravity = false;
            this.body.immovable = true;
            group.add(this);

        };

        CloudPlatform = function (game, x, y, key, group) {

            if (typeof group === 'undefined') { group = game.world; }

            Phaser.Sprite.call(this, game, x, y, key);

            game.physics.arcade.enable(this);

            this.anchor.x = 0.5;

            this.body.customSeparateX = true;
            this.body.customSeparateY = true;
            this.body.allowGravity = false;
            this.body.immovable = true;

            this.playerLocked = false;

            group.add(this);

        };

        CloudPlatform.prototype = Object.create(Phaser.Sprite.prototype);
        CloudPlatform.prototype.constructor = CloudPlatform;

        CloudPlatform.prototype.addMotionPath = function (motionPath) {

            this.tweenX = this.game.add.tween(this.body);
            this.tweenY = this.game.add.tween(this.body);

            //  motionPath is an array containing objects with this structure
            //  [
            //   { x: "+200", xSpeed: 2000, xEase: "Linear", y: "-200", ySpeed: 2000, yEase: "Sine.easeIn" }
            //  ]

            for (var i = 0; i < motionPath.length; i++)
            {
                this.tweenX.to( { x: motionPath[i].x }, motionPath[i].xSpeed, motionPath[i].xEase);
                this.tweenY.to( { y: motionPath[i].y }, motionPath[i].ySpeed, motionPath[i].yEase);
            }

            this.tweenX.loop();
            this.tweenY.loop();

        };

        CloudPlatform.prototype.start = function () {

            this.tweenX.start();
            this.tweenY.start();

        };

        CloudPlatform.prototype.stop = function () {

            this.tweenX.stop();
            this.tweenY.stop();

        };

        //game.state.add('Game', PhaserGame, true);
        return {
            playerCount: function(num){
                playerCount = num;
            },
            keyPress: function(){
                player[1].dispatch();
            },
            start : function(){
                game.state.add('Game', PhaserGame, true);
            },
            mapSelect: function(num){
                map = num;
            },
            getPosition: function(){
                return {
                    x: playerArray[0].player.x,
                    y: playerArray[0].player.y
                }

            },
            reset: function(){
                playerArray[0].player.x = 0;
                playerArray[1].player.x = 0;
                game.state.restart(true, true);
            },
            setPosition: function(secondPlayer){
                updateplayer.x=secondPlayer.x;
                updateplayer.y=secondPlayer.y;
                sync = true;
            }
        }
    })();

    var myLib = (function(){

        var qrid = "qrcode",
            curURL = window.location.href,
            roomNum = /^.*\/(.*)$/.exec(window.location.href)[1],
            userName = $("#username").text();

        return {
            roomNum: roomNum,
            username: userName,
            el : function(id, rg){
                var range = rg || document;
                return range.getElementById(id);
            },
            qs : function(selector, rg){
                var range = rg || document;
                return range.querySelector(selector);
            },
            qsa : function(selector, rg){
                var range = rg || document;
                return range.querySelectorAll(selector);
            },
            createNode : function(tag, child, attrs){
                var outerTag = document.createElement(tag);
                var content;
                if (typeof child === "string"){
                    content = document.createTextNode(child);
                    outerTag.appendChild(content);
                }
                else {
                    if (child instanceof Array){
                        for (var _index in child) {
                            var index = parseInt(_index);
                            if (isNaN(_index)) continue;
                            content = child[index];
                            if (typeof content === "string") {
                                content = document.createTextNode(content);
                            }
                            else if (typeof content === "function")
                                continue;
                            outerTag.appendChild(content);
                        }
                    }
                    else{
                        outerTag.appendChild(child);
                    }
                }

                for (var key in attrs) {
                    outerTag.setAttribute(key, attrs[key]);
                }
                return outerTag;
            },
            createQRcode : function(){
                myLib.el(qrid).src = "https://chart.googleapis.com/chart?cht=qr&chs=500x500&chl=" + encodeURIComponent(curURL);
            },
            getCurrentUsers : function() {

            },
            createNewUser: function(user){
                var html = "";
                html += '<li role="presentation" class="active">';
                html += '<h3><span class="label label-default pull-left player-name">' + user + '</span>';
                html += '<button class="btn btn-success pull-right btn-sm" type="button">';
                html += '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Friend </button></h3></li>';
                return $(html);
            }
        };
    })();

    var msg = Messenger();
    var firstPlay = true;

    (function (){

        socket = io();
        socket.on("newClient", function(newUser){
            if ($(".player-name").text().indexOf(newUser) != -1 || newUser == myLib.username) return;

            $("#players").append(myLib.createNewUser(newUser));
            msg.post({
                message: "User " + newUser + " comes in !",
                hideAfter: 10,
                hideOnNavigate: true
            });
        });

        addEventListener('keyup', function(event) {
            if (event.keyCode == 38 || event.keyCode == 87) {
                socket.emit("jump", {
                    room: myLib.roomNum,
                    username: myLib.username
                });
            }
            event.stopPropagation();
        });

        socket.on("onJump", function(data){
            setTimeout(gameObj.keyPress(), 1000);
        });

        socket.on("exitClient", function(newUser){
            $("li:contains(" + newUser.trim() + ")").remove();
            msg.post({
                message: "User " + newUser + " exit !",
                hideAfter: 10,
                hideOnNavigate: true
            });
        });

        socket.on("backToMe", function(){
            msg.post({
                message: "You will be directed to Me page in 5 seconds !",
                hideAfter: 5,
                hideOnNavigate: true
            });
            setTimeout(function(){
                window.location.href = "/room/exit/" + myLib.roomNum;
            }, 5000);
        });

        socket.on("newReady", function(newUser){
            msg.post({
                message: "User " + newUser + " is ready !",
                hideAfter: 10,
                hideOnNavigate: true
            });
        });

        socket.on("start", function(roomInfo){
            var counter = $('#seconds'),
                timer;

            msg.post({
                message: "Game Start!",
                hideAfter: 10,
                hideOnNavigate: true
            });
            gameObj.playerCount(roomInfo.userNum);
            console.log($("#mapName").text());
            gameObj.mapSelect(parseInt($("#mapName").text().split(' ')[1]) - 1);
            $('#myModal').modal("show");
            (function countDown() {
                var result = parseInt(counter.text());
                if (result == 0) {
                    $('#myModal').modal("hide");
                    $("#readyButton").button('reset');
                    if (firstPlay) {
                        counter.text(5);
                        gameObj.start();
                        firstPlay = false;
                    }
                    posSync = setInterval(function () {
                        socket.emit("posSync", {
                            room: myLib.roomNum,
                            pos: gameObj.getPosition(),
                            userName: myLib.username
                        });
                    }, 10);
                }
                else {
                    result--;
                    counter.text(result);
                    setTimeout(countDown, 1000);
                }
            })();
    });

    $("#readyButton").on('click', function () {
        var $btn = $(this).button('loading');
        msg.post({
            message: "You are ready !",
            hideAfter: 10,
            hideOnNavigate: true
        });
        socket.emit("ready", {
            room: myLib.roomNum,
            username: myLib.username
        });
    });

    socket.emit("join", {
        room: myLib.roomNum,
        username: myLib.username
    });

    socket.on("gameOver", function(data){
        var scoreSummary;
        if (myLib.username == data.winner) {
            scoreSummary = "You have won 20 points!"
        }
        else {
            scoreSummary = "You have lost 20 points!"
        }
        msg.post({
            message: "Game End! The winner is " + data.winner + ", " + scoreSummary,
            hideAfter: 10,
            hideOnNavigate: true
        });
    });

    socket.on("posSync", function(data) {
        console.log(data);
        gameObj.setPosition(data);
    });

    $('#exit').on('click', function(event){
        socket.emit('exit', {
            room: myLib.roomNum,
            username: myLib.username
        });
        return true;
    });

    return {
        init : function () {
            myLib.createQRcode();
            myLib.el('exit').setAttribute("href", "/room/exit/" + myLib.roomNum);
        }
    };
    })().init();
};

