// app.js for Copy Board - with edit functionality

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function uid() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function parseTags(text) {
    if (!text)

