import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAyknjeM9e8lvwBeogJvAly4834VpdoHiI",
  authDomain: "nexastore-42d24.firebaseapp.com",
  databaseURL: "https://nexastore-42d24-default-rtdb.firebaseio.com",
  projectId: "nexastore-42d24",
  storageBucket: "nexastore-42d24.firebasestorage.app",
  messagingSenderId: "671073555026",
  appId: "1:671073555026:web:d28e98db87f6070308058b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// SECURITY
onAuthStateChanged(auth, (user) => {
  if (user) { document.body.style.display = "block"; } 
  else { window.location.href = "login.html"; }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  signOut(auth).then(() => { window.location.href = "login.html"; });
});

// FETCH PRODUCTS
onValue(ref(db, 'products'), (snap) => {
  const list = document.getElementById('productsList'); 
  list.innerHTML = '';
  const data = snap.val();
  for (let key in data) {
    list.innerHTML += `
      <div class="item-box">
        <div class="item-info">
          <h4>${data[key].title}</h4>
          <p>₹${data[key].price}</p>
        </div>
        <div class="actions">
          <button class="btn-edit" data-id="${key}">Edit</button>
          <button class="btn-delete" data-id="${key}">Delete</button>
        </div>
      </div>`;
  }
  
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => editProduct(e.target.dataset.id));
  });
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => deleteProduct(e.target.dataset.id));
  });
});

// FETCH SETTINGS (PAYMENTS & THEME)
onValue(ref(db, 'settings/payment'), (snap) => {
  const d = snap.val(); 
  if(d){
    document.getElementById('pay_upi').value = d.upi || '';
    document.getElementById('pay_paypal').value = d.paypal || '';
    document.getElementById('pay_crypto').value = d.crypto || '';
  }
});

onValue(ref(db, 'settings/theme'), (snap) => {
  const d = snap.val(); 
  if(d){
    document.getElementById('theme_heroBg').value = d.heroBg || '';
  }
});

// FETCH PENDING ORDERS
onValue(ref(db, 'orders'), (snap) => {
  const list = document.getElementById('ordersList'); 
  list.innerHTML = '';
  const data = snap.val(); 
  let hasPending = false;
  
  if(data){
    for(let key in data){
      if(data[key].status === 'pending'){
        hasPending = true;
        list.innerHTML += `
          <div class="item-box utr-item">
            <div class="item-info">
              <h4>Ref: ${data[key].utr}</h4>
              <p>${data[key].amount} | ${data[key].productName}</p>
            </div>
            <div class="actions">
              <button class="btn-approve" data-id="${key}" data-status="approved">Approve</button>
              <button class="btn-delete" data-id="${key}" data-status="rejected">Reject</button>
            </div>
          </div>`;
      }
    }
  }
  if(!hasPending) list.innerHTML = '<p style="color:var(--text-muted); font-size:14px;">No pending requests.</p>';

  document.querySelectorAll('.btn-approve, .btn-delete').forEach(btn => {
    if(btn.hasAttribute('data-status')) {
      btn.addEventListener('click', (e) => {
        updateOrder(e.target.dataset.id, e.target.dataset.status);
      });
    }
  });
});

// ACTIONS
document.getElementById('saveProductBtn').addEventListener('click', () => {
  let id = document.getElementById('p_id').value || 'soft_' + Date.now();
  set(ref(db, 'products/' + id), {
    id: id, 
    title: document.getElementById('p_title').value, 
    price: Number(document.getElementById('p_price').value),
    category: document.getElementById('p_category').value, 
    desc: document.getElementById('p_desc').value,
    poster: document.getElementById('p_poster').value, 
    downloadUrl: document.getElementById('p_download').value
  }).then(() => { 
    document.querySelectorAll('input:not(#pay_upi):not(#pay_paypal):not(#pay_crypto):not(#theme_heroBg), textarea').forEach(inp => inp.value = '');
    document.getElementById('formTitle').innerHTML = "Add / Edit Product";
    document.getElementById('cancelEditBtn').style.display = 'none';
  });
});

function editProduct(id) {
  onValue(ref(db, 'products/' + id), (snap) => {
    const p = snap.val();
    document.getElementById('p_id').value = id;
    document.getElementById('p_title').value = p.title;
    document.getElementById('p_price').value = p.price;
    document.getElementById('p_category').value = p.category;
    document.getElementById('p_desc').value = p.desc;
    document.getElementById('p_poster').value = p.poster;
    document.getElementById('p_download').value = p.downloadUrl || '';
    
    document.getElementById('formTitle').innerHTML = "<span style='color:var(--accent)'>✏️ Edit Mode</span>";
    document.getElementById('cancelEditBtn').style.display = 'block';
  }, {onlyOnce: true});
}

document.getElementById('cancelEditBtn').addEventListener('click', () => {
    document.querySelectorAll('input:not(#pay_upi):not(#pay_paypal):not(#pay_crypto):not(#theme_heroBg), textarea').forEach(inp => inp.value = '');
    document.getElementById('formTitle').innerHTML = "Add / Edit Product";
    document.getElementById('cancelEditBtn').style.display = 'none';
});

document.getElementById('savePaymentsBtn').addEventListener('click', () => {
  set(ref(db, 'settings/payment'), { 
    upi: document.getElementById('pay_upi').value, 
    paypal: document.getElementById('pay_paypal').value, 
    crypto: document.getElementById('pay_crypto').value 
  }).then(() => {
      const btn = document.getElementById('savePaymentsBtn');
      btn.innerHTML = "Saved! ✓";
      setTimeout(() => btn.innerHTML = "Update Gateways", 2000);
  });
});

// 🔥 NEW: SAVE THEME LOGIC 🔥
document.getElementById('saveThemeBtn').addEventListener('click', () => {
  set(ref(db, 'settings/theme'), { 
    heroBg: document.getElementById('theme_heroBg').value
  }).then(() => {
      const btn = document.getElementById('saveThemeBtn');
      btn.innerHTML = "Saved! ✓";
      setTimeout(() => btn.innerHTML = "Update Theme", 2000);
  });
});

function updateOrder(id, status) { update(ref(db, 'orders/' + id), { status: status }); }
function deleteProduct(id) { if(confirm("Are you sure you want to delete this product?")) { remove(ref(db, 'products/' + id)); } }
