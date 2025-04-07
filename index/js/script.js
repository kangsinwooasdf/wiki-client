document.addEventListener('DOMContentLoaded', () => {
  const baseURL = 'https://wiki-b.glitch.me';
  const preview = document.getElementById('preview');
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
      preview.innerTest = "<p>문서 ID가 없습니다.</p>";
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
      preview.innerHTML = "<p>문서를 불러오는 데 실패햇다다.</p>";
      console.error("문서 불러오기 오류:", e);
    }
  }

  function renderContent(rawText) {
    const footnotes = {};
    let footnoteIndex = 1;
  
    let formatted = rawText
      .replace(/\[\*([^\s\]]*)\s?(.*?)\]/g, (_, name, content) => {
        if (!name) {
          const id = `fn-${footnoteIndex}`;
          footnotes[id] = content;
          return `<sup id="ref-${id}" title="${content}"><a href="#note-${id}">[${footnoteIndex++}]</a></sup>`;
        } else if (content) {
          footnotes[name] = content;
          return `<sup id="ref-${name}" title="${content}"><a href="#note-${name}">[${name}]</a></sup>`;
        } else {
          const suffix = Object.values(footnotes).filter((_, i) => i.startsWith?.(name)).length + 1;
          const reuseContent = footnotes[name] || '';
          return `<sup id="ref-${name}-${suffix}" title="${reuseContent}"><a href="#note-${name}">[${name}]</a></sup>`;
        }
      })
      .replace(/'''(.*?)'''/g, '<b>$1</b>')
      .replace(/''(.*?)''/g, '<i>$1</i>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/--(.*?)--/g, '<del>$1</del>')
      .replace(/\^\^(.*?)\^\^/g, '<sup>$1</sup>')
      .replace(/,,(.*?),,/g, '<sub>$1</sub>')
      .replace(/{{{\+(\d)\s(.*?)}}}/g, (_, size, text) => `<span style="font-size: ${1 + size * 0.15}em">${text}</span>`)
      .replace(/{{{-(\d)\s(.*?)}}}/g, (_, size, text) => `<span style="font-size: ${1 - size * 0.15}em">${text}</span>`)
      .replace(/{{{#([0-9a-fA-F]{3,6})(?:,[0-9a-fA-F]{3,6})?\s(.*?)}}}/g, '<span style="color: #$1">$2</span>')
      .replace(/{{{\[\[(.*?)\]\]}}}/g, '<code>[$1]</code>')
      .replace(/\[\[(.*?)\|(.*?)\]\]/g, '<a href="#">$2</a>')
      .replace(/\[\[(.*?)\]\]/g, '<a href="#">$1</a>')
      .replace(/^&gt;(.*)/gm, '<blockquote>$1</blockquote>')
      .replace(/<br>(-{4,9})<br>/g, '<hr>')
      .replace(/====== (.*?) ======/g, '<h6>$1</h6><hr>')
      .replace(/===== (.*?) =====/g, '<h5>$1</h5><hr>')
      .replace(/==== (.*?) ====/g, '<h4>$1</h4><hr>')
      .replace(/=== (.*?) ===/g, '<h3>$1</h3><hr>')
      .replace(/== (.*?) ==/g, '<h2>$1</h2><hr>')
      .replace(/(?:<br>)?\* (.*?)(?=<br>|$)/g, '<ul><li>$1</li></ul>')
      .replace(/(?:<br>)?1\. (.*?)(?=<br>|$)/g, '<ol><li>$1</li></ol>')
      .replace(/<\/ul><ul>/g, '')
      .replace(/<\/ol><ol>/g, '')
      .replace(/{{{([+-][1-5])\s(.*?)}}}/g, (_, size, text) => {
        const step = parseInt(size);
        const fontSize = (1 + step * 0.15).toFixed(5);
        return `<span style="font-size: ${fontSize}em">${text}</span>`;
      })
      .replace(/\n/g, '<br>');
  
    const footnoteHtml = `
      <div id="footnotes">
        <ol>
          ${Object.entries(footnotes).map(([id, content]) =>
      `<li id="note-${id}"><a href="#ref-${id}">[${isNaN(id) ? id : footnoteIndex++}]</a> ${content}</li>`).join('\n')}
        </ol>
      </div>
    `;
  
    if (formatted.includes('[각주]') || formatted.includes('[footnote]')) {
      formatted = formatted.replace(/\[(각주|footnote)\]/g, footnoteHtml);
    } else {
      formatted += '<br>' + footnoteHtml;
    }
  
    // 최종 적용
    const preview = document.getElementById('preview') || document.getElementById('preview-content');
    if (preview) {
      preview.innerHTML = formatted;
    } else {
      console.warn('❗ preview 영역을 찾을 수 없습니다.');
    }
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
