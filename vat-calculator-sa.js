const VAT_RATE = 0.15;
  const MAX_DIGITS = 12;

  function fmt(n) {
    return 'R' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function sanitize(raw) {
    // Replace comma-as-decimal (e.g. 10,50 → 10.50)
    let s = raw.replace(/,(?=\d{1,2}$)/, '.');
    // Strip non-numeric except one dot
    s = s.replace(/[^0-9.]/g, '');
    const parts = s.split('.');
    if (parts.length > 2) s = parts[0] + '.' + parts.slice(1).join('');
    // Limit digits before decimal
    if (parts[0] && parts[0].length > MAX_DIGITS) {
      s = parts[0].slice(0, MAX_DIGITS) + (parts[1] !== undefined ? '.' + parts[1] : '');
    }
    return s;
  }

  function animateValue(el, newText) {
    el.textContent = newText;
    el.classList.remove('updated');
    void el.offsetWidth; // reflow
    el.classList.add('updated');
  }

  // --- ADD VAT ---
  const addInput = document.getElementById('add-input');
  const addBtn = document.getElementById('add-btn');
  const addError = document.getElementById('add-error');
  const addOriginalEl = document.getElementById('add-original');
  const addVatEl = document.getElementById('add-vat');
  const addTotalEl = document.getElementById('add-total');

  function calcAdd() {
    addError.textContent = '';
    const raw = addInput.value.trim();
    if (!raw || raw === '') {
      animateValue(addOriginalEl, 'R0.00');
      animateValue(addVatEl, 'R0.00');
      animateValue(addTotalEl, 'R0.00');
      return;
    }
    let val = parseFloat(sanitize(raw));
    if (isNaN(val)) {
      addError.textContent = 'Please enter a valid amount.';
      return;
    }
    if (val < 0) {
      val = Math.abs(val);
      addInput.value = val;
    }
    const vatAmount = val * VAT_RATE;
    const total = val + vatAmount;
    animateValue(addOriginalEl, fmt(val));
    animateValue(addVatEl, fmt(vatAmount));
    animateValue(addTotalEl, fmt(total));
  }

  addInput.addEventListener('input', () => { calcAdd(); });
  addInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') calcAdd(); });
  addBtn.addEventListener('click', calcAdd);

  // --- REMOVE VAT ---
  const removeInput = document.getElementById('remove-input');
  const removeBtn = document.getElementById('remove-btn');
  const removeError = document.getElementById('remove-error');
  const removeOriginalEl = document.getElementById('remove-original');
  const removeVatEl = document.getElementById('remove-vat');
  const removeTotalEl = document.getElementById('remove-total');

  function calcRemove() {
    removeError.textContent = '';
    const raw = removeInput.value.trim();
    if (!raw || raw === '') {
      animateValue(removeOriginalEl, 'R0.00');
      animateValue(removeVatEl, 'R0.00');
      animateValue(removeTotalEl, 'R0.00');
      return;
    }
    let val = parseFloat(sanitize(raw));
    if (isNaN(val)) {
      removeError.textContent = 'Please enter a valid amount.';
      return;
    }
    if (val < 0) {
      val = Math.abs(val);
      removeInput.value = val;
    }
    const original = val / (1 + VAT_RATE);
    const vatAmount = val - original;
    animateValue(removeOriginalEl, fmt(val));
    animateValue(removeVatEl, fmt(vatAmount));
    animateValue(removeTotalEl, fmt(original));
  }

  removeInput.addEventListener('input', () => { calcRemove(); });
  removeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') calcRemove(); });
  removeBtn.addEventListener('click', calcRemove);

  // --- CLEAR BUTTONS ---
  document.querySelectorAll('.clear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      if (target === 'add') {
        addInput.value = '';
        addError.textContent = '';
        animateValue(addOriginalEl, 'R0.00');
        animateValue(addVatEl, 'R0.00');
        animateValue(addTotalEl, 'R0.00');
        addInput.focus();
      } else {
        removeInput.value = '';
        removeError.textContent = '';
        animateValue(removeOriginalEl, 'R0.00');
        animateValue(removeVatEl, 'R0.00');
        animateValue(removeTotalEl, 'R0.00');
        removeInput.focus();
      }
    });
  });

  // Prevent negative via keyboard
  [addInput, removeInput].forEach(inp => {
    inp.addEventListener('keypress', (e) => {
      if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
    });
  });