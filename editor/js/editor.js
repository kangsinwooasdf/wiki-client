const baseURL = 'https://wiki-b.glitch.me';
const params = new URLSearchParams(window.location.search);
const docId = params.get('id');

document.addEventListener('DOMContentLoaded', () => {
    if (docId) loadDocument();

    const editor = document.getElementById('editor');
    editor.addEventListener('input', updateLineNumbers);
    editor.addEventListener('scroll', () => {
        document.getElementById('line-numbers').scrollTop = editor.scrollTop;
    });

});

async function loadDocument() {
    try {
        const res = await fetch(`${baseURL}/documents/${docId}`);
        if (!res.ok) throw new Error('문서를 찾을 수 없습니다.');
        const data = await res.json();
        document.getElementById('title').value = data.title || '';
        document.getElementById('editor').textContent = data.content || '';
        updateLineNumbers();
    } catch (err) {
        alert('문서를 불러오는 데 실패했습니다.');
        console.error(err);
    }
}

async function saveDocument() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('editor').innerText;

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
        window.location.href = `/index/index.html?id=${data.id}`;
    } catch (err) {
        alert('문서를 저장하는 데 실패했습니다.');
        console.error(err);
    }
}

function getRenderedLineCount() {
    const editor = document.getElementById('editor');

    const range = document.createRange();
    range.selectNodeContents(editor);
    const rects = Array.from(range.getClientRects());

    const uniqueLines = [];

    rects.forEach(rect => {
        const last = uniqueLines[uniqueLines.length - 1];
        if (!last || Math.abs(last - rect.top) > 1) {
            uniqueLines.push(rect.top);
        }
    });

    return uniqueLines.length || 1;
}


function updateLineNumbers() {
    const lineNumberElem = document.getElementById('line-numbers');
    const lines = getRenderedLineCount();

    lineNumberElem.innerHTML = '';
    for (let i = 1; i <= lines; i++) {
        const lineDiv = document.createElement('div');
        lineDiv.textContent = i;
        lineNumberElem.appendChild(lineDiv);
    }
}