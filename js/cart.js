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
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
}

// Eliminar producto
function removeFromCart(id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  renderCart();
}

// Cambiar cantidad
function changeQuantity(id, amount) {
  const cart = getCart();
  const item = cart.find(p => p.id === id);

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
  if (el) el.textContent = count;
}

// Renderizar carrito (cart.html)
function renderCart() {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');

  if (!container) return;

  const cart = getCart();
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = `<p class="text-center text-gray-500">Carrito vacío</p>`;
    totalEl.textContent = '0 €';
    return;
  }

  cart.forEach(item => {
    container.innerHTML += `
      <div class="flex items-center justify-between bg-white p-4 rounded shadow">
        <img src="${item.image}" class="w-20 h-16 object-cover rounded">
        
        <div class="flex-1 px-4">
          <h3 class="font-bold">${item.model}</h3>
          <p>${item.price} €</p>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="changeQuantity(${item.id}, -1)" class="px-2 bg-gray-300 rounded">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity(${item.id}, 1)" class="px-2 bg-gray-300 rounded">+</button>
        </div>

        <button onclick="removeFromCart(${item.id})" class="text-red-500 ml-4">✕</button>
      </div>
    `;
  });

  totalEl.textContent = getTotal() + ' €';
}

// Inicializar contador
document.addEventListener('DOMContentLoaded', updateCartCount);
