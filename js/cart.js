// js/cart.js

// 🔥 CUSTOM PREMIUM TOAST NOTIFICATION 🔥
window.toast = function(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toastEl = document.createElement('div');
  toastEl.className = 'custom-toast';
  toastEl.innerText = message;
  container.appendChild(toastEl);
  
  // 2.5 second baad apne aap smoothly gayab ho jayega
  setTimeout(() => {
    toastEl.classList.add('toast-out');
    setTimeout(() => {
      if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
    }, 300);
  }, 2500); 
};

let cart = JSON.parse(localStorage.getItem('nexaCart')) || [];

// CART SAVE KARTA HAI
function saveCart() {
  localStorage.setItem('nexaCart', JSON.stringify(cart));
  updateCartCount();
}

// NAVBAR MEIN NUMBER UPDATE KARTA HAI
function updateCartCount() {
  const btn = document.getElementById('navCartBtn');
  if(btn) btn.innerText = `Cart (${cart.length})`;
}

// NAYA ITEM ADD KARTA HAI
function addToCart(id) {
  const item = window.softwares.find(s => s.id === id);
  if(!item) return;

  const exists = cart.find(i => i.id === id);
  if(exists) {
    toast('⚠️ Already in cart!'); // 🔥 Sasta Alert replaced 🔥
    return;
  }

  cart.push(item);
  saveCart();
  toast('🛒 Added to Cart'); // 🔥 Sasta Alert replaced 🔥
  closeModal();
}

// CART SE ITEM REMOVE KARTA HAI
window.removeFromCart = function(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart(); 
  renderCheckout(); 
};

// CHECKOUT PAGE LOAD HONE PAR
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  const cartList = document.getElementById('checkoutCartList');
  if(cartList) {
    renderCheckout();
    setupLivePayments();
  }
});

// CHECKOUT PAGE PAR ITEMS DIKHATA HAI
function renderCheckout() {
  const cartList = document.getElementById('checkoutCartList');
  const totalEl = document.getElementById('checkoutTotalAmount');
  const upiAmtEl = document.getElementById('upiBtnAmount');
  
  cartList.innerHTML = '';
  let total = 0;

  if(cart.length === 0) {
    cartList.innerHTML = '<p style="color: #aaa; text-align: center; margin-top: 20px;">Your cart is empty.</p>';
    totalEl.innerText = '₹0';
    if(upiAmtEl) upiAmtEl.innerText = '₹0';
    return;
  }

  cart.forEach(item => {
    total += Number(item.price);
    const posterImg = item.poster || 'https://via.placeholder.com/100x100?text=Image';
    
    cartList.innerHTML += `
      <div class="cart-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
        
        <div style="display: flex; align-items: center; flex: 1;">
          <img src="${posterImg}" class="item-img" alt="${item.title}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; margin-right: 15px;">
          <div class="item-details">
            <div class="item-title" style="font-weight: bold; font-size: 15px; margin-bottom: 3px;">${item.title}</div>
            <div class="item-cat" style="font-size: 12px; color: #aaa;">${item.category || 'Tool'}</div>
          </div>
        </div>

        <div style="text-align: right;">
          <div class="item-price" style="font-weight: bold; color: #32ff7e; margin-bottom: 6px;">₹${Number(item.price).toLocaleString('en-IN')}</div>
          <button onclick="removeFromCart('${item.id}')" style="background: rgba(230,63,111,0.1); color: #e63f6f; border: 1px solid rgba(230,63,111,0.3); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">Remove</button>
        </div>

      </div>
    `;
  });

  totalEl.innerText = `₹${total.toLocaleString('en-IN')}`;
  if(upiAmtEl) upiAmtEl.innerText = `₹${total.toLocaleString('en-IN')}`;
}

// LIVE PAYMENTS SETUP
function setupLivePayments() {
  if(typeof db === 'undefined') return;

  db.ref('settings/payment').on('value', (snapshot) => {
    const settings = snapshot.val();
    if(!settings) return;

    const payUpiBtn = document.getElementById('payUpiBtn');
    if(payUpiBtn && settings.upi) {
      payUpiBtn.onclick = () => {
        let currentTotal = cart.reduce((sum, item) => sum + Number(item.price), 0);
        if(currentTotal === 0) return toast("Cart is empty!");
        const upiLink = `upi://pay?pa=${settings.upi}&pn=${settings.name || 'NexaStore'}&am=${currentTotal}&cu=INR`;
        window.location.href = upiLink;
      };
    }

    const payPayPalBtn = document.getElementById('payPayPalBtn');
    if(payPayPalBtn && settings.paypal) {
      payPayPalBtn.onclick = () => {
        let currentTotal = cart.reduce((sum, item) => sum + Number(item.price), 0);
        if(currentTotal === 0) return toast("Cart is empty!");
        const totalUSD = (currentTotal / 83).toFixed(2);
        window.open(`https://paypal.me/${settings.paypal}/${totalUSD}`, '_blank');
      };
    }

    const payCryptoBtn = document.getElementById('payCryptoBtn');
    if(payCryptoBtn && settings.crypto) {
      payCryptoBtn.onclick = () => {
        let currentTotal = cart.reduce((sum, item) => sum + Number(item.price), 0);
        if(currentTotal === 0) return toast("Cart is empty!");
        window.location.href = settings.crypto;
      };
    }
  });
}
