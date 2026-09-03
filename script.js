const STORAGE_KEY = 'productos';

let productos = [];
let editingId = null;

const form = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const idInput = document.getElementById('product-id');
const nombreInput = document.getElementById('nombre');
const stockInput = document.getElementById('stock');
const precioInput = document.getElementById('precio');
const descripcionInput = document.getElementById('descripcion');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const tbody = document.getElementById('product-tbody');
const summaryTbody = document.getElementById('summary-tbody');
const toast = document.getElementById('toast');

function load() {
  try {
    productos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    productos = [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
}

function formatPrecio(value) {
  return '$' + Number(value).toLocaleString('es-CL');
}

function showToast(message, type) {
  toast.textContent = message;
  toast.className = 'toast ' + type;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.hidden = true; }, 3000);
}

function render() {
  renderStats();
  renderProducts();
  renderSummary();
}

function renderStats() {
  const total = productos.length;
  const available = productos.filter((p) => p.stock > 0).length;
  const out = productos.filter((p) => p.stock <= 0).length;
  const value = productos.reduce((sum, p) => sum + Number(p.precio) * Number(p.stock), 0);

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-available').textContent = available;
  document.getElementById('stat-out').textContent = out;
  document.getElementById('stat-value').textContent = formatPrecio(value);
}

function renderProducts() {
  tbody.innerHTML = '';
  if (productos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No hay productos registrados.</td></tr>';
    return;
  }

  productos.forEach((p) => {
    const tr = document.createElement('tr');

    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn small';
    btnEdit.textContent = 'Editar';
    btnEdit.onclick = () => startEdit(p.id);

    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn small danger';
    btnDelete.textContent = 'Eliminar';
    btnDelete.onclick = () => deleteProduct(p.id);

    const actions = document.createElement('td');
    actions.className = 'actions';
    actions.append(btnEdit, btnDelete);

    tr.innerHTML = `
      <td>${escapeHtml(p.nombre)}</td>
      <td>${p.stock}</td>
      <td>${formatPrecio(p.precio)}</td>
      <td>${escapeHtml(p.descripcion)}</td>
    `;
    tr.appendChild(actions);
    tbody.appendChild(tr);
  });
}

function renderSummary() {
  const totals = summaryTbody.querySelector('.summary-total');
  if (totals) totals.remove();
  summaryTbody.innerHTML = '';
  if (productos.length === 0) {
    summaryTbody.innerHTML = '<tr><td colspan="4" class="empty">No hay productos para resumir.</td></tr>';
    return;
  }

  productos.forEach((p) => {
    const tr = document.createElement('tr');

    const minusBtn = document.createElement('button');
    minusBtn.className = 'btn qty-btn';
    minusBtn.textContent = '−';
    minusBtn.onclick = () => adjustBuyQty(p.id, -1);

    const plusBtn = document.createElement('button');
    plusBtn.className = 'btn qty-btn';
    plusBtn.textContent = '+';
    plusBtn.onclick = () => adjustBuyQty(p.id, 1);

    const qtySpan = document.createElement('span');
    qtySpan.className = 'qty-num';
    qtySpan.id = 'qty-' + p.id;
    qtySpan.textContent = '1';
    if (!p._buyQty) p._buyQty = 1;

    const tdQty = document.createElement('td');
    tdQty.className = 'qty-cell';
    tdQty.append(minusBtn, qtySpan, plusBtn);

    const btnBuy = document.createElement('button');
    btnBuy.className = 'btn small';
    btnBuy.textContent = 'Comprar';
    btnBuy.onclick = () => buyProduct(p);

    const tdBuy = document.createElement('td');
    tdBuy.appendChild(btnBuy);

    const stockCell = document.createElement('td');
    stockCell.className = p.stock <= 0 ? 'stock-badge out' : (p.stock <= 5 ? 'stock-badge low' : 'stock-badge ok');
    stockCell.textContent = p.stock;

    tr.innerHTML = `<td>${escapeHtml(p.nombre)}</td>`;
    tr.appendChild(stockCell);
    tr.appendChild(tdQty);
    tr.appendChild(tdBuy);
    summaryTbody.appendChild(tr);
  });
}

function adjustBuyQty(id, delta) {
  const p = productos.find((x) => x.id === id);
  if (!p) return;
  p._buyQty = (p._buyQty || 1) + delta;
  if (p._buyQty < 1) p._buyQty = 1;
  if (p._buyQty > 99) p._buyQty = 99;
  const span = document.getElementById('qty-' + id);
  if (span) span.textContent = p._buyQty;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function resetForm() {
  editingId = null;
  idInput.value = '';
  form.reset();
  formTitle.textContent = 'Nuevo Producto';
  saveBtn.textContent = 'Guardar Producto';
  cancelBtn.hidden = true;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nombre = nombreInput.value.trim();
  const stock = Number(stockInput.value);
  const precio = Number(precioInput.value);
  const descripcion = descripcionInput.value.trim();

  if (!nombre || stock < 0 || isNaN(precio) || precio <= 0 || !descripcion) {
    showToast('Revise los datos: nombre, stock y descripción son obligatorios y el precio debe ser mayor a 0.', 'error');
    return;
  }

  if (editingId) {
    const p = productos.find((x) => x.id === editingId);
    if (p) {
      p.nombre = nombre;
      p.stock = stock;
      p.precio = precio;
      p.descripcion = descripcion;
    }
    showToast('Producto modificado correctamente.', 'success');
  } else {
    productos.push({
      id: Date.now().toString(),
      nombre,
      stock,
      precio,
      descripcion
    });
    showToast('Producto creado correctamente.', 'success');
  }

  persist();
  resetForm();
  render();
});

function startEdit(id) {
  const p = productos.find((x) => x.id === id);
  if (!p) return;

  editingId = p.id;
  idInput.value = p.id;
  nombreInput.value = p.nombre;
  stockInput.value = p.stock;
  precioInput.value = p.precio;
  descripcionInput.value = p.descripcion;
  formTitle.textContent = 'Editar Producto';
  saveBtn.textContent = 'Guardar Cambios';
  cancelBtn.hidden = false;
  nombreInput.focus();
}

function deleteProduct(id) {
  const p = productos.find((x) => x.id === id);
  if (!p) return;
  if (!confirm('¿Desea eliminar el producto "' + p.nombre + '"?')) return;

  productos = productos.filter((x) => x.id !== id);
  persist();
  render();
  showToast('Producto eliminado.', 'success');
}

function buyProduct(p) {
  const qty = p._buyQty || 1;
  if (p.stock <= 0 || qty > p.stock) {
    showToast('Error: Stock insuficiente para comprar ' + qty + ' unidad(es) de "' + p.nombre + '". Stock disponible: ' + p.stock + '.', 'error');
    return;
  }
  p.stock -= qty;
  p._buyQty = 1;
  persist();
  render();
  showToast('Has comprado ' + qty + ' unidad(es) de "' + p.nombre + '". Stock restante: ' + p.stock + '.', 'success');
}

cancelBtn.addEventListener('click', resetForm);

load();
render();
