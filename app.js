// 假設全局有 items 陣列，每個 item 有 tags 屬性
// 假設全局有 selectedTags (Set) 同 tagFiltersEl (DOM 元素)

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function(m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m];
  });
}

function renderTagFilters() {
  // 建立 tag => {count, labelExample} 嘅 map
  const tagMap = new Map();

  items.forEach(it => {
    (it.tags || []).forEach(rawTag => {
      const tag = String(rawTag || '').trim();
      if (!tag) return;
      const key = tag.toLowerCase(); // 用小寫 key 做比較
      const existing = tagMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        tagMap.set(key, { count: 1, label: tag });
      }
    });
  });

  // 轉成陣列並排序：先按 count desc，再按 label
  const tags = Array.from(tagMap.entries()).map(([key, val]) => ({
    key,
    label: val.label,
    count: val.count
  }));

  tags.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label, 'zh-HK');
  });

  // 清空 DOM
  tagFiltersEl.innerHTML = '';

  if (tags.length === 0) {
    tagFiltersEl.innerHTML = '<div class="text-muted small">尚未有標籤</div>';
    return;
  }

  // 建立每個 tag 按鈕
  tags.forEach(t => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-tag btn-sm';
    btn.dataset.tag = t.key; // 用小寫 key 做比較
    btn.innerHTML = `<span class="tag-label">${escapeHtml(t.label)}</span> 
                     <span class="tag-count badge bg-white text-muted ms-2">${t.count}</span>`;
    if (selectedTags.has(t.key)) {
      btn.classList.add('active');
    }
    tagFiltersEl.appendChild(btn);
  });

  // 加「清除已選標籤」按鈕
  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'btn btn-outline-secondary btn-sm ms-2';
  clear.id = 'clearSelectedTagsBtn';
  clear.textContent = '清除已選標籤';
  tagFiltersEl.appendChild(clear);
}
