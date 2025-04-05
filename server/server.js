const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'documents.json');

app.use(cors());
app.use(express.json());

// 파일 초기화 (존재하지 않으면 생성)
async function initDB() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({}), 'utf-8');
  }
}

// JSON 파일 읽기
async function readDB() {
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// JSON 파일 쓰기
async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// 문서 생성
app.post('/documents', async (req, res) => {
  try {
    const data = await readDB();
    const id = Date.now().toString();
    data[id] = {
      title: req.body.title || '제목 없음',
      content: req.body.content || ''
    };
    await writeDB(data);
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: '문서 생성 실패', detail: err.message });
  }
});

// 문서 조회
app.get('/documents/:id', async (req, res) => {
  try {
    const data = await readDB();
    const doc = data[req.params.id];
    if (doc) {
      res.json(doc);
    } else {
      res.status(404).json({ error: '문서를 찾을 수 없습니다.' });
    }
  } catch (err) {
    res.status(500).json({ error: '문서 조회 실패', detail: err.message });
  }
});

// 문서 수정
app.put('/documents/:id', async (req, res) => {
  try {
    const data = await readDB();
    const id = req.params.id;
    if (data[id]) {
      data[id].title = req.body.title || data[id].title;
      data[id].content = req.body.content || '';
      await writeDB(data);
      res.json({ message: '문서가 수정되었습니다.' });
    } else {
      res.status(404).json({ error: '문서를 찾을 수 없습니다.' });
    }
  } catch (err) {
    res.status(500).json({ error: '문서 수정 실패', detail: err.message });
  }
});

// 문서 목록
app.get('/documents', async (req, res) => {
  try {
    const data = await readDB();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '목록 조회 실패', detail: err.message });
  }
});

// 문서 삭제
app.delete('/documents/:id', async (req, res) => {
  try {
    const data = await readDB();
    const id = req.params.id;
    if (data[id]) {
      delete data[id];
      await writeDB(data);
      res.json({ message: '문서가 삭제되었습니다.' });
    } else {
      res.status(404).json({ error: '문서를 찾을 수 없습니다.' });
    }
  } catch (err) {
    res.status(500).json({ error: '문서 삭제 실패', detail: err.message });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
  });
});