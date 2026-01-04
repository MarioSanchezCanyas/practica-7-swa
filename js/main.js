// ===============================
// ESTADO GLOBAL
// ===============================
let allProducts = [];
let filteredProducts = [];
const slidersState = {}; // estado de cada slider por producto

// ===============================
// RENDER CARDS
// ===============================
function renderProducts(products) {
  const container = document.getElementById('products');
  container.innerHTML = '';

  if (!products.length) {
    container.innerHTML = `
      <p class="col-span-full text-center text-gray-400 uppercase tracking-widest">
        No hay coches que coincidan
      </p>
    `;
    return;
  }

  products.forEach(p => {
    // Inicializamos slider
    slidersState[p.id] = 0;

    container.innerHTML += `
      <div class="bg-white border border-gray-200 flex flex-col">

        <!-- SLIDER -->
        <div class="relative bg-gray-50 px-6 py-8 flex justify-center">

          <img 
            id="img-${p.id}"
            src="${p.images[0]}"
            alt="${p.model}"
            class="max-h-40 object-contain transition-all duration-300"
          />

          <!-- Flecha izquierda -->
          <button
            id="prev-${p.id}"
            onclick="prevImage(${p.id})"
            class="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded-full disabled:opacity-30 disabled:cursor-not-allowed pb-1">
            ‹
          </button>

          <!-- Flecha derecha -->
          <button
            id="next-${p.id}"
            onclick="nextImage(${p.id})"
            class="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 text-white w-8 h-8 flex items-center justify-center rounded-full disabled:opacity-30 disabled:cursor-not-allowed pb-1">
            ›
          </button>
        </div>

        <!-- CONTENIDO -->
        <div class="p-6 flex flex-col flex-1">

          <!-- Rating -->
          <div class="flex justify-between items-center mb-3 text-xs uppercase tracking-widest text-gray-500">
            <span class="bg-black text-white px-3 py-1 rounded-full">
              ⭐ ${p.rating}
            </span>
            <span>${p.stock} en stock</span>
          </div>

          <h3 class="text-lg font-semibold uppercase mb-2">
            ${p.model}
          </h3>

          <p class="text-sm text-gray-600 mb-4">
            ${p.description}
          </p>

          <div class="text-2xl font-bold mb-8">
            ${p.price.toLocaleString()} €
          </div>

          <!-- ACCIONES -->
          <div class="mt-auto flex gap-3">
            <button
              onclick='addToCart(${JSON.stringify(p)})'
              class="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white uppercase tracking-widest text-sm py-4 hover:brightness-110 transition">
              Solicitar
            </button>

            <button
              class="flex-1 border border-gray-300 uppercase tracking-widest text-sm py-4 hover:bg-gray-100 transition">
              Más detalles
            </button>
          </div>
        </div>
      </div>
    `;

    updateSlider(p.id); // bloquea flechas iniciales
  });
}

// ===============================
// SLIDER CLÁSICO (NO INFINITO)
// ===============================
function nextImage(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  if (slidersState[id] < product.images.length - 1) {
    slidersState[id]++;
    updateSlider(id);
  }
}

function prevImage(id) {
  if (slidersState[id] > 0) {
    slidersState[id]--;
    updateSlider(id);
  }
}

function updateSlider(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const img = document.getElementById(`img-${id}`);
  const prevBtn = document.getElementById(`prev-${id}`);
  const nextBtn = document.getElementById(`next-${id}`);

  img.src = product.images[slidersState[id]];

  // Bloqueos clásicos
  prevBtn.disabled = slidersState[id] === 0;
  nextBtn.disabled = slidersState[id] === product.images.length - 1;
}

// ===============================
// FILTROS
// ===============================
function applyFilters() {
  const maxPrice = Number(document.getElementById('filter-price')?.value || 0);
  const minRating = Number(document.getElementById('filter-rating')?.value || 0);
  const stockValue = Number(document.getElementById('filter-stock')?.value || 0);
  const sort = document.getElementById('filter-sort')?.value;

  filteredProducts = [...allProducts];

  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
  }

  if (minRating) {
    filteredProducts = filteredProducts.filter(p => p.rating >= minRating);
  }

  if (stockValue === 1) {
    filteredProducts = filteredProducts.filter(p => p.stock > 0);
  }

  if (sort === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (sort === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  if (sort === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  renderProducts(filteredProducts);
}

function renderMotos(products, limit = 5) {
  const container = document.getElementById('featured-products');
  if (!container) return;

  const list = products.slice(0, limit);

  container.innerHTML = list.map((product, index) => `
    <div class="max-w-7xl mx-auto px-10 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      
      <!-- INFO -->
      <div>
        ${index === 0 ? '<hr class="mb-8 w-24 border-gray-300">' : ''}

        <h2 class="text-4xl font-bold tracking-wide mb-8">
          ${product.model}
        </h2>

        <p class="text-gray-600 leading-relaxed max-w-lg mb-12">
          ${product.description}
        </p>

        <div class="border-t border-gray-300 w-24 mb-10"></div>

        <div class="flex items-end gap-6 mb-4">
          <span class="text-lg font-semibold">Precio:</span>
          <span class="text-4xl font-bold">
            ${product.price.toLocaleString()} €
          </span>
        </div>

        ${
          product.promo
            ? `<p class="text-red-600 font-semibold uppercase text-sm tracking-widest">
                ${product.promo}
              </p>`
            : ''
        }
      </div>

      <!-- IMAGEN -->
      <div class="relative flex justify-center">
        <img
          src="${product.image}"
          alt="${product.model}"
          class="max-h-[420px] object-contain"
        />
      </div>
    </div>

    ${index < list.length - 1 ? '<hr class="max-w-5xl mx-auto border-gray-200">' : ''}
  `).join('');
}


// ===============================
// INIT
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  const categoryId = document.body.dataset.category;

  fetch('data/data.json')
    .then(res => res.json())
    .then(data => {
      const category = data.categories.find(c => c.id === categoryId);
      if (!category) return;

      allProducts = category.products;
      filteredProducts = [...allProducts];

      // 👉 SOLO renderProducts si existe el contenedor
      if (document.getElementById('products')) {
        renderProducts(filteredProducts);
      }

      // 👉 SOLO renderMoto si existe el featured
      if (document.getElementById('featured-products')) {
        renderMotos(category.products, 5);
      }
    });

  // filtros SOLO si existen
  ['filter-price', 'filter-rating', 'filter-stock', 'filter-sort']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', applyFilters);
    });

  // swiper SOLO si existe
  if (document.querySelector('.motos-swiper')) {
    new Swiper('.motos-swiper', {
      loop: true,
      centeredSlides: true,
      slidesPerView: 3,
      spaceBetween: 80,
      grabCursor: true,
      breakpoints: {
        0: { slidesPerView: 1.3 },
        768: { slidesPerView: 3 }
      }
    });
  }
});
