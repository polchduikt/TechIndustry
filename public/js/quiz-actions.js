let currentIndex = 0;
let userAnswers = {};
const container = document.getElementById('quizContainer');

function getCsrfToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : '';
}

function renderProgress() {
    const total = currentQuizData.questions.length;
    const percent = Math.round(((currentIndex + 1) / total) * 100);
    return `
        <div class="quiz-progress-wrapper">
            <div class="quiz-progress-info">
                <span>Питання ${currentIndex + 1} з ${total}</span>
                <span>${percent}%</span>
            </div>
            <div class="quiz-progress-bar">
                <div class="quiz-progress-fill" style="width: ${percent}%"></div>
            </div>
        </div>
    `;
}

function renderQuestion() {
    const q = currentQuizData.questions[currentIndex];
    const savedAnswer = userAnswers[q.id];
    container.innerHTML = `
        <div class="quiz-card-content animate-fade-in">
            <div class="quiz-card-header">
                <h2 class="gradient-text">${currentQuizData.title}</h2>
                <button class="quiz-header-back" onclick="location.href='/quiz'">До списку тестів</button>
            </div>
            
            ${renderProgress()}
            
            <div class="question-section">
                <p class="question-text">${q.question} ${q.type === 'multiple' ? '<br><small style="color:var(--text-muted); font-size: 0.8em;">(можна обрати кілька варіантів)</small>' : ''}</p>
                <div id="optionsContainer" class="options-grid"></div>
            </div>

            <div class="quiz-nav-buttons">
                ${currentIndex > 0 ? `<button class="btn btn-secondary" onclick="prevQuestion()">Назад</button>` : '<div></div>'}
                <button class="btn btn-primary" onclick="nextQuestion()">
                    ${currentIndex === currentQuizData.questions.length - 1 ? 'Завершити' : 'Наступне'}
                </button>
            </div>
        </div>
    `;

    const optionsBox = document.getElementById('optionsContainer');
    if (q.type === 'single' || q.type === 'multiple') {
        q.options.forEach((opt, i) => {
            let isSelected = false;
            if (q.type === 'single') isSelected = savedAnswer == i;
            if (q.type === 'multiple') isSelected = Array.isArray(savedAnswer) && savedAnswer.includes(i);
            const label = document.createElement('label');
            label.className = `option-item glass ${isSelected ? 'selected' : ''}`;
            label.innerHTML = `<span>${opt}</span>`;
            label.onclick = (event) => saveSelection(i, q.type, event);
            optionsBox.appendChild(label);
        });
    } else if (q.type === 'code') {
        optionsBox.innerHTML = `
            <textarea class="code-area-modern" id="codeAnswer" placeholder="Напишіть ваш код тут..." oninput="saveCodeAnswer(this.value)">${savedAnswer || q.starterCode || ''}</textarea>
        `;
    }
}

function saveSelection(val, type, evt) {
    const qId = currentQuizData.questions[currentIndex].id;
    const targetLabel = evt.currentTarget;
    if (type === 'single') {
        userAnswers[qId] = val;
        document.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
        targetLabel.classList.add('selected');
    } else {
        if (!Array.isArray(userAnswers[qId])) userAnswers[qId] = [];
        if (userAnswers[qId].includes(val)) {
            userAnswers[qId] = userAnswers[qId].filter(v => v !== val);
            targetLabel.classList.remove('selected');
        } else {
            userAnswers[qId].push(val);
            targetLabel.classList.add('selected');
        }
    }
}

function saveCodeAnswer(val) {
    userAnswers[currentQuizData.questions[currentIndex].id] = val;
}

function nextQuestion() {
    if (currentIndex < currentQuizData.questions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        submitQuiz();
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

async function submitQuiz() {
    container.innerHTML = `
        <div style="text-align:center; padding:100px 20px;">
            <div class="loading-spinner"></div>
            <p style="color: var(--text-muted); margin-top: 20px;">Перевірка результатів...</p>
        </div>`;

    try {
        const res = await fetch(`/quiz/${currentCourseSlug}/${currentModuleId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': getCsrfToken()
            },
            credentials: 'same-origin',
            body: JSON.stringify({ answers: userAnswers })
        });
        if (!res.ok) throw new Error('Помилка сервера');
        const result = await res.json();
        showResult(result);
    } catch (e) {
        console.error('Quiz submission error:', e);
        alert('Помилка при отриманні результатів.');
    }
}

function showResult(result) {
    const passed = result.passed;
    const gamification = result.gamification;
    let rewardsHTML = '';
    if (gamification) {
        rewardsHTML = `
            <div class="rewards-section">
                <div class="xp-reward">
                    <span class="reward-icon">✨</span>
                    <span class="reward-text">+${gamification.xpGained} XP</span>
                </div>
            </div>
        `;
    } else if (result.isRepeat) {
        rewardsHTML = `
            <div class="rewards-section">
                <div class="repeat-notice">
                    ℹ️ Тест вже був пройдений раніше. XP не нараховується.
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="result-view animate-pop-in">
            <div class="result-icon">${passed ? '🎉' : '❌'}</div>
            <h2 class="${passed ? 'text-success' : 'text-error'}">
                ${passed ? 'Тест пройдено!' : 'Тест не пройдено'}
            </h2>
            <div class="result-stats glass">
                <div class="stat-item">
                    <span class="label">Ваш результат</span>
                    <span class="value">${result.percent}%</span>
                </div>
                <div class="stat-item">
                    <span class="label">Мінімальний бал</span>
                    <span class="value">${currentQuizData.passingScore}%</span>
                </div>
            </div>
            ${rewardsHTML}
            <div class="result-actions">
                <button class="btn btn-secondary" onclick="location.reload()">Ще раз</button>
                <button class="btn btn-primary" onclick="location.href='/profile'">До профілю</button>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', renderQuestion);