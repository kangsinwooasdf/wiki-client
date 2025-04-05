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