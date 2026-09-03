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
  renderProducts();
  renderSummary();
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
  summaryTbody.innerHTML = '';
  if (productos.length === 0) {
    summaryTbody.innerHTML = '<tr><td colspan="3" class="empty">No hay productos para resumir.</td></tr>';
    return;
  }

  productos.forEach((p) => {
    const tr = document.createElement('tr');

    const btnBuy = document.createElement('button');
    btnBuy.className = 'btn small';
    btnBuy.textContent = 'Comprar';
    btnBuy.onclick = () => buyProduct(p);

    const tdBuy = document.createElement('td');
    tdBuy.appendChild(btnBuy);

    tr.innerHTML = `
      <td>${escapeHtml(p.nombre)}</td>
      <td>${p.stock}</td>
    `;
    tr.appendChild(tdBuy);
    summaryTbody.appendChild(tr);
  });
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
  if (p.stock <= 0) {
    showToast('Error: Stock insuficiente para comprar "' + p.nombre + '".', 'error');
    return;
  }
  p.stock -= 1;
  persist();
  render();
  showToast('Has comprado 1 unidad de "' + p.nombre + '". Stock restante: ' + p.stock + '.', 'success');
}

cancelBtn.addEventListener('click', resetForm);

load();
render();
