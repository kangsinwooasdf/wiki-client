function goToList() {
    window.location.href = '/list/list.html'; // 문서 목록
}

function goToEditor() {
    window.location.href = '/editor/editor.html'; // 새 문서 작성
}

document.getElementById('search').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
            window.location.href = `/index/index.html?search=${encodeURIComponent(query)}`;
        }
    }
});  