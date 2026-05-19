const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const fs = require('fs');
const path = require('path');

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'));
});

let currentQuestionIndex = -1;
let isFlipped = false;

app.get('/api/random-question', (req, res) => {
    fs.readFile(path.join(__dirname, 'flashcards.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read questions' });
        }
        const questions = JSON.parse(data);
        const randomIndex = Math.floor(Math.random() * questions.length);
        const question = questions[randomIndex];
        currentQuestionIndex = randomIndex;
        isFlipped = false;
        res.json({ question: question.frage });
    });
});

app.get('/api/answer', (req, res) => {
    const questionId = currentQuestionIndex;
    fs.readFile(path.join(__dirname, 'flashcards.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read questions' });
        }
        const questions = JSON.parse(data);
        const question = questions[questionId];
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        isFlipped = true;
        res.json({ antwort: question.antwort });
        console.log(`Frage: ${question.frage} | Antwort: ${question.antwort} | Index: ${questionId}`);
    });
});

app.get('/api/is-flipped', (req, res) => {
    res.json({ isFlipped});
});


app.listen(port, () => {
    console.log(`Example app listening at ${port}`);
});