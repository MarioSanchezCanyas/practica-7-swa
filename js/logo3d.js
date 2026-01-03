const canvas = document.getElementById('logo-canvas');

const illo = new Zdog.Illustration({
  element: canvas,
  dragRotate: true,
  zoom: 0.5, // escala todo el logo a un cuarto
  resize: true,
  background: null, // fondo transparente
});


const logo = new Zdog.Group({ addTo: illo, translate: { x:0, y:10 } });

// --------------------
// CÍRCULO EXTERNO GRIS METÁLICO
// --------------------
const silverShades = ['#D8D8D8', '#C0C0C0', '#A8A8A8'];
silverShades.forEach((shade, i) => {
  new Zdog.Ellipse({
    addTo: logo,
    diameter: 65 + i*2,
    stroke: 3,
    color: shade,
    translate: { x: 0, y: -10 },
  });
});

// --------------------
// FONDO INTERIOR DEL CÍRCULO (GRADIENTE AMARILLO)
// --------------------
const yellowShades = ['#FFF9C4', '#FFF59D', '#FFF176']; // tonos amarillo claro a dorado
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
const redShades = ['#000000', '#000000', '#000000']; // rojo brillante a más oscuro
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

// --------------------
// RENDER
// --------------------
function animate() {
  illo.updateRenderGraph();
  requestAnimationFrame(animate);
}

animate();