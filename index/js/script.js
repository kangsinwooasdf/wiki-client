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
    render(data.content);
  } catch (e) {
    preview.innerHTML = "<p>문서를 불러오는 데 실패했습니다.</p>";
    console.error(e);
  }
}

function render(text) {
  const formatted = text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/<img src="(.*?)" alt="(.*?)">/gim, '<img src="$1" alt="$2">')
    .replace(/\n/g, '<br>');
  preview.innerHTML = formatted;
  generateTOC();
}

function generateTOC() {
  toc.innerHTML = '';
  const headings = preview.querySelectorAll('h1, h2, h3');
  headings.forEach((heading, index) => {
    const id = `section-${index}`;
    heading.id = id;
    const li = document.createElement('li');
    li.textContent = heading.textContent;
    li.style.marginLeft =
      heading.tagName === 'H2' ? '10px' :
      heading.tagName === 'H3' ? '20px' : '0';
    li.onclick = () => {
      document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
    };
    toc.appendChild(li);
  });
}

function goToEditor() {
  if (currentId) {
    window.location.href = `editor.html?id=${currentId}`;
  } else {
    window.location.href = '/editor/editor.html';
  }
}

function deleteDoc() {
  if (!confirm('정말 이 문서를 삭제하시겠습니까?')) return;
  fetch(`${baseURL}/documents/${currentId}`, {
    method: 'DELETE'
  }).then(() => {
    alert('문서가 삭제되었습니다.');
    window.location.href = 'list.html';
  }).catch(err => {
    alert('삭제 중 오류가 발생했습니다.');
    console.error(err);
  });
}

function goToList() {
  window.location.href = '/list/list.html';
}

loadDocument();