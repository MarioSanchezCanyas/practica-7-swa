// ===============================
// ESTADO GLOBAL
// ===============================
let allProducts = [];
let filteredProducts = [];
const slidersState = {}; // estado de cada slider por producto
let helmetSize = null;

// ===============================
// ESTADO CASCOS (DETALLE)
// ===============================
let currentHelmet = null;
let helmetColorIndex = 0;
let helmetImageIndex = 0;

// ===============================
// RENDER CARDS
// ===============================

function burgerMenu() {
  const btn = document.getElementById("menu-btn");
  const menu = document.getElementById("menu");

  if (!btn || !menu) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("hidden");
  });

  document.addEventListener("click", () => {
    menu.classList.add("hidden");
  });

  menu.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

function heroSlider() {
  const slides = document.querySelectorAll('.slide');
  const next = document.getElementById('next');
  const prev = document.getElementById('prev');

  if (!slides.length || !next || !prev) return;

  let current = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('opacity-100', i === index);
      slide.classList.toggle('opacity-0', i !== index);
    });
  }

  next.addEventListener('click', () => {
    current = (current + 1) % slides.length;
    showSlide(current);
  });

  prev.addEventListener('click', () => {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  });
}



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
<div class="relative bg-gray-50 aspect-[16/9] overflow-hidden">

<img 
  id="img-${p.id}"
  src="${p.images[0]}"
  alt="${p.model}"
  class="w-full h-full object-cover"
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
              onclick='addToCart({
                id: ${p.id},
                model: "${p.model}",
                price: ${p.price},
                image: "${p.images[0]}"
              })'
              class="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white">
              Comprar
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
function renderHelmetSizes() {
  const container = document.getElementById('helmet-sizes');
  if (!container || !currentHelmet.sizes) return;

container.innerHTML = currentHelmet.sizes.map(size => `
  <button
    onclick="setHelmetSize('${size}')"
    class="px-4 py-2 border uppercase tracking-widest text-sm
      ${helmetSize === size
        ? 'border-black bg-black text-white'
        : 'border-gray-300 text-gray-600 hover:bg-gray-100'}">
    ${size}
  </button>
`).join('');

}

function renderHelmetAttributes() {
  const el = document.getElementById('helmet-attrs');
  if (!el || !currentHelmet) return;

  el.innerHTML = `
    <li><strong>Homologación:</strong> ${currentHelmet.homologation}</li>
    <li><strong>Peso:</strong> ${currentHelmet.weight}</li>
    <li><strong>Material:</strong> ${currentHelmet.material}</li>
  `;
}

function setHelmetSize(size) {
  helmetSize = size;
  renderHelmetSizes();
}


function renderHelmetDetail(helmet) {
  if (!helmet || !helmet.colors) return;

  currentHelmet = helmet;
  helmetColorIndex = 0;
  helmetImageIndex = 0;
helmetSize = helmet.sizes.includes('XL')
  ? 'XL'
  : helmet.sizes[0];


  document.getElementById('helmet-model').textContent = helmet.model;
  document.getElementById('helmet-desc').textContent = helmet.description;
  document.getElementById('helmet-price').textContent = helmet.price;

  renderHelmetColors();
  updateHelmetImage();
  renderHelmetSizes();
  renderHelmetAttributes();
}

function addHelmetToCart() {

  const color = currentHelmet.colors[helmetColorIndex];

  const productForCart = {
    id: `${currentHelmet.id}-${helmetColorIndex}-${helmetSize}`,
    model: currentHelmet.model,
    price: currentHelmet.price,
    image: color.images[helmetImageIndex],
    color: color.name,
    size: helmetSize
  };

  addToCart(productForCart);
}

function renderHelmetColors() {
  const container = document.getElementById('helmet-colors');
  if (!container) return;

  container.innerHTML = currentHelmet.colors.map((color, index) => `
    <button
      onclick="setHelmetColor(${index})"
      style="background:${color.code}"
      class="w-10 h-10 rounded-full border-2
             ${index === helmetColorIndex ? 'border-black' : 'border-gray-300'}">
    </button>
  `).join('');
}

let fadeTimeout = null;

function updateHelmetImage() {
  const color = currentHelmet.colors[helmetColorIndex];
  const mainImg = document.getElementById('helmet-main');
  const thumbs = document.getElementById('helmet-thumbs');

  // cancelar fade anterior si existe
  if (fadeTimeout) clearTimeout(fadeTimeout);

  // fade out
  mainImg.style.opacity = 0;

  fadeTimeout = setTimeout(() => {
    mainImg.src = color.images[helmetImageIndex];

    // cuando la imagen cargue → fade in
    mainImg.onload = () => {
      mainImg.style.opacity = 1;
    };
  }, 200);

  thumbs.innerHTML = color.images.map((img, i) => `
    <img
      src="${img}"
      onclick="setHelmetImage(${i})"
      class="w-20 h-20 object-contain cursor-pointer border
             ${i === helmetImageIndex ? 'border-black' : 'border-gray-200'}"
    />
  `).join('');
}


function setHelmetColor(index) {
  helmetColorIndex = index;
  helmetImageIndex = 0;
  renderHelmetColors();
  updateHelmetImage();
}

function setHelmetImage(index) {
  helmetImageIndex = index;
  updateHelmetImage();
}

function nextHelmetImage() {
  const images = currentHelmet.colors[helmetColorIndex].images;
  if (helmetImageIndex < images.length - 1) {
    helmetImageIndex++;
    updateHelmetImage();
  }
}

function prevHelmetImage() {
  if (helmetImageIndex > 0) {
    helmetImageIndex--;
    updateHelmetImage();
  }
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

const container = document.querySelector('.group');
const img = document.getElementById('helmet-main');

if (container && img) {
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = 'scale(1.6)';
  });

  container.addEventListener('mouseleave', () => {
    img.style.transformOrigin = 'center';
    img.style.transform = 'scale(1)';
  });
}


function renderMotos(products, limit = 5) {
  const container = document.getElementById('featured-products');
  if (!container) return;

  const list = products.slice(0, limit);

  container.innerHTML = `
<div class="max-w-screen-2xl mx-auto px-6 py-32 space-y-14 mx-12">
      ${list.map(product => `
        <div class="bg-cyan-50 border border-gray-200 rounded-xl shadow-sm
                    grid grid-cols-1 lg:grid-cols-2 gap-16 items-center
                    p-14">

          <!-- INFO -->
          <div>
            <h2 class="text-4xl font-bold tracking-wide mb-8">
              ${product.model}
            </h2>

            <p class="text-gray-600 leading-relaxed max-w-lg mb-10">
              ${product.description}
            </p>

            <div class="flex items-end gap-6 mb-6">
              <span class="text-lg font-semibold">Precio:</span>
              <span class="text-4xl font-bold">
                ${product.price.toLocaleString()} €
              </span>
            </div>

            ${
              product.promo
                ? `<p class="text-red-600 font-semibold uppercase text-sm tracking-widest mb-8">
                    ${product.promo}
                  </p>`
                : `<div class="mb-8"></div>`
            }

            <!-- BOTÓN -->
            <button
              onclick='addToCart(${JSON.stringify(product)})'
              class="bg-red-600 hover:bg-red-700 text-white
                     uppercase tracking-widest text-sm
                     px-10 py-4 transition">
              Comprar
            </button>
          </div>

          <!-- IMAGEN -->
          <div class="flex justify-center">
            <img
              src="${product.image}"
              alt="${product.model}"
              class="max-h-[420px] object-contain"
            />
          </div>

        </div>
      `).join('')}
    </div>
  `;
}

// ===============================
// FORMULARIO CONTACTO
// ===============================
const form = document.getElementById('contact-form');

if (form) {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');

  const errorName = document.getElementById('error-name');
  const errorEmail = document.getElementById('error-email');
  const successMsg = document.getElementById('success-msg');

  function validateName() {
    if (nameInput.value.trim() === '') {
      errorName.classList.remove('hidden');
      nameInput.classList.add('border-red-500');
      return false;
    }
    errorName.classList.add('hidden');
    nameInput.classList.remove('border-red-500');
    return true;
  }

  function validateEmail() {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(emailInput.value.trim())) {
      errorEmail.classList.remove('hidden');
      emailInput.classList.add('border-red-500');
      return false;
    }
    errorEmail.classList.add('hidden');
    emailInput.classList.remove('border-red-500');
    return true;
  }

  // Validación en tiempo real
  nameInput.addEventListener('input', validateName);
  emailInput.addEventListener('input', validateEmail);

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isValid = validateName() & validateEmail();
    if (!isValid) return;

    const formData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim() || null,
      date: new Date().toISOString()
    };

    const stored =
      JSON.parse(localStorage.getItem('contactMessages')) || [];

    stored.push(formData);
    localStorage.setItem('contactMessages', JSON.stringify(stored));

    form.reset();
    successMsg.classList.remove('hidden');

    setTimeout(() => {
      successMsg.classList.add('hidden');
    }, 3000);
  });
}



// ===============================
// INIT
// ===============================

document.addEventListener('DOMContentLoaded', () => {

  burgerMenu()
  heroSlider();
  const categoryId = document.body.dataset.category;

  fetch('data/data.json')
    .then(res => res.json())
    .then(data => {
      const category = data.categories.find(c => c.id === categoryId);
      if (!category) return;

      allProducts = category.products;
      filteredProducts = [...allProducts];

      // Solo renderProducts si existe el contenedor
      if (document.getElementById('products')) {
        renderProducts(filteredProducts);
      }

      // Solo renderMoto si existe el featured
      if (document.getElementById('featured-products')) {
        renderMotos(category.products, 5);
      }

      if (document.getElementById('helmet-main')) {
        renderHelmetDetail(category.products[0]);
      }

      if (document.getElementById('helmet-main')) {
        renderHelmetDetail(category.products[0]);
      }
    });

  // filtros solo si existen
  ['filter-price', 'filter-rating', 'filter-stock', 'filter-sort']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', applyFilters);
    });

  // swiper solo si existe
  if (document.querySelector('.motos-swiper')) {
new Swiper('.motos-swiper', {
  loop: true,
  centeredSlides: true,
  slidesPerView: 3,
  spaceBetween: 120,
  grabCursor: true,
  breakpoints: {
    0: { slidesPerView: 1.2 },
    768: { slidesPerView: 3 }
  }
});

  }
});
