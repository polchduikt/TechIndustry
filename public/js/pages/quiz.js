/* =========================
   DOM
========================= */

const quizListEl = document.getElementById('quizList');
const quizContainerEl = document.getElementById('quizContainer');

/* =========================
   STATE
========================= */

let currentQuiz = null;
let currentIndex = 0;
let userAnswers = {};

/* =========================
   1. LOAD QUIZ LIST
========================= */

fetch('/api/quiz')
    .then(res => res.json())
    .then(renderQuizList)
    .catch(err => {
        quizListEl.innerHTML = '<p>Не вдалося завантажити тести</p>';
        console.error(err);
    });

function renderQuizList(quizzes) {
    quizListEl.innerHTML = '';
    quizContainerEl.innerHTML = '';

    quizzes.forEach(quiz => {
        const card = document.createElement('div');
        card.className = 'quiz-card';

        card.innerHTML = `
            <h3>${quiz.title}</h3>
            <p>Мінімум для проходження: ${quiz.passingScore}%</p>
            <button>Почати тест</button>
        `;

        card.querySelector('button').onclick = () => loadQuiz(quiz.moduleId);
        quizListEl.appendChild(card);
    });
}

/* =========================
   2. LOAD QUIZ
========================= */

function loadQuiz(moduleId) {
    fetch(`/api/quiz/${moduleId}`)
        .then(res => res.json())
        .then(quiz => renderQuiz(quiz, moduleId))
        .catch(() => {
            quizContainerEl.innerHTML = '<p>Помилка завантаження тесту</p>';
        });
}

function renderQuiz(quiz, moduleId) {
    quizListEl.innerHTML = '';

    currentQuiz = quiz;
    currentQuiz.moduleId = moduleId;
    currentIndex = 0;
    userAnswers = {};

    renderQuestion();
}

/* =========================
   3. PROGRESS BAR
========================= */

function renderProgress() {
    const percent = Math.round(
        ((currentIndex + 1) / currentQuiz.questions.length) * 100
    );

    return `
        <div style="margin-bottom:24px">
            <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px">
                <span>Питання ${currentIndex + 1} з ${currentQuiz.questions.length}</span>
                <span>${percent}%</span>
            </div>
            <div style="height:8px;background:rgba(255,255,255,0.15);border-radius:6px">
                <div style="
                    height:100%;
                    width:${percent}%;
                    background:linear-gradient(135deg,#6366f1,#8b5cf6);
                    border-radius:6px;
                    transition:0.3s;
                "></div>
            </div>
        </div>
    `;
}

/* =========================
   4. QUESTION
========================= */

function renderQuestion() {
    const q = currentQuiz.questions[currentIndex];

    quizContainerEl.innerHTML = `
        <h2>${currentQuiz.title}</h2>
        ${renderProgress()}
        <div class="question">
            <p>${q.question}</p>
        </div>
    `;

    const block = quizContainerEl.querySelector('.question');

    if (q.image) {
        block.innerHTML += `<img src="${q.image}" style="max-width:100%">`;
    }

    if (q.type === 'single' || q.type === 'multiple') {
        q.options.forEach((opt, i) => {
            const checked =
                userAnswers[q.id]?.includes?.(i) ||
                userAnswers[q.id] === i
                    ? 'checked'
                    : '';

            block.innerHTML += `
                <label>
                    <input type="${q.type === 'single' ? 'radio' : 'checkbox'}"
                           name="q${q.id}"
                           value="${i}" ${checked}>
                    ${opt}
                </label>
            `;
        });
    }

    if (q.type === 'code') {
        block.innerHTML += `
            <textarea rows="6" style="width:100%">
                ${userAnswers[q.id] || q.starterCode || ''}
            </textarea>
        `;
    }

    renderNavButtons();
}

/* =========================
   5. NAV BUTTONS
========================= */

function renderNavButtons() {
    const nav = document.createElement('div');
    nav.style.display = 'flex';
    nav.style.justifyContent = 'space-between';
    nav.style.marginTop = '32px';

    if (currentIndex > 0) {
        const back = document.createElement('button');
        back.textContent = '← Назад';
        back.onclick = prevQuestion;
        nav.appendChild(back);
    } else {
        nav.appendChild(document.createElement('div'));
    }

    const next = document.createElement('button');
    next.textContent =
        currentIndex === currentQuiz.questions.length - 1
            ? 'Завершити тест'
            : 'Далі →';
    next.onclick = nextQuestion;

    nav.appendChild(next);
    quizContainerEl.appendChild(nav);
}

/* =========================
   6. SAVE ANSWERS
========================= */

function saveAnswer() {
    const q = currentQuiz.questions[currentIndex];
    const block = document.querySelector('.question');

    if (q.type === 'single') {
        const checked = block.querySelector('input:checked');
        if (checked) userAnswers[q.id] = Number(checked.value);
    }

    if (q.type === 'multiple') {
        userAnswers[q.id] = [...block.querySelectorAll('input:checked')]
            .map(i => Number(i.value));
    }

    if (q.type === 'code') {
        userAnswers[q.id] = block.querySelector('textarea').value;
    }
}

/* =========================
   7. NAV ACTIONS
========================= */

function nextQuestion() {
    saveAnswer();
    currentIndex++;

    currentIndex < currentQuiz.questions.length
        ? renderQuestion()
        : submitQuiz(currentQuiz.moduleId);
}

function prevQuestion() {
    saveAnswer();
    currentIndex--;
    renderQuestion();
}

/* =========================
   8. SUBMIT
========================= */

function submitQuiz(moduleId) {
    quizContainerEl.innerHTML = '<p>Перевіряємо відповіді...</p>';

    fetch(`/api/quiz/${moduleId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: userAnswers })
    })
        .then(res => res.json())
        .then(showResult);
}

/* =========================
   9. RESULT UI
========================= */

function showResult(result) {
    const success = result.passed;

    quizContainerEl.innerHTML = `
        <div style="
            background:rgba(255,255,255,0.05);
            border:1px solid rgba(255,255,255,0.1);
            border-radius:24px;
            padding:48px;
            text-align:center;
            box-shadow:0 20px 60px rgba(0,0,0,0.4);
        ">
            <h2 style="
                font-size:32px;
                margin-bottom:16px;
                color:${success ? '#22c55e' : '#ef4444'};
            ">
                ${success ? '🎉 Тест пройдено!' : '❌ Тест не пройдено'}
            </h2>

            <p style="font-size:20px;margin-bottom:24px">
                Ваш результат: <strong>${result.percent}%</strong>
            </p>

            <div style="display:flex;gap:16px;justify-content:center">
                <button onclick="restartQuiz()">🔄 Пройти ще раз</button>
                <button onclick="location.href='/'">🏠 На головну</button>
            </div>
        </div>
    `;
}

function restartQuiz() {
    currentIndex = 0;
    userAnswers = {};
    renderQuestion();
}
