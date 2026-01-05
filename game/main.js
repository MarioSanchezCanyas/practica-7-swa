var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 100 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};
var requiredGasolina = 5;
var requiredLlaves = 5;

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

var fireSpeed = 160;
var fireCount = 1;
var roundsCompleted = 0;

var highScore = 0;
var highScoreText;
var roundText;

var cascoUnlocked = false;
var cascoText;

var blockedPipe = null;

var restartKey;

var pipes = [];

var gameOver = false;

new Phaser.Game(config);

function preload() {
    this.load.image('bg', 'assets/sky.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('platforms', 'assets/platform.png');
    this.load.image('gasolina', 'assets/gasolina.png');
    this.load.image('llave', 'assets/llave.png');
    this.load.image('casco', 'assets/premio.png');
    this.load.image('fuego', 'assets/fireball.png');
    this.load.image('coche', 'assets/car.png');
    this.load.spritesheet('player', 'assets/dude2.png', {
        frameWidth: 44.4,
        frameHeight: 67
    });
    this.load.image('pipe', 'assets/pipe.png');

}

function create() {
// Cargar récord guardado
const savedHighScore = localStorage.getItem('delta_highscore');
if (savedHighScore !== null) {
    highScore = parseInt(savedHighScore);
}

    this.add.image(400, 300, 'bg');

    // PLATAFORMAS (GRIS)
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 580, 'ground')
        .setScale(2)
        .setTint(0xCD7F32)
        .refreshBody();

    platforms.create(600, 400, 'platforms').setTint(0x777777);
    platforms.create(100, 300, 'platforms').setTint(0x777777);
    platforms.create(750, 250, 'platforms').setTint(0x777777);

    // COCHE
    coche = this.physics.add.staticSprite(660, 503, 'coche');

    // PLAYER
    player = this.physics.add.sprite(200, 450, 'player');
    player.body.setGravityY(350);

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
    


pipes = [];

const pipeY =0;
const pipeXPositions = Phaser.Utils.Array.NumberArrayStep(165, 700, 120);

pipeXPositions.forEach(x => {
    let pipe = this.add.image(x, pipeY, 'pipe');
    pipe.setOrigin(0.5, 0);
    pipe.setDepth(10);
    pipes.push(pipe);
    
});

restartKey = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.R
);

    cursors = this.input.keyboard.createCursorKeys();

    // GRUPOS
    collectibles = this.physics.add.group();
    fuegos = this.physics.add.group();

    // UI
gasolinaText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#ffffffaa',
    padding: { x: 8, y: 4 }
}).setDepth(1000);

llavesText = this.add.text(16, 44, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#ffffffaa',
    padding: { x: 8, y: 4 }
}).setDepth(1000);

infoText = this.add.text(400, 16, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#ffffffaa',
    padding: { x: 10, y: 4 }
}).setOrigin(0.5).setDepth(1000);

highScoreText = this.add.text(780, 16, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#ffffffaa',
    padding: { x: 8, y: 4 }
}).setOrigin(1, 0)
.setDepth(1000);
cascoText = this.add.text(400, 80, '', {
    fontSize: '20px',
    fill: '#000',
    backgroundColor: '#ffffffdd',
    padding: { x: 12, y: 6 }
})
.setOrigin(0.5)
.setDepth(2000)
.setAlpha(0);

roundText = this.add.text(620, 16, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#ffffffaa',
    padding: { x: 8, y: 4 }
})
.setOrigin(1, 0)
.setDepth(1000);


    // COLISIONES
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(collectibles, platforms);
    this.physics.add.collider(fuegos, platforms);

    this.physics.add.overlap(player, collectibles, collectItem, null, this);
    this.physics.add.collider(player, fuegos, hitFire, null, this);

repairKey = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.X
);

    spawnFire(this);
    spawnRound(this);
}

function spawnCasco(scene) {

    blockedPipe = Phaser.Utils.Array.GetRandom(pipes);

    let casco = collectibles.create(
        blockedPipe.x,
        blockedPipe.y + blockedPipe.displayHeight,
        'casco'
    );

    casco.setScale(0.6);
    casco.setBounce(0.5);
    casco.itemType = 'casco';
    casco.setDepth(5);
}



function spawnRound(scene) {
blockedPipe = null;

    collectibles.clear(true, true);
    repairTimer = 0;

    coche.clearTint();

    infoText.setText(
        `Recoge objetos`
    );

// 🎁 CASCO SOLO EN RONDA 3
if (roundsCompleted === 2 && !cascoUnlocked) {
    spawnCasco(scene);
}

    spawnItemsFromPipes(scene, ['gasolina', 'llave'], 6);

    updateHUD();
}


function spawnItemsFromPipes(scene, possibleItems, amount) {

    let availablePipes = [...pipes];

    // ❌ Quitar la tubería del casco
    if (blockedPipe) {
        availablePipes = availablePipes.filter(p => p !== blockedPipe);
    }

    Phaser.Utils.Array.Shuffle(availablePipes);

    const spawnCount = Math.min(amount, availablePipes.length);

    for (let i = 0; i < spawnCount; i++) {
        const pipe = availablePipes[i];
        const itemKey = Phaser.Utils.Array.GetRandom(possibleItems);

        let item = collectibles.create(
            pipe.x,
            pipe.y + pipe.displayHeight,
            itemKey
        );

        item.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        item.setScale(0.5);
        item.itemType = itemKey;
        item.setDepth(5);
    }
}



function collectItem(player, item) {

    if (item.itemType === 'casco') {

    cascoUnlocked = true;

    // Guardar en carrito
    addHelmetToCart();

    // Mensaje
    cascoText.setText('🎉 Has ganado un casco\nGuardado en el carrito');
    cascoText.setAlpha(1);

    player.scene.time.delayedCall(3000, () => {
        cascoText.setAlpha(0);
    });

    item.disableBody(true, true);
    return;
}

    item.disableBody(true, true);

    if (item.itemType === 'gasolina') gasolinaCount++;
    if (item.itemType === 'llave') llavesCount++;

    updateHUD();

    if (collectibles.countActive(true) === 0) {
        spawnRound(player.scene);
    }
}


function addHelmetToCart() {

    const CART_KEY = 'cart';
    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

    const helmetId = 'casco-delta';

    const existing = cart.find(item => item.id === helmetId);

    if (!existing) {
        cart.push({
            id: helmetId,
            model: 'Casco Delta',
            price: 129,
            image: 'game/assets/premio.png',
            quantity: 1
        });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}


function update(time, delta) {

    if (gameOver) {

        infoText.setText('GAME OVER - Pulsa R para reiniciar');

        if (Phaser.Input.Keyboard.JustDown(restartKey)) {
            restartGame(this);
        }

        return;
    }

    // MOVIMIENTO
    if (cursors.left.isDown) {
        player.setVelocityX(-250);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(250);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('idle');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-420);
    }

// ACTIVAR COCHE CUANDO HAY SUFICIENTES OBJETOS
if (
    gasolinaCount >= requiredGasolina &&
    llavesCount >= requiredLlaves
) {
    coche.setTint(0x00ff00);

    if (Phaser.Geom.Intersects.RectangleToRectangle(
        player.getBounds(),
        coche.getBounds()
    )) {
        infoText.setText(`Mantén X para reparar (${Math.floor(repairTimer)}%)`);

        if (repairKey.isDown) {
            repairTimer += delta * 0.05;

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


}
function updateFireDifficulty(scene) {

    fireSpeed += 10;

    // 2ª ronda → 2ª bola
    if (roundsCompleted === 2 && fuegos.countActive(true) < 2) {
        spawnFire(scene);
    }

    // 4ª ronda → 3ª bola
    if (roundsCompleted === 4 && fuegos.countActive(true) < 3) {
        spawnFire(scene);
    }
}


function updateHUD() {
    gasolinaText.setText(
        `Gasolina: ${gasolinaCount} / ${requiredGasolina}`
    );

    llavesText.setText(
        `Llaves: ${llavesCount} / ${requiredLlaves}`
    );

    roundText.setText(
        `Ronda: ${roundsCompleted + 1}`
    );

    highScoreText.setText(
        `Récord: ${highScore}`
    );
}


function hitFire(player, fire) {

    this.physics.pause();

    player.setTint(0xff0000);

    gameOver = true;
}

function restartGame(scene) {

    gameOver = false;

    scene.physics.resume();

    player.clearTint();
    player.setPosition(200, 450);

    gasolinaCount = 0;
    llavesCount = 0;
    ronda = 1;

    requiredGasolina = 5;
    requiredLlaves = 5;

    fireSpeed = 120;
    fireCount = 1;
    roundsCompleted = 0;

    fuegos.clear(true, true);
    collectibles.clear(true, true);

    infoText.setText('');

    updateHUD();

    spawnFire(scene);   // 🔥 <-- ESTA LÍNEA FALTABA
    spawnRound(scene);
}


function completeRepair() {

    repairTimer = 0;

    roundsCompleted++;

    // 🏆 NUEVO RÉCORD
    if (roundsCompleted > highScore) {
        highScore = roundsCompleted;
        localStorage.setItem('delta_highscore', highScore);
    }

    infoText.setText('¡Nivel completado!');

    updateFireDifficulty(player.scene);

    requiredGasolina += 2;
    requiredLlaves += 2;

    gasolinaCount = 0;
    llavesCount = 0;

    updateHUD(); // 👈 importante
    spawnRound(player.scene);
}





function spawnFire(scene) {

    const speed = fireSpeed;

    // Ángulo controlado (siempre diagonal)
    const angle = Phaser.Math.DegToRad(
        Phaser.Math.Between(25, 65)
    );

    const dirX = Math.random() < 0.5 ? -1 : 1;
    const dirY = Math.random() < 0.5 ? -1 : 1;

    let fire = fuegos.create(
        Phaser.Math.Between(100, 700),
        Phaser.Math.Between(100, 300),
        'fuego'
    );

    fire.setScale(0.5);
    fire.body.allowGravity = false;

    fire.setVelocity(
        Math.cos(angle) * speed * dirX,
        Math.sin(angle) * speed * dirY
    );

    fire.setBounce(1, 1);
    fire.setCollideWorldBounds(true);
}

