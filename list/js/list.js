const baseURL = 'https://wiki-b.glitch.me';

document.addEventListener('DOMContentLoaded', loadList);

async function loadList() {
    try {
        const res = await fetch(`${baseURL}/documents`);
        if (!res.ok) throw new Error('문서를 불러오지 못했습니다.');
        const docs = await res.json();
        const tbody = document.getElementById('doc-list');
        tbody.innerHTML = '';

        Object.entries(docs).forEach(([id, doc]) => {
            const tr = document.createElement('tr');

            const titleCell = document.createElement('td');
            titleCell.textContent = doc.title || '(제목 없음)';

            const actionCell = document.createElement('td');
            actionCell.innerHTML = `
        <button onclick="viewDoc('${id}')">보기</button>
        <button onclick="editDoc('${id}')">수정</button>
        <button onclick="deleteDoc('${id}')">삭제</button>
      `;

            tr.appendChild(titleCell);
            tr.appendChild(actionCell);
            tbody.appendChild(tr);
        });
    } catch (error) {
        alert('목록을 불러오는 데 실패했습니다.');
        console.error(error);
    }
}

function viewDoc(id) {
    window.location.href = `../index/index.html?id=${id}`;
}

function editDoc(id) {
    window.location.href = `../editor/editor.html?id=${id}`;
}

async function deleteDoc(id) {
    if (!confirm('정말로 삭제하시겠습니까?')) return;

    try {
        const res = await fetch(`${baseURL}/documents/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('삭제 실패');
        alert('삭제되었습니다.');
        loadList();
    } catch (err) {
        alert('삭제 중 오류가 발생했습니다.');
        console.error(err);
    }
}