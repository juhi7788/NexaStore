// js/app.js

// 1. FIREBASE SE LIVE DATA MAGWAO
db.ref('products').on('value', (snapshot) => {
  const data = snapshot.val();
  window.softwares = []; // Purana data clear karo
  
  if (data) {
    for (let key in data) {
      window.softwares.push(data[key]);
    }
  }
  renderSoftwares(); // Data aate hi screen par dikhao
});

// 2. PRODUCTS KO SCREEN PAR DIKHAO
function renderSoftwares() {
  const slider = document.querySelector('.slider');
  if (!slider) return; 

  slider.innerHTML = ''; 

  // Agar Firebase khali hai
  if(window.softwares.length === 0) {
    slider.innerHTML = '<p style="color: #aaa; text-align: center; width: 100%;">Loading products from Live Database...</p>';
    return;
  }

  // Firebase se aaye har product ka card banao
  window.softwares.forEach(software => {
    // Agar image link nahi hai, toh ek default image dikhayega taaki design kharab na ho
    const posterImg = software.poster || 'https://via.placeholder.com/300x400?text=No+Image';
    const priceTxt = software.price ? Number(software.price).toLocaleString('en-IN') : '0';
    const catTxt = software.category || 'Premium Tool';

    const cardHTML = `
      <div class="card" onclick="openModal('${software.id}')">
        <img src="${posterImg}" class="card-poster" alt="${software.title}">
        <div class="card-info">
          <div class="card-title">${software.title}</div>
          <div class="card-meta">₹${priceTxt} • ${catTxt}</div>
        </div>
      </div>
    `;
    slider.insertAdjacentHTML('beforeend', cardHTML);
  });
}

// 3. MODAL (POP-UP) LOGIC
function openModal(softwareId) {
  const overlay = document.getElementById('detailsModal');
  const software = window.softwares.find(s => s.id === softwareId);
  if (!software) return;

  const posterImg = software.poster || 'https://via.placeholder.com/600x400?text=No+Image';

  document.getElementById('modalImg').src = posterImg;
  document.getElementById('modalTitle').innerText = software.title;
  document.getElementById('modalDesc').innerText = software.desc || 'No description available.';
  document.getElementById('modalPrice').innerText = `₹${Number(software.price).toLocaleString('en-IN')}`;

  const addToCartBtn = document.getElementById('modalAddToCartBtn');
  addToCartBtn.innerText = 'Add to\nCart';
  addToCartBtn.onclick = function() { addToCart(softwareId); };

  overlay.classList.add('open');
}

// Modal close karne ka function
function closeModal() {
  document.getElementById('detailsModal').classList.remove('open');
}
