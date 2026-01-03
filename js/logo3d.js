function initLogo3D() {
  const canvas = document.getElementById('logo-canvas');

  const illo = new Zdog.Illustration({
    element: canvas,
    dragRotate: false,
    zoom: 1,        // zoom 1 = ocupa todo el canvas 40x40 de forma proporcional
    resize: true,   // opcional si quieres que Zdog ajuste canvas automáticamente
  });

  new Zdog.Box({
    addTo: illo,
    width: 20,      // tamaño relativo al canvas
    height: 20,
    depth: 20,
    stroke: false,
    color: '#f00',
    leftFace: '#c25',
    rightFace: '#e62',
    topFace: '#ed0',
    bottomFace: '#636',
  });

  function animate() {
    illo.rotate.y += 0.01;  // giro sutil
    illo.updateRenderGraph();
    requestAnimationFrame(animate);
  }

  animate();
}

window.initLogo3D = initLogo3D;
