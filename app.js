// app.js for Copy Board - stable version with modal edit and event delegation
(() => {
  const STORAGE_KEY = 'copyBoard.items';
  const itemsEl = document.getElementById('items');
  const template = document.getElementById('itemTemplate');
  const addBtn = document.getElementById('addBtn');
  const newText = document.getElementById('newText');
  const newTags = document.getElementById('newTags');
  const searchInput = document.getElementById('searchInput');
  const exportBtn = document.getElementById('exportBtn');
  const importFile = document.getElementById('importFile');
  const clearAllBtn = document.getElementById('clearAllBtn');

  const editModalEl = document.getElementById('editModal');
  const bootstrapModal = new bootstrap.Modal(editModalEl);
  const editText = document.getElementById('editText');
  const editTags = document.getElementById('editTags');
  const editItemId = document.getElementById('editItemId');
  const saveEditBtn = document.getElementById('saveEditBtn');

  let items = loadItems();

  function loadItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Load items failed', e);
      return [];
    }
  }

  function saveItems() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Save items failed', e);
    }
  }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function parseTags(text) {
    if (!text) return [];
    if (Array.isArray(text)) return text.map(t => String(t).trim()).filter(Boolean);
    return String(text).split(',').map(t => t.trim()).filter(Boolean);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function renderItems() {
    const q = searchInput.value.trim().toLowerCase();
    itemsEl.innerHTML = '';
    const filtered = items.filter(item => {
      if (!q) return true;
      if (item.text && item.text.toLowerCase().includes(q)) return true;
      if ((item.tags || []).some(t => t.toLowerCase().includes(q))) return true;
      return false;
    });

    if (filtered.length === 0) {
      itemsEl.innerHTML = `<div class="col-12"><div class="text-muted small">無相符項目</div></div>`;
      return;
    }

    filtered.forEach(item => {
      const node = template.content.cloneNode(true);
      const col = node.querySelector('.item-col');
      const textP = node.querySelector('.item-text');
      const tagsDiv = node.querySelector('.item-tags');

      // attach id for delegation
      col.dataset.itemId = item.id;

      textP.textContent = item.text || '';
      tagsDiv.innerHTML = (item.tags || []).map(t => `<span class="badge bg-secondary me-1">${escapeHtml(t)}</span>`).join(' ');

      itemsEl.appendChild(node);
    });
  }

  // Event delegation for copy / edit / delete
  itemsEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const col = btn.closest('.item-col');
    if (!col) return;
    const id = col.dataset.itemId;
    const item = items.find(i => i.id === id);
    if (!item) return;

    if (btn.classList.contains('copy-btn')) {
      // Copy text
      try {
        await navigator.clipboard.writeText(item.text);
        const old = btn.textContent;
        btn.textContent = '已複製';
        btn.classList.remove('btn-outline-secondary');
        btn.classList.add('btn-success');
        setTimeout(() => {
          btn.textContent = old;
          btn.classList.remove('btn-success');
          btn.classList.add('btn-outline-secondary');
        }, 1200);
      } catch (err) {
        console.error('copy failed', err);
        alert('複製失敗：瀏覽器不支援剪貼簿或權限被拒絕');
      }
      return;
    }

    if (btn.classList.contains('delete-btn')) {
      if (!confirm('確定要刪除此條目？')) return;
      items = items.filter(i => i.id !== id);
      saveItems();
      renderItems();
      return;
    }

    if (btn.classList.contains('edit-btn')) {
      // open modal with values
      editItemId.value = item.id;
      editText.value = item.text || '';
      editTags.value = (item.tags || []).join(', ');
      bootstrapModal.show();
      return;
    }
  });

  // Save edited item
  saveEditBtn.addEventListener('click', () => {
    const id = editItemId.value;
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) {
      alert('找不到要編輯的項目');
      bootstrapModal.hide();
      return;
    }
    const newText = editText.value.trim();
    if (!newText) {
      alert('內容不能為空');
      return;
    }
    const newTags = parseTags(editTags.value);
    items[idx].text = newText;
    items[idx].tags = newTags;
    items[idx].updatedAt = new Date().toISOString();
    saveItems();
    bootstrapModal.hide();
    renderItems();
  });

  // Add new item
  addBtn.addEventListener('click', () => {
    const text = newText.value.trim();
    if (!text) {
      alert('請輸入要儲存的文字');
      return;
    }
    const tags = parseTags(newTags.value);
    const item = { id: uid(), text, tags, createdAt: new Date().toISOString() };
    items.unshift(item);
    saveItems();
    newText.value = '';
    newTags.value = '';
    renderItems();
  });

  // Search
  searchInput.addEventListener('input', () => {
    renderItems();
  });

  // Export
  exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'copy-board-export.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // Import
  importFile.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        let array = [];
        if (Array.isArray(parsed)) array = parsed;
        else if (parsed && Array.isArray(parsed.items)) array = parsed.items;
        else throw new Error('JSON 必須是一個陣列或包含 items 陣列的物件');

        const sanitized = array.map(p => ({
          id: p.id || uid(),
          text: String(p.text || '').trim(),
          tags: Array.isArray(p.tags) ? p.tags.map(t => String(t)) : parseTags(p.tags || ''),
          createdAt: p.createdAt || new Date().toISOString()
        })).filter(i => i.text);

        // prepend imported items
        items = sanitized.concat(items);
        saveItems();
        renderItems();
        importFile.value = '';
        alert('匯入完成');
      } catch (err) {
        console.error('import failed', err);
        alert('匯入失敗：' + (err.message || '無效的 JSON'));
      }
    };
    reader.readAsText(f, 'utf-8');
  });

  // Clear all
  clearAllBtn.addEventListener('click', () => {
    if (!confirm('確定要清除所有儲存？此動作無法復原。')) return;
    items = [];
    saveItems();
    renderItems();
  });

  // initial render
  renderItems();
})();
