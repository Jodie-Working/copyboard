/* Copy Board - 前端邏輯 (localStorage) */
(() => {
  const STORAGE_KEY = 'copyboard_phrases_v1';

  // DOM
  const searchInput = document.getElementById('searchInput');
  const newText = document.getElementById('newText');
  const newTags = document.getElementById('newTags');
  const addBtn = document.getElementById('addBtn');
  const itemsEl = document.getElementById('items');
  const itemTemplate = document.getElementById('itemTemplate');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importFile = document.getElementById('importFile');

  let phrases = [];

  // util: load & save
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      phrases = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('load error', e);
      phrases = [];
    }
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
  }

  // render list, optional filter
  function render(filter = '') {
    itemsEl.innerHTML = '';
    const q = filter.trim().toLowerCase();
    const toShow = phrases.filter(p => {
      if (!q) return true;
      return p.text.toLowerCase().includes(q) || (p.tags||[]).some(t => t.toLowerCase().includes(q));
    });

    if (toShow.length === 0) {
      itemsEl.innerHTML = '<div class="col-12"><div class="alert alert-secondary small mb-0">暫無項目</div></div>';
      return;
    }

    for (let i = 0; i < toShow.length; i++) {
      const p = toShow[i];
      const node = itemTemplate.content.cloneNode(true);
      const wrapper = node.querySelector('.col-12');
      const textEl = node.querySelector('.item-text');
      const tagsEl = node.querySelector('.item-tags');
      const copyBtn = node.querySelector('.copy-btn');
      const delBtn = node.querySelector('.delete-btn');

      textEl.textContent = p.text;
      tagsEl.textContent = (p.tags && p.tags.length) ? '標籤：' + p.tags.join(', ') : '';

      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(p.text);
          copyBtn.textContent = '已複製';
          copyBtn.classList.remove('btn-outline-secondary');
          copyBtn.classList.add('btn-success');
          setTimeout(() => {
            copyBtn.textContent = '複製';
            copyBtn.classList.remove('btn-success');
            copyBtn.classList.add('btn-outline-secondary');
          }, 1200);
        } catch (e) {
          alert('複製失敗：' + e);
        }
      });

      delBtn.addEventListener('click', () => {
        if (!confirm('確定刪除這個常用語？')) return;
        const globalIndex = phrases.indexOf(p);
        if (globalIndex >= 0) {
          phrases.splice(globalIndex, 1);
          save();
          render(searchInput.value);
        }
      });

      itemsEl.appendChild(node);
    }
  }

  // add new
  function addPhrase() {
    const text = newText.value.trim();
    if (!text) return;
    const tags = newTags.value.split(',').map(s => s.trim()).filter(Boolean);
    phrases.unshift({ text, tags, created_at: new Date().toISOString() });
    save();
    newText.value = '';
    newTags.value = '';
    render(searchInput.value);
  }

  // clear all
  function clearAll() {
    if (!confirm('清除所有儲存的常用語？此操作不可復原。')) return;
    phrases = [];
    save();
    render();
  }

  // export JSON
  function exportJSON() {
    const blob = new Blob([JSON.stringify(phrases, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'copyboard_export.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // import JSON
  function importJSONFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error('格式錯誤');
        // 合併：把匯入項目加到現有最前方
        phrases = data.concat(phrases);
        save();
        render(searchInput.value);
        alert('匯入完成：' + data.length + ' 個項目已加入。');
      } catch (e) {
        alert('匯入失敗：' + e.message);
      }
    };
    reader.readAsText(file);
  }

  // events
  addBtn.addEventListener('click', addPhrase);
  newText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') addPhrase();
  });
  searchInput.addEventListener('input', () => render(searchInput.value));
  clearAllBtn.addEventListener('click', clearAll);
  exportBtn.addEventListener('click', exportJSON);
  importFile.addEventListener('change', (e) => {
    if (e.target.files.length) {
      importJSONFile(e.target.files[0]);
      e.target.value = '';
    }
  });

  // init
  load();
  render();
})();
