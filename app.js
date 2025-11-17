// --- replace existing renderTagFilters() in app.js with this version ---
function renderTagFilters() {
  // build a map of tag => {count, labelExample}
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
        // store original-cased example and count
        tagMap.set(key, { count: 1, label: tag });
      }
    });
  });

  // convert to array and sort by count desc then name
  const tags = Array.from(tagMap.entries()).map(([key, val]) => ({ key, label: val.label, count: val.count }));
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
    btn.className = 'btn btn-tag btn-sm';
    btn.dataset.tag = t.key; // use lowercase key for comparisons
    // show label + count badge
    btn.innerHTML = `<span class="tag-label">${escapeHtml(t.label)}</span> <span class="tag-count badge bg-white text-muted ms-2">${t.count}</span>`;
    if (selectedTags.has(t.key)) {
      btn.classList.add('active');
    }
    tagFiltersEl.appendChild(btn);
  });

  // clear selected tags button
  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'btn btn-outline-secondary btn-sm ms-2';
  clear.id = 'clearSelectedTagsBtn';
  clear.textContent = '清除已選標籤';
  tagFiltersEl.appendChild(clear);
}
