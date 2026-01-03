// ---------- LAYOUT ----------
function loadLayout() {
fetch('nav.html')
  .then(res => res.text())
  .then(html => { 
    document.getElementById('nav').innerHTML = html;

    // Inicializa logo 3D solo después de que el navegador haya pintado el DOM
    requestAnimationFrame(() => {
      if (window.initLogo3D) window.initLogo3D();
    });
  })
  .catch(err => console.error('Error cargando nav:', err));

  fetch('footer.html')
    .then(res => res.text())
    .then(html => { 
      document.getElementById('footer').innerHTML = html;
    })
    .catch(err => console.error('Error cargando footer:', err));
}


// ---------- PRODUCT CARD ----------
function createProductCard(product, theme) {
  return `
    <div class="rounded-xl shadow-lg p-4 
      ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'}">

      <img src="${product.image}" 
           alt="${product.model}"
           class="rounded mb-3 h-40 w-full object-cover">

      <h3 class="text-lg font-bold">${product.model}</h3>
      <p class="text-sm opacity-80">${product.description}</p>

      <div class="mt-2">⭐ ${product.rating}</div>

      <p class="text-xl font-semibold mt-2">${product.price} €</p>

      <p class="text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}">
        Stock: ${product.stock}
      </p>

      <button 
        data-id="${product.id}"
        class="add-to-cart mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
        Añadir al carrito
      </button>
    </div>
  `;
}

// ---------- CARGAR CATEGORÍA ----------
function loadCategory(categoryId) {
  if (!categoryId) return;

  fetch('data/data.json')
    .then(res => res.json())
    .then(data => {
      const category = data.categories.find(c => c.id === categoryId);
      if (!category) return;

      const container = document.getElementById('products');
      if (!container) return;

      container.innerHTML = '';
      category.products.forEach(product => {
        container.innerHTML += createProductCard(product, category.theme);
      });
    });
}

// ---------- AÑADIR AL CARRITO (GLOBAL) ----------
document.addEventListener('click', e => {
  if (!e.target.classList.contains('add-to-cart')) return;

  const id = parseInt(e.target.dataset.id);

  fetch('data/data.json')
    .then(res => res.json())
    .then(data => {
      const product = data.categories
        .flatMap(c => c.products)
        .find(p => p.id === id);

      if (product && typeof addToCart === 'function') {
        addToCart(product);
      }
    });
});

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  loadLayout();

  const category = document.body.dataset.category;
  loadCategory(category);
});
