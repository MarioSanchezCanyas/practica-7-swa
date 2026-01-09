var config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
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
var repairBtn;

var mobileRepair = false;

var restartButton;

var player;
var platforms;
var cursors;

var mobileControls = {
    left: false,
    right: false,
    up: false
};


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

var pipeGroup;
var jumpPressed = false;

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

this.input.addPointer(2);

// Cargar récord guardado
const savedHighScore = localStorage.getItem('delta_highscore');
if (savedHighScore !== null) {
    highScore = parseInt(savedHighScore);
}

if (this.sys.game.device.input.touch) {

    const btnSize = 64;
    const y = 520;

    // LEFT
    const leftBtn = this.add.text(40, y, '◀', {
        fontSize: '48px',
        fill: '#000',
        backgroundColor: '#ffffffaa',
        padding: 10
    }).setScrollFactor(0).setDepth(3000).setInteractive();

    // RIGHT
    const rightBtn = this.add.text(120, y, '▶', {
        fontSize: '48px',
        fill: '#000',
        backgroundColor: '#ffffffaa',
        padding: 10
    }).setScrollFactor(0).setDepth(3000).setInteractive();

    // JUMP
    const jumpBtn = this.add.text(700, y, '▲', {
        fontSize: '48px',
        fill: '#000',
        backgroundColor: '#ffffffaa',
        padding: 10
    }).setScrollFactor(0).setDepth(3000).setInteractive();

// REPAIR

repairBtn = this.add.text(580, y, 'X', {
    fontSize: '36px',
    fill: '#000',
    backgroundColor: '#00ff00aa',
    padding: 12
})
.setScrollFactor(0)
.setDepth(3000)
.setInteractive();


repairBtn.on('pointerdown', () => {
    mobileRepair = true;
});

repairBtn.on('pointerup', () => {
    mobileRepair = false;
});

repairBtn.on('pointerout', () => {
    mobileRepair = false;
});


leftBtn.on('pointerdown', () => {
    mobileControls.left = true;
});

leftBtn.on('pointerup', () => {
    mobileControls.left = false;
});

leftBtn.on('pointerout', () => {
    mobileControls.left = false;
});


rightBtn.on('pointerdown', () => {
    mobileControls.right = true;
});

rightBtn.on('pointerup', () => {
    mobileControls.right = false;
});

rightBtn.on('pointerout', () => {
    mobileControls.right = false;
});

jumpBtn.on('pointerdown', () => {
    jumpPressed = true;
});

jumpBtn.on('pointerup', () => {
    mobileControls.up = false;
});

jumpBtn.on('pointerout', () => {
    mobileControls.up = false;
});

}


this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    right: Phaser.Input.Keyboard.KeyCodes.D
});


    this.add.image(400, 300, 'bg');

    // PLATAFORMAS
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

    // ANIMACIONES
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
pipeGroup = this.physics.add.staticGroup();

const pipeY = 0;
const pipeXPositions = Phaser.Utils.Array.NumberArrayStep(165, 700, 120);

pipeXPositions.forEach(x => {
    let pipe = pipeGroup.create(x, pipeY, 'pipe');
    pipe.setOrigin(0.5, 0);
    pipe.setDepth(10);

    // Ajustar cuerpo físico al tamaño real
    pipe.body.setSize(
        pipe.width * 0.9,
        pipe.height
    );

    pipe.body.setOffset(
        pipe.width * 0.05,
        0
    );

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
    this.physics.add.collider(player, pipeGroup);
    this.physics.add.collider(collectibles, pipeGroup);

    this.physics.add.overlap(player, collectibles, collectItem, null, this);
    this.physics.add.collider(player, fuegos, hitFire, null, this);

repairKey = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.X
);

restartButton = this.add.text(400, 360, 'REINICIAR', {
    fontSize: '28px',
    fill: '#fff',
    backgroundColor: '#000',
    padding: { x: 20, y: 12 }
})
.setOrigin(0.5)
.setDepth(4000)
.setInteractive()
.setAlpha(0);

restartButton.on('pointerdown', () => {
    restartGame(this);
    restartButton.setAlpha(0);
});


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
    casco.setBounce(0.1);
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

        item.setBounceY(Phaser.Math.FloatBetween(0.3, 0.4));
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
    restartButton.setAlpha(1);
    infoText.setText(''); 
    return;
}

const left =
    cursors.left.isDown ||
    this.wasd.left.isDown ||
    mobileControls.left;

const right =
    cursors.right.isDown ||
    this.wasd.right.isDown ||
    mobileControls.right;

const jump =
    Phaser.Input.Keyboard.JustDown(cursors.up) ||
    Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
    jumpPressed;

if (jump && player.body.touching.down) {
    player.setVelocityY(-420);
}

// reset del salto táctil
jumpPressed = false;

    // MOVIMIENTO
if (left && !right) {
    player.setVelocityX(-250);
    player.anims.play('left', true);
} 
else if (right && !left) {
    player.setVelocityX(250);
    player.anims.play('right', true);
} 
else {
    player.setVelocityX(0);
    player.anims.play('idle');
}
if (repairBtn) {
    repairBtn.setAlpha(mobileRepair ? 1 : 0.6);
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

if (repairKey.isDown || mobileRepair) {
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
    restartButton.setAlpha(0);

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

    // NUEVO RÉCORD
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

    updateHUD(); // importante
    spawnRound(player.scene);
}





function spawnFire(scene) {

    const speed = fireSpeed;

    // Ángulo controlado siempre diagonals
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

