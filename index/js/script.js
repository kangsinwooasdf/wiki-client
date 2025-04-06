document.addEventListener('DOMContentLoaded', () => {
  const baseURL = 'https://wiki-b.glitch.me';
  const preview = document.getElementById('preview');
  const toc = document.getElementById('toc');
  const titleElement = document.getElementById('doc-title');
  let currentId = null;

  function getDocIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  async function loadDocument() {
    const id = getDocIdFromURL();
    currentId = id;
    if (!id) {
      preview.innerHTML = "<p>문서 ID가 없습니다.</p>";
      return;
    }
  
    try {
      const res = await fetch(`${baseURL}/documents/${id}`);
      if (!res.ok) throw new Error("문서 없음");
      const data = await res.json();
  
      titleElement.textContent = data.title || '(제목 없음)';
      renderContent(data.content);
  
      const lastUpdated = document.getElementById('last-updated');
      if (data.updatedAt && lastUpdated) {
        lastUpdated.textContent = formatDate(data.updatedAt);
      }
    } catch (e) {
      preview.innerHTML = "<p>문서를 불러오는 데 실패했습니다.</p>";
      console.error("문서 불러오기 오류:", e);
    }
  }

  function renderContent(text) {
    const formatted = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    preview.innerHTML = formatted;

  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  }

  window.goToEditor = function () {
    if (currentId) {
      window.location.href = `/editor/editor.html?id=${currentId}`;
    } else {
      window.location.href = '/editor/editor.html';
    }
  };

  window.deleteDoc = function () {
    if (!confirm('정말 이 문서를 삭제하시겠습니까?')) return;

    fetch(`${baseURL}/documents/${currentId}`, {
      method: 'DELETE'
    })
      .then(() => {
        alert('문서가 삭제되었습니다.');
        window.location.href = '/list/list.html';
      })
      .catch(err => {
        alert('삭제 중 오류가 발생했습니다.');
        console.error(err);
      });
  };

  window.goToList = function () {
    window.location.href = '/list/list.html';
  };

  // ✅ 문서 로딩 시작
  loadDocument();
});
