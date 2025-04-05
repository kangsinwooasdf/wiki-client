const baseURL = 'https://wiki-b.glitch.me';

async function loadRecentChanges() {
  try {
    const res = await fetch(`${baseURL}/documents`);
    if (!res.ok) throw new Error('문서 불러오기 실패');
    const docs = await res.json();

    const sorted = Object.entries(docs)
      .filter(([_, doc]) => doc.updatedAt)
      .sort((a, b) => new Date(b[1].updatedAt) - new Date(a[1].updatedAt))
      .slice(0, 5); // 최근 5개만

    const list = document.querySelector('.recent-list');
    list.innerHTML = '';

    sorted.forEach(([id, doc]) => {
      const li = document.createElement('li');
      li.classList.add('recent-item');
      li.innerHTML = `
        <a href="/index/index.html?id=${id}">${doc.title}</a>
        <span class="recent-time">${formatTimeAgo(doc.updatedAt)}</span>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error('최근 변경 문서 로딩 실패:', err);
  }
}

function formatTimeAgo(dateStr) {
  const now = new Date();
  const updated = new Date(dateStr);
  const diff = Math.floor((now - updated) / 60000); // 분 단위

  if (diff < 1) return '방금 전';
  if (diff < 60) return `${diff}분 전`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

loadRecentChanges();

function goToList() {
    window.location.href = '/list/list.html';
}

function goToEditor() {
    window.location.href = '/editor/editor.html';
}

document.getElementById('search').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
            window.location.href = `/index/index.html?search=${encodeURIComponent(query)}`;
        }
    }
});  