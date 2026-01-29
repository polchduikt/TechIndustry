document.addEventListener('DOMContentLoaded', () => {
});

const quizListEl = document.getElementById('quizList');
const quizContainerEl = document.getElementById('quizContainer');

async function requireAuth() {
    try {
        const res = await fetch('/api/auth/profile', {
            cache: 'no-store',
            credentials: 'include'
        });
        if (!res.ok) throw new Error();
        return true;
    } catch {
        location.href = '/login.html';
        return false;
    }
}

let currentCourseSlug = null;
let currentQuiz = null;
let currentIndex = 0;
let userAnswers = {};

function showQuizList() {
    if (quizListEl) quizListEl.style.display = 'grid';
    if (quizContainerEl) quizContainerEl.style.display = 'none';
}

function showQuizContainer() {
    if (quizListEl) quizListEl.style.display = 'none';
    if (quizContainerEl) quizContainerEl.style.display = 'block';
}

function buildQuizModuleId(module) {
    const order = module?.order;
    const slugPart = module?.slug || module?.code || module?.key ||
        (module?.title ? String(module.title).toLowerCase().trim().replace(/['"]/g, '').replace(/\s+/g, '-').replace(/[^\w-]/g, '') : null);

    if (order != null && slugPart) {
        return String(order).padStart(2, '0') + '-' + slugPart;
    }
    return module?.moduleId || module?.id || slugPart || null;
}

async function openQuizFromLesson(slug, lessonId) {
    const courseRes = await fetch(`/api/courses/${slug}`, { credentials: 'include' });
    if (!courseRes.ok) throw new Error('Failed to load course');

    const course = await courseRes.json();
    const lid = Number(lessonId);
    const module = course.modules?.find(m => m.lessons?.some(l => l.id === lid));

    if (!module || module.order == null) throw new Error('Module mapping error');

    const quizzesRes = await fetch(`/api/courses/${slug}/quizzes`, { credentials: 'include' });
    const quizzes = await quizzesRes.json();
    const orderPrefix = String(module.order).padStart(2, '0') + '-';
    const quiz = quizzes.find(q => typeof q.moduleId === 'string' && q.moduleId.startsWith(orderPrefix));

    if (!quiz) throw new Error('Quiz not found');

    currentCourseSlug = slug;
    loadQuiz(slug, quiz.moduleId);
}

(async () => {
    if (!quizListEl || !quizContainerEl) return;

    const ok = await requireAuth();
    if (!ok) return;

    const params = new URLSearchParams(location.search);
    const slug = params.get('course');
    const moduleId = params.get('moduleId');
    const lessonId = params.get('lessonId');

    if (slug && moduleId) {
        currentCourseSlug = slug;
        showQuizContainer();
        loadQuiz(slug, moduleId);
        return;
    }

    if (slug && lessonId) {
        try {
            showQuizContainer();
            await openQuizFromLesson(slug, lessonId);
            return;
        } catch (e) {
            console.error(e);
        }
    }

    showQuizList();
    fetch('/api/courses', { credentials: 'include' })
        .then(res => res.json())
        .then(renderCourses)
        .catch(() => {
            quizListEl.innerHTML = '<p>Не вдалося завантажити курси</p>';
        });
})();

function renderCourses(courses) {
    showQuizList();
    quizListEl.innerHTML = '';
    courses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'quiz-card';
        card.innerHTML = `
            <h3>${course.title}</h3>
            <p>${course.description ?? ''}</p>
            <p><strong>Рівень:</strong> ${course.level ?? ''}</p>
            <button onclick="loadCourse('${course.slug}')">Перейти до тестів</button>
        `;
        quizListEl.appendChild(card);
    });
}

function loadCourse(slug) {
    currentCourseSlug = slug;
    showQuizList();
    fetch(`/api/courses/${slug}/quizzes`, { credentials: 'include' })
        .then(res => res.json())
        .then(renderQuizList)
        .catch(() => {
            quizListEl.innerHTML = '<p>Не вдалося завантажити тести</p>';
        });
}

function renderQuizList(quizzes) {
    showQuizList();
    quizListEl.innerHTML = '';
    quizzes.forEach(quiz => {
        const card = document.createElement('div');
        card.className = 'quiz-card';
        card.innerHTML = `
            <h3>${quiz.title}</h3>
            <p>Мінімум для проходження: ${quiz.passingScore}%</p>
            <button onclick="loadQuiz('${currentCourseSlug}', '${quiz.moduleId}')">Почати тест</button>
        `;
        quizListEl.appendChild(card);
    });
}

function loadQuiz(slug, moduleId) {
    currentCourseSlug = slug;
    showQuizContainer();
    quizContainerEl.innerHTML = '<p>Завантаження...</p>';

    fetch(`/api/courses/${slug}/quizzes/${moduleId}`, { credentials: 'include' })
        .then(res => res.json())
        .then(quiz => {
            currentQuiz = quiz;
            currentQuiz.moduleId = moduleId;
            currentIndex = 0;
            userAnswers = {};
            renderQuestion();
        })
        .catch(() => {
            quizContainerEl.innerHTML = '<p>Помилка завантаження</p>';
        });
}

function renderProgress() {
    const total = currentQuiz.questions.length;
    const percent = Math.round(((currentIndex + 1) / total) * 100);
    return `
        <div style="margin-bottom:24px">
            <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px">
                <span>Питання ${currentIndex + 1} з ${total}</span>
                <span>${percent}%</span>
            </div>
            <div style="height:8px;background:rgba(255,255,255,0.1);border-radius:6px">
                <div style="height:100%;width:${percent}%;background:var(--primary);border-radius:6px;transition:0.3s"></div>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderQuestion() {
    const q = currentQuiz.questions[currentIndex];
    const answer = userAnswers[q.id];

    quizContainerEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h2 style="margin:0">${currentQuiz.title}</h2>
            <button class="btn btn-secondary" onclick="showQuizList(); loadCourse('${currentCourseSlug}')">← Назад</button>
        </div>
        ${renderProgress()}
        <div class="question">
            <p>${q.question}</p>
            <div id="optionsContainer"></div>
        </div>
        <div id="quizNav" style="display:flex;justify-content:space-between;margin-top:30px"></div>
    `;

    const optionsBox = document.getElementById('optionsContainer');
    if (q.type === 'single' || q.type === 'multiple') {
        q.options.forEach((opt, i) => {
            const checked = q.type === 'single' ? answer === i : Array.isArray(answer) && answer.includes(i);
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="${q.type === 'single' ? 'radio' : 'checkbox'}" name="q" value="${i}" ${checked ? 'checked' : ''}>
                <span>${escapeHtml(opt)}</span>
            `;
            optionsBox.appendChild(label);
        });
    } else if (q.type === 'code') {
        optionsBox.innerHTML = `<textarea rows="8" style="width:100%;background:rgba(0,0,0,0.2);color:white;border:1px solid var(--glass-border);border-radius:12px;padding:15px">${answer || q.starterCode || ''}</textarea>`;
    }

    const nav = document.getElementById('quizNav');
    if (currentIndex > 0) {
        const btnBack = document.createElement('button');
        btnBack.textContent = '← Назад';
        btnBack.onclick = () => { saveAnswer(); currentIndex--; renderQuestion(); };
        nav.appendChild(btnBack);
    } else {
        nav.appendChild(document.createElement('div'));
    }

    const btnNext = document.createElement('button');
    btnNext.textContent = currentIndex === currentQuiz.questions.length - 1 ? 'Завершити' : 'Далі →';
    btnNext.onclick = () => {
        saveAnswer();
        if (currentIndex < currentQuiz.questions.length - 1) {
            currentIndex++;
            renderQuestion();
        } else {
            submitQuiz();
        }
    };
    nav.appendChild(btnNext);
}

function saveAnswer() {
    const q = currentQuiz.questions[currentIndex];
    const container = document.getElementById('optionsContainer');
    if (q.type === 'single') {
        const sel = container.querySelector('input:checked');
        if (sel) userAnswers[q.id] = Number(sel.value);
    } else if (q.type === 'multiple') {
        userAnswers[q.id] = [...container.querySelectorAll('input:checked')].map(el => Number(el.value));
    } else if (q.type === 'code') {
        userAnswers[q.id] = container.querySelector('textarea').value;
    }
}

function submitQuiz() {
    quizContainerEl.innerHTML = '<p>Обробка результатів...</p>';
    fetch(`/api/courses/${currentCourseSlug}/quizzes/${currentQuiz.moduleId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers: userAnswers })
    })
        .then(res => res.json())
        .then(showResult);
}

function showResult(result) {
    const passed = result.passed;
    quizContainerEl.innerHTML = `
        <div class="glass" style="padding:40px;text-align:center;border-radius:24px">
            <h2 style="color:${passed ? '#4ade80' : '#f87171'}">${passed ? '🎉 Пройдено!' : '❌ Не пройдено'}</h2>
            <p>Результат: ${result.percent}%</p>
            <div style="display:flex;gap:12px;justify-content:center;margin-top:24px">
                <button onclick="loadQuiz('${currentCourseSlug}', '${currentQuiz.moduleId}')">Спробувати ще раз</button>
                <button class="btn btn-secondary" onclick="location.href='/course?course=${currentCourseSlug}'">До курсу</button>
            </div>
        </div>
    `;
}