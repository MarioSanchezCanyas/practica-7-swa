var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

var player;
var platforms;
var cursors;

var gasolinaGroup;
var llavesGroup;
var fuegos;

var gasolinaCount = 0;
var llavesCount = 0;
var ronda = 1;
var repairKey;


var gasolinaText;
var llavesText;
var infoText;

var coche;
var repairing = false;
var repairTimer = 0;

var gameOver = false;

new Phaser.Game(config);

function preload() {
    this.load.image('bg', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('gasolina', 'assets/gasolina.png');
    this.load.image('llave', 'assets/llave.png');
    this.load.image('fuego', 'assets/fireball.png');
    this.load.image('coche', 'assets/car.png');
    this.load.spritesheet('player', 'assets/dude.png', {
        frameWidth: 32,
        frameHeight: 48
    });
}

function create() {
    this.add.image(400, 300, 'bg');

    // PLATAFORMAS (GRIS)
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 580, 'ground')
        .setScale(2)
        .setTint(0x888888)
        .refreshBody();

    platforms.create(600, 400, 'ground').setTint(0x888888);
    platforms.create(100, 300, 'ground').setTint(0x888888);
    platforms.create(750, 250, 'ground').setTint(0x888888);

    // COCHE
    coche = this.physics.add.staticSprite(80, 520, 'coche');

    // PLAYER
    player = this.physics.add.sprite(200, 450, 'player');
    player.setCollideWorldBounds(true);
    player.setBounce(0.1);

    // ANIMACIONES (igual)
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'idle',
        frames: [{ key: 'player', frame: 4 }],
        frameRate: 20
    });

    cursors = this.input.keyboard.createCursorKeys();

    // GRUPOS
    collectibles = this.physics.add.group();
    fuegos = this.physics.add.group();

    // UI
    gasolinaText = this.add.text(16, 16, '', { fontSize: '18px', fill: '#fff' });
    llavesText = this.add.text(16, 40, '', { fontSize: '18px', fill: '#fff' });
    infoText = this.add.text(400, 16, '', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);

    // COLISIONES
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(collectibles, platforms);
    this.physics.add.collider(fuegos, platforms);

    this.physics.add.overlap(player, collectibles, collectItem, null, this);
    this.physics.add.collider(player, fuegos, hitFire, null, this);

repairKey = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.X
);


    spawnRound(this);
}

function spawnRound(scene) {
    collectibles.clear(true, true);

    gasolinaCount = 0;
    llavesCount = 0;
    repairTimer = 0;

    coche.clearTint();

    if (ronda === 1) {
        infoText.setText('Recoge gasolina');
        spawnItems(scene, 'gasolina', 10);
    }

    if (ronda === 2) {
        infoText.setText('Recoge llaves');
        spawnItems(scene, 'llave', 10);
    }

    if (ronda === 3) {
        infoText.setText('Gasolina + Llaves y vuelve al coche');
        spawnItems(scene, 'gasolina', 5);
        spawnItems(scene, 'llave', 5);
    }

    gasolinaText.setText(`Gasolina: ${gasolinaCount}`);
    llavesText.setText(`Llaves: ${llavesCount}`);

    spawnFire(scene);
}


function spawnItems(scene, key, amount) {
    for (let i = 0; i < amount; i++) {
        let item = collectibles.create(
            12 + i * 70,
            0,
            key
        );
        item.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        item.setScale(0.5);
        item.itemType = key;
    }
}

function collectItem(player, item) {
    item.disableBody(true, true);

    if (item.itemType === 'gasolina') gasolinaCount++;
    if (item.itemType === 'llave') llavesCount++;

    gasolinaText.setText(`Gasolina: ${gasolinaCount}`);
    llavesText.setText(`Llaves: ${llavesCount}`);

    if (collectibles.countActive(true) === 0) {
        if (ronda < 3) {
            ronda++;
            spawnRound(player.scene);
        } else {
            infoText.setText('Vuelve al coche');
            coche.setTint(0x00ff00);
        }
    }
}



function update(time, delta) {
    if (gameOver) return;

    // Movimiento
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('idle');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-420);
    }

    // Reparar coche
    // Reparar coche
if (ronda === 3 && gasolinaCount >= 5 && llavesCount >= 5) {

    if (Phaser.Geom.Intersects.RectangleToRectangle(
        player.getBounds(),
        coche.getBounds()
    )) {

        infoText.setText(`Pulsa X para reparar (${Math.floor(repairTimer / 30)}%)`);

        if (repairKey.isDown) {
            repairTimer += delta / 30;

            if (repairTimer >= 100) {
                completeRepair();
            }
        } else {
            repairTimer = 0;
        }

    } else {
        infoText.setText('Vuelve al coche');
    }

}
else {
        infoText.setText('');
    }
}
function completeRepair() {
    ronda = 1;
    gasolinaCount = 0;
    llavesCount = 0;
    repairTimer = 0;

    infoText.setText('¡Coche reparado!');
    coche.clearTint();

    player.setPosition(200, 450);

    spawnRound(player.scene);
}


function spawnFire(scene) {
    let fire = fuegos.create(
        Phaser.Math.Between(100, 700),
        16,
        'fuego'
    );

    fire.setScale(0.5);
    fire.setBounce(1);
    fire.setVelocity(Phaser.Math.Between(-80, 80), 20);
    fire.setCollideWorldBounds(true);
    fire.allowGravity = false;
}

function hitFire() {
    this.physics.pause();
    player.setTint(0xff0000);
    gameOver = true;
    infoText.setText('GAME OVER');
}
