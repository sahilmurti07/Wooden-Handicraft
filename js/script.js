// --- 1. GLOBAL VARIABLES & SELECTORS ---
const menuBtn = document.querySelector('.menu-btn');
const navbar = document.querySelector('.navbar');
const cartOverlay = document.querySelector('.cart-overlay');
const cartSidebar = document.querySelector('.cart-sidebar');
const closeCartBtn = document.querySelector('.close-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.total-price');
const cartIcon = document.querySelector('#cart-icon');
const checkoutBtn = document.querySelector('.checkout-btn');

// --- 2. PRODUCT DATABASE ---
const productsDB = [
    { id: '1', name: 'Teak Chair', price: 2500000, image: './images/products/chair-1.jpg', description: 'A minimalist chair carved from 100% solid Teak wood. Perfect for dining or accent use.' },
    { id: '2', name: 'Wooden Bowl Set', price: 150000, image: './images/products/bowl-set.jpg', description: 'Handcrafted acacia wood bowls. Safe for food, easy to clean, and adds a natural touch.' },
    { id: '3', name: 'Rustic Table', price: 7000000, image: './images/products/table.jpg', description: 'Reclaimed wood coffee table with a natural finish. Features a sturdy build and unique grain.' },
    { id: '4', name: 'Vintage Lamp', price: 500000, image: './images/products/lamp.jpg', description: 'Warm ambient lighting with a hand-turned wooden base. Comes with an eco-friendly LED bulb.' }
];

// Load Cart from Memory
let cart = JSON.parse(localStorage.getItem('CART')) || []; 

// --- 3. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    renderCart();
    setupProductPage();
});

// --- 4. MOBILE MENU LOGIC ---
function setupMobileMenu() {
    if(menuBtn && navbar) {
        menuBtn.addEventListener('click', () => {
            navbar.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if(navbar.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }
}

// --- 5. CART EVENT LISTENERS ---
if(cartIcon) cartIcon.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
if(closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if(cartOverlay) cartOverlay.addEventListener('click', closeCart);

// Add to Cart (Home/Shop)
const gridButtons = document.querySelectorAll('.add-to-cart');
gridButtons.forEach(button => {
    button.addEventListener('click', () => {
        const product = {
            id: button.getAttribute('data-id'),
            name: button.getAttribute('data-name'),
            price: parseInt(button.getAttribute('data-price')),
            image: button.getAttribute('data-image'),
            quantity: 1
        };
        addToCart(product);
        openCart();
    });
});

// Cart Controls (Remove / + / -)
if(cartItemsContainer) {
    cartItemsContainer.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if(e.target.classList.contains('remove-item')) removeFromCart(id);
        else if(e.target.classList.contains('qty-plus')) changeQuantity(id, 1);
        else if(e.target.classList.contains('qty-minus')) changeQuantity(id, -1);
    });
}

// --- 6. WHATSAPP CHECKOUT LOGIC (New!) ---
if(checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if(cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // --- CONFIGURATION ---
        // REPLACE WITH YOUR PHONE NUMBER (No + sign)
        const phoneNumber = "919876543210"; 
        
        // Build the Message
        let message = "Hello! I would like to place an order:%0A%0A";
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            // Format: - Item Name (x2): Rp 500.000
            message += `- ${item.name} (x${item.quantity}): Rp ${itemTotal.toLocaleString('id-ID')}%0A`;
        });

        message += `%0A*Total Price: Rp ${total.toLocaleString('id-ID')}*`;
        message += "%0A%0APlease confirm availability.";

        // Open WhatsApp
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(whatsappURL, '_blank');
    });
}

// --- 7. CART FUNCTIONS ---
function openCart() { cartSidebar.classList.add('open'); cartOverlay.classList.add('active'); }
function closeCart() { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('active'); }

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) existingItem.quantity += product.quantity;
    else cart.push(product);
    saveCart();
    renderCart();
}

function changeQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if(item) {
        item.quantity += change;
        if(item.quantity <= 0) removeFromCart(id);
        else { saveCart(); renderCart(); }
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
}

function saveCart() { localStorage.setItem('CART', JSON.stringify(cart)); }

function renderCart() {
    if(!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
        if(cartTotal) cartTotal.innerText = 'Rp 0';
        return;
    }

    let totalPrice = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;

        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <div class="item-subtotal">Rp ${item.price.toLocaleString('id-ID')} x ${item.quantity}</div>
                <div class="qty-controls">
                    <span class="qty-btn qty-minus" data-id="${item.id}">-</span>
                    <span class="qty-count">${item.quantity}</span>
                    <span class="qty-btn qty-plus" data-id="${item.id}">+</span>
                </div>
            </div>
            <div class="item-right">
                <p class="final-price">Rp ${itemTotal.toLocaleString('id-ID')}</p>
                <i class="fa-solid fa-trash remove-item" data-id="${item.id}"></i>
            </div>
        `;
        cartItemsContainer.appendChild(div);
    });

    if(cartTotal) cartTotal.innerText = 'Rp ' + totalPrice.toLocaleString('id-ID');
}

// --- 8. PRODUCT PAGE LOGIC ---
function setupProductPage() {
    if (window.location.pathname.includes('product.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        // Loose match (==) to handle string vs number issues
        const product = productsDB.find(p => p.id == productId);

        if (product) {
            document.getElementById('product-name').innerText = product.name;
            document.getElementById('bread-name').innerText = product.name;
            document.getElementById('product-price').innerText = 'Rp ' + product.price.toLocaleString('id-ID');
            document.getElementById('main-img').src = product.image;
            document.getElementById('product-desc').innerText = product.description;

            const addBtn = document.getElementById('add-btn');
            if(addBtn) {
                // Clear old event listeners (optional safeguard)
                const newBtn = addBtn.cloneNode(true);
                addBtn.parentNode.replaceChild(newBtn, addBtn);
                
                newBtn.addEventListener('click', () => {
                    addToCart({ ...product, quantity: 1 }); 
                    openCart();
                });
            }
        }
    }
}