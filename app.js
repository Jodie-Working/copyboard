// Copy Board App
// - LocalStorage persistence
// - Tags filter, search
// - Pin (star) to top
// - Import / Export JSON
// - Copy count tracking

const STORAGE_KEY = 'copyboard_items_v2';

// State
let items = [];
let selectedTags = new Set();
let searchText = '';
let pinnedFirst = true;

// Elements
const searchInput = document.getElementById('searchInput');
const togglePinnedFirstBtn = document.getElementById('togglePinnedFirstBtn');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFileInput');
const clearAllBtn = document.getElementById('clearAllBtn');
const newTextInput = document.getElementById('newTextInput');
const newTagsInput = document.getElementById('newTagsInput');
const addBtn = document.getElementById('addBtn');
const tagFiltersEl = document.getElementById('tagFilters');
const itemsListEl = document.getElementById('itemsList');

// Utils
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    items = raw ? JSON.parse(raw) : [];
    // normalize
    items = items.map(it => ({
      id: it.id ?? uuid(),
      text: String(it.text ?? '').trim(),
      tags: Array.isArray(it.tags) ? it.tags.map(t => String(t).trim()).filter(Boolean) : [],
      pinned: Boolean(it.pinned),
      createdAt: typeof it.createdAt === 'number' ? it.createdAt : Date.now(),
      copyCount: typeof it.copyCount === 'number' ? it.copyCount : 0
    }));
  } catch (e) {
    console.error('Load failed', e);
    items = [];
  }
}

// Rendering
function render() {
  renderTagFilters();
  renderItems();
}

function renderTagFilters() {
  const tagMap = new Map();
  items.forEach(it => {
    (it.tags || []).forEach(rawTag => {
      const tag = String(rawTag || '').trim();
      if (!tag) return;
      const key = tag.toLowerCase();
      const existing = tagMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        tagMap.set(key, { count: 1, label: tag });
      }
    });
  });

  const tags = Array.from(tagMap.entries()).map(([key, val]) => ({
    key, label: val.label, count: val.count
  }));
  tags.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label, 'zh-HK');
  });

  tagFiltersEl.innerHTML = '';
  if (tags.length === 0) {
    tagFiltersEl.innerHTML = '<div class="text-muted small">尚未有標籤</div>';
    return;
  }

  tags.forEach(t => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-tag';
    btn.dataset.tag = t.key;
    btn.innerHTML = `<span>${escapeHtml(t.label)}</span> <span class="badge">${t.count}</span>`;
    if (selectedTags.has(t.key)) btn.classList.add('active');
    btn.addEventListener('click', () => {
      if (selectedTags.has(t.key)) selectedTags.delete(t.key);
      else selectedTags.add(t.key);
      renderItems();
      renderTagFilters();
    });
    tagFiltersEl.appendChild(btn);
  });

  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'btn';
  clear.textContent = '清除已選標籤';
  clear.addEventListener('click', () => {
    selectedTags.clear();
    render();
  });
  tagFiltersEl.appendChild(clear);
}

function renderItems() {
  const q = searchText.toLowerCase().trim();
  const tagSet = selectedTags;

  let filtered = items.filter(it => {
    const textMatch = it.text.toLowerCase().includes(q);
    const tagsMatch =
      tagSet.size === 0 ||
      it.tags.some(t => tagSet.has(String(t).toLowerCase()));
    return textMatch && tagsMatch;
  });

  filtered.sort((a, b) => {
    // 先按置頂
    if (pinnedFirst) {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
    }
    // 再按 copyCount
    if ((b.copyCount || 0) !== (a.copyCount || 0)) {
      return (b.copyCount || 0) - (a.copyCount || 0);
    }
    // 最後按建立時間
    return b.createdAt - a.createdAt;
  });

  itemsListEl.innerHTML = '';
  if (filtered.length === 0) {
    itemsListEl.innerHTML = '<div class="text-muted">沒有符合條件的詞條</div>';
    return;
  }

  filtered.forEach(it => {
    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'card-header';

    const title = document.createElement('div');
    title.innerHTML = `<div>${escapeHtml(it.text)}</div>
                       <div class="text-muted small">建立時間：${new Date(it.createdAt).toLocaleString()}</div>
                       <div class="text-muted small">複製次數：${it.copyCount || 0}</div>`;

    const starBtn = document.createElement('button');
    starBtn.className = 'icon-btn';
    starBtn.title = it.pinned ? '取消置頂' : '置頂';
    starBtn.innerHTML = it.pinned ? '⭐' : '☆';
    starBtn.addEventListener('click', () => {
      it.pinned = !it.pinned;
      save();
      render();
    });

    header.appendChild(title);
    header.appendChild(starBtn);

    const tagsEl = document.createElement('div');
    tagsEl.className = 'card-tags';
    if (it.tags.length) {
      it.tags.forEach(t => {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = t;
        tagsEl.appendChild(badge);
      });
    } else {
      const no = document.createElement('span');
      no.className = 'badge';
      no.textContent = '無標籤';
      tagsEl.appendChild(no);
    }

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn';
    copyBtn.textContent = '複製';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(it.text);
        it.copyCount = (it.copyCount || 0) + 1; // 每次複製 +1
        save();
        render();
      } catch (e) {
        alert('複製失敗：' + e.message);
      }
    });

    const editBtn = document.createElement('button');
    editBtn.className = 'btn';
    editBtn.textContent = '修改';
    editBtn.addEventListener('click', () => {
      const newText = prompt('請輸入新文字：', it.text);
      if (newText == null) return;
      const tagsStr = prompt('請輸入新標籤（逗號分隔）：', it.tags.join(','));
      if (tagsStr == null) return;
      const nextTags = tagsStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      it.text = String(newText).trim();
      it.tags = nextTags;
      save();
      render();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = '刪除';
    deleteBtn.addEventListener('click', () => {
      if (!confirm('確認刪除此詞條？')) return;
      items = items.filter(x => x.id !== it.id);
      save();
      render();
    });

    actions.appendChild(copyBtn
