function ensureCardStructure(flashcard) {
    if (flashcard.querySelector('.card-inner')) return;

    flashcard.innerHTML = `
        <div class="card-inner">
            <div class="card-face card-front">
                <div class="card-content"></div>
                <div class="card-icon">?</div>
            </div>
            <div class="card-face card-back">
                <div class="card-content"></div>
                <div class="card-icon">✓</div>
            </div>
        </div>
    `;
}

async function flipCard() {
    const flashcard = document.getElementById('flashcard');
    ensureCardStructure(flashcard);

    let isFlipped = false;
    try {
        const data = await fetch('/api/is-flipped').then(res => res.json());
        isFlipped = data.isFlipped;
    } catch (err) {
        console.error('is-flipped error:', err);
    }

    if (!isFlipped) {
        await showAnswer(flashcard);
    } else {
        await getRandomQuestion(flashcard);
    }
}

async function showAnswer(flashcard) {
    ensureCardStructure(flashcard);

    let answer;
    try {
        answer = await fetch('/api/answer').then(res => res.json());
    } catch (err) {
        console.error('answer fetch error:', err);
        return;
    }

    if (!answer || !answer.antwort) {
        console.error('Unerwartete Antwort vom Server:', answer);
        return;
    }

    const backContent = flashcard.querySelector('.card-back .card-content');
    if (backContent) backContent.textContent = answer.antwort;

    // Flip the inner div directly — avoids browser bugs with preserve-3d on <button>
    const cardInner = flashcard.querySelector('.card-inner');
    if (cardInner) cardInner.classList.add('is-flipped');

    const hint = document.querySelector('.card-hint.bottom');
    if (hint) hint.textContent = 'Click to get a new question';
}

async function getRandomQuestion(flashcard) {
    ensureCardStructure(flashcard);

    const cardInner = flashcard.querySelector('.card-inner');
    if (cardInner) cardInner.classList.remove('is-flipped');
    flashcard.classList.remove('new-card');

    let data;
    try {
        data = await fetch('/api/random-question').then(res => res.json());
    } catch (err) {
        console.error('random-question fetch error:', err);
        return;
    }

    const question   = data?.question ?? '';
    const questionId = data?.questionId ?? null;

    const frontContent = flashcard.querySelector('.card-front .card-content');
    const backContent  = flashcard.querySelector('.card-back .card-content');

    if (frontContent) frontContent.textContent = question;
    if (backContent)  backContent.textContent  = '';

    const hint = document.querySelector('.card-hint.bottom');
    if (hint) hint.textContent = 'Click to Flip';

    void flashcard.offsetWidth;
    flashcard.classList.add('new-card');

    const counter = document.getElementById('card-num');
    if (counter && questionId) counter.textContent = `#${questionId}`;
}

getRandomQuestion(document.getElementById('flashcard'));