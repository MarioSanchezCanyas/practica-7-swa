const CART_KEY = 'cart';

// Obtener carrito
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

// Guardar carrito
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

// Añadir producto
function addToCart(product) {
  const cart = getCart();

  const productId = String(product.id); // 🔑 CLAVE

  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      ...product,
      id: productId,
      quantity: 1
    });
  }

  saveCart(cart);
}

// Eliminar producto
function removeFromCart(id) {
  const cart = getCart().filter(item => item.id !== String(id));
  saveCart(cart);
  renderCart();
}

// Cambiar cantidad
function changeQuantity(id, amount) {
  const cart = getCart();
  const item = cart.find(p => p.id === String(id));

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart(cart);
  renderCart();
}


// Total del carrito
function getTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Contador del carrito (nav)
function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  const el = document.getElementById('cart-count');

  if (!el) return;

  if (count === 0) {
    el.classList.add('hidden');
  } else {
    el.classList.remove('hidden');
    el.textContent = count;
  }
}


// Renderizar carrito (cart.html)
function renderCart() {
  const container = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('cart-subtotal');
  const finalEl = document.getElementById('cart-final');

  if (!container) return;

  const cart = getCart();
  container.innerHTML = '';

  // 🟡 Carrito vacío
  if (cart.length === 0) {
    container.innerHTML =
      `<p class="text-center text-gray-500">Carrito vacío</p>`;

    if (subtotalEl) subtotalEl.textContent = '0 €';
    if (finalEl) finalEl.textContent = '0 €';
    return;
  }

  // 🟢 Render productos
  cart.forEach(item => {
    container.innerHTML += `
      <div class="flex items-center w-full bg-white border border-gray-200 rounded-xl px-8 py-5 shadow-sm">

        <!-- Imagen -->
        <div class="w-32 flex-shrink-0">
          <img src="${item.image}" class="w-full h-20 object-contain">
        </div>

        <!-- Info -->
        <div class="flex-1 px-8">
          <h3 class="text-lg font-semibold">${item.model}</h3>

          ${
            item.color || item.size
              ? `
                <p class="text-sm text-gray-500 mt-1">
                  ${item.color ? item.color : ''}
                  ${item.size ? ` · Talla ${item.size}` : ''}
                </p>
              `
              : ''
          }

          <p class="mt-2 font-medium">${item.price} €</p>
        </div>

        <!-- Cantidad -->
        <div class="flex items-center gap-3">
          <button onclick="changeQuantity('${item.id}', -1)"
            class="w-9 h-9 rounded-md bg-gray-100 hover:bg-gray-200">−</button>

          <span class="w-6 text-center">${item.quantity}</span>

          <button onclick="changeQuantity('${item.id}', 1)"
            class="w-9 h-9 rounded-md bg-gray-100 hover:bg-gray-200">+</button>
        </div>

        <!-- Eliminar -->
        <button onclick="removeFromCart('${item.id}')"
          class="ml-8 text-gray-400 hover:text-red-500">✕</button>
      </div>
    `;
  });

  // 🧮 Totales
  const total = getTotal();
  if (subtotalEl) subtotalEl.textContent = total + ' €';
  if (finalEl) finalEl.textContent = total + ' €';
}


// Inicializar contador
document.addEventListener('DOMContentLoaded', updateCartCount);
