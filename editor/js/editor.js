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

function switchTab(tab) {
    const editSec = document.getElementById('editor-section');
    const previewSec = document.getElementById('preview-section');

    if (tab === 'edit') {
        editSec.style.display = 'block';
        previewSec.style.display = 'none';
    } else if (tab === 'preview') {
        editSec.style.display = 'none';
        previewSec.style.display = 'block';
        renderPreviewLikeIndex();
    }
}

function renderPreviewLikeIndex() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('editor').innerHTML;
    // 제목 설정
    document.getElementById('preview-title').textContent = title || '(제목 없음)';

    // 나무마크 스타일 문법 처리
    let formatted = content

        // 굵게 ('''텍스트''')
        .replace(/'''(.*?)'''/g, '<b>$1</b>')

        // 기울임 (''텍스트'')
        .replace(/''(.*?)''/g, '<i>$1</i>')

        // 밑줄 (__텍스트__)
        .replace(/__(.*?)__/g, '<u>$1</u>')

        // 취소선 (~~텍스트~~ 또는 --텍스트--)
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        .replace(/--(.*?)--/g, '<del>$1</del>')

        // 위첨자 (^^텍스트^^)
        .replace(/\^\^(.*?)\^\^/g, '<sup>$1</sup>')

        // 아래첨자 (,,텍스트,,)
        .replace(/,,(.*?),,/g, '<sub>$1</sub>')

        // 크기 조절 ({{{+1 텍스트}}}, {{{-1 텍스트}}})
        .replace(/{{{\+(\d)\s(.*?)}}}/g, (_, size, text) => `<span style="font-size: ${1 + size * 0.15}em">${text}</span>`)
        .replace(/{{{-(\d)\s(.*?)}}}/g, (_, size, text) => `<span style="font-size: ${1 - size * 0.15}em">${text}</span>`)

        // 색상 지정 ({{{#hex 텍스트}}})
        .replace(/{{{#([0-9a-fA-F]{3,6})(?:,[0-9a-fA-F]{3,6})?\s(.*?)}}}/g, '<span style="color: #$1">$2</span>')

        // 고정폭 텍스트 ({{{[[텍스트]]}}})
        .replace(/{{{\[\[(.*?)\]\]}}}/g, '<code>[$1]</code>')

        // 하이퍼링크 [[문서명|출력]]
        .replace(/\[\[(.*?)\|(.*?)\]\]/g, '<a href="#">$2</a>')

        // 하이퍼링크 [[문서명]]
        .replace(/\[\[(.*?)\]\]/g, '<a href="#">$1</a>')

        // 인용문 (> 텍스트)
        .replace(/^&gt;(.*)/gm, '<blockquote>$1</blockquote>')

        // 수평줄 (---- 이상)
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

        // 줄바꿈
        .replace(/\n/g, '<br>');

    const previewContent = document.getElementById('preview-content');
    previewContent.innerHTML = formatted;
}
