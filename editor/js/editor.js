const baseURL = 'https://wiki-b.glitch.me';
const params = new URLSearchParams(window.location.search);
const docId = params.get('id');

document.addEventListener('DOMContentLoaded', () => {
    if (docId) loadDocument();
});

async function loadDocument() {
    try {
        const res = await fetch(`${baseURL}/documents/${docId}`);
        if (!res.ok) throw new Error('문서를 찾을 수 없습니다.');
        const data = await res.json();
        document.getElementById('title').value = data.title || '';
        document.getElementById('editor').value = data.content || '';
    } catch (err) {
        alert('문서를 불러오는 데 실패했습니다.');
        console.error(err);
    }
}

async function saveDocument() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('editor').value;

    try {
        let response, data;
        if (docId) {
            response = await fetch(`${baseURL}/documents/${docId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
            data = { id: docId };
        } else {
            response = await fetch(`${baseURL}/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
            data = await response.json();
        }
        window.location.href = `index.html?id=${data.id}`;
    } catch (err) {
        alert('문서를 저장하는 데 실패했습니다.');
        console.error(err);
    }
}