const canvas = document.getElementById('logo-canvas');

const illo = new Zdog.Illustration({
  element: canvas,
  dragRotate: false,
  zoom: 0.5,
  resize: true,
  background: null,
});



const logo = new Zdog.Group({ addTo: illo, translate: { x:0, y:10 } });

// --------------------
// CÍRCULO EXTERNO GRIS METÁLICO
// --------------------
const silverRings = [];
const silverShades = ['#D8D8D8', '#C0C0C0', '#A8A8A8'];

silverShades.forEach((shade, i) => {
  const ring = new Zdog.Ellipse({
    addTo: logo,
    diameter: 65 + i * 2,
    stroke: 3,
    color: shade,
    translate: { x: 0, y: -10 },
  });

  silverRings.push(ring);
});


// --------------------
// FONDO INTERIOR DEL CÍRCULO (GRADIENTE AMARILLO)
// --------------------
const yellowShades = ['#ffffffff', '#ffffffff', '#ffffffff']; // al final es blanco
yellowShades.forEach((shade, i) => {
  new Zdog.Ellipse({
    addTo: logo,
    diameter: 60 - i*2,
    stroke: 0,
    fill: true,
    color: shade,
    translate: { x: 0, y: -10 },
  });
});

// --------------------
// LOGO INTERNO ROJO CON GRADIENTE SUAVE
// --------------------
const redShades = ['#000000', '#000000', '#000000']; // al final es negro
redShades.forEach((shade, i) => {
  // S + conexión
  new Zdog.Shape({
    addTo: logo,
    translate: { x: 4 + i*0.1, y: -10 + i*0.1 },
    path: [
      { x: 8, y: -14 },
      { arc: [ { x: -2, y: -28 }, { x: -10, y: -16 } ] },
      { arc: [ { x: -14, y: -7 }, { x: -6, y: -2 } ] },
      { arc: [ { x: -2, y: 2 }, { x: 0, y: 4 } ] },
    ],
    closed: false,
    stroke: 3,
    color: shade,
  });

  // O debajo de la S
  new Zdog.Ellipse({
    addTo: logo,
    diameter: 20,
    stroke: 3,
    color: shade,
    translate: { x: -2 + i*0.1, y: 2 + i*0.1 },
  });
});

let colorOffset = 0;

function rotateSilverColors() {
  colorOffset += 0.03;

  silverRings.forEach((ring, i) => {
    const base = 180 + Math.sin(colorOffset + i) * 40;
    const gray = Math.floor(base);

    ring.color = `rgb(${gray}, ${gray}, ${gray})`;
  });
}

const AUTO_ROTATE_SPEED = 0.003; // velocidad media-baja

// --------------------
// RENDER
// --------------------
function animate() {
  // rotación automática suave
  logo.rotate.y += AUTO_ROTATE_SPEED;

  // animación del brillo del anillo
  rotateSilverColors();

  illo.updateRenderGraph();
  requestAnimationFrame(animate);
}

animate();
