/* =========================
   DOM
========================= */
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

const quizListEl = document.getElementById('quizList');
const quizContainerEl = document.getElementById('quizContainer');

/* =========================
   AUTH
========================= */
function checkAuth() {
    fetch('/api/auth/profile', { credentials: 'include' })
        .then(res => (res.ok ? res.json() : null))
        .then(user => {
            if (!user) return;

            const myLearningBtn = document.getElementById('myLearningBtn');
            if (myLearningBtn) myLearningBtn.style.display = 'inline-block';

            const initials = user.username?.slice(0, 2).toUpperCase() || 'U';
            const avatarImg = user.Customer?.avatar_data;

            const authSlot = document.getElementById('authSlot');
            if (!authSlot) return;

            authSlot.innerHTML = `
        <div class="header-user">
          <div class="header-avatar" onclick="toggleUserMenu()">
            ${
                avatarImg
                    ? `<img src="${avatarImg}" style="width:100%;height:100%;border-radius:50%">`
                    : initials
            }
          </div>

          <div class="header-dropdown" id="userMenu">
            <div class="dropdown-item" onclick="location.href='/profile'">👤 Профіль</div>
            <div class="dropdown-item" onclick="location.href='/settings'">⚙️ Налаштування</div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item logout" onclick="logout()">🚪 Вийти</div>
          </div>
        </div>
      `;
        });
}

function toggleUserMenu() {
    document.getElementById('userMenu')?.classList.toggle('show');
}

async function requireAuth() {
    try {
        const res = await fetch('/api/auth/profile', {
            cache: 'no-store',
            credentials: 'include'
        });
        if (!res.ok) throw new Error();
        return true;
    } catch {
        location.href = '/login';
        return false;
    }
}

/* =========================
   STATE
========================= */
let currentCourseSlug = null;
let currentQuiz = null;
let currentIndex = 0;
let userAnswers = {};

/* =========================
   VIEW MODE (variant 1)
========================= */
function showQuizList() {
    // якщо твій список не grid — зміни на 'block'
    if (quizListEl) quizListEl.style.display = 'grid';
    if (quizContainerEl) quizContainerEl.style.display = 'none';
}

function showQuizContainer() {
    if (quizListEl) quizListEl.style.display = 'none';
    if (quizContainerEl) quizContainerEl.style.display = 'block';
}

/* =========================
   HELPERS: open quiz by lessonId
========================= */

// Формує moduleId у форматі "06-variables" тощо.
// Працює так:
// 1) якщо в module є slug/code/key -> збирає "order-slug"
// 2) якщо ні -> пробує slug з title (slugify)
// 3) fallback: module.moduleId / module.id
function buildQuizModuleId(module) {
    const order = module?.order;

    const slugPart =
        module?.slug ||
        module?.code ||
        module?.key ||
        (module?.title
            ? String(module.title)
                .toLowerCase()
                .trim()
                .replace(/['"]/g, '')
                .replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '')
            : null);

    if (order != null && slugPart) {
        return String(order).padStart(2, '0') + '-' + slugPart;
    }

    return module?.moduleId || module?.id || slugPart || null;
}

async function openQuizFromLesson(slug, lessonId) {
    // 1. Завантажуємо курс
    const courseRes = await fetch(`/api/courses/${slug}`, { credentials: 'include' });
    if (!courseRes.ok) throw new Error('Не вдалося завантажити курс');

    const course = await courseRes.json();
    console.log(course.modules.map(m => ({ order: m.order, title: m.title, lessonIds: m.lessons.map(l => l.id) })));


    // 2. Знаходимо модуль, у якому є цей урок
    const lid = Number(lessonId);

    const module = course.modules?.find(m =>
        m.lessons?.some(l => l.id === lid)
    );

    if (!module) {
        throw new Error(`Не знайдено модуль для lessonId=${lessonId}`);
    }

    const moduleOrder = module.order; // <-- ключове
    if (moduleOrder == null) {
        throw new Error('Модуль не має order');
    }

    // 3. Завантажуємо ВСІ квізи курсу
    const quizzesRes = await fetch(`/api/courses/${slug}/quizzes`, {
        credentials: 'include'
    });
    if (!quizzesRes.ok) throw new Error('Не вдалося завантажити квізи курсу');

    const quizzes = await quizzesRes.json();

    // 4. Знаходимо квіз по order (01-, 02-, 03- ...)
    const orderPrefix = String(moduleOrder).padStart(2, '0') + '-';

    const quiz = quizzes.find(q =>
        typeof q.moduleId === 'string' && q.moduleId.startsWith(orderPrefix)
    );

    if (!quiz) {
        throw new Error(`Не знайдено квіз для модуля з order=${moduleOrder}`);
    }

    // 5. Відкриваємо тест
    currentCourseSlug = slug;
    loadQuiz(slug, quiz.moduleId);
}


/* =========================
   INIT
========================= */
(async () => {
    // базова перевірка контейнерів
    if (!quizListEl || !quizContainerEl) {
        console.warn('quiz.js loaded but quizList/quizContainer not found in DOM');
        return;
    }

    const ok = await requireAuth();
    if (!ok) return;

    const params = new URLSearchParams(location.search);
    const slug = params.get('course');
    const moduleId = params.get('moduleId');
    const lessonId = params.get('lessonId');

    // 1) прямий запуск по moduleId
    if (slug && moduleId) {
        currentCourseSlug = slug;
        showQuizContainer();
        quizContainerEl.innerHTML = '<p>Завантаження тесту...</p>';
        loadQuiz(slug, moduleId);
        return;
    }

    // 2) запуск по lessonId (автовизначення модуля)
    if (slug && lessonId) {
        try {
            showQuizContainer();
            quizContainerEl.innerHTML = '<p>Готуємо тест...</p>';
            await openQuizFromLesson(slug, lessonId);
            return;
        } catch (e) {
            console.error('Auto-open by lessonId failed:', e);
            // якщо не вийшло — падаємо в стандартний режим
        }
    }

    // 3) стандартний режим — список курсів
    showQuizList();
    quizContainerEl.innerHTML = '';

    fetch('/api/courses', { credentials: 'include' })
        .then(res => res.json())
        .then(renderCourses)
        .catch(() => {
            quizListEl.innerHTML = '<p>Не вдалося завантажити курси</p>';
        });
})();

/* =========================
   COURSES
========================= */
function renderCourses(courses) {
    showQuizList();
    quizListEl.innerHTML = '';
    quizContainerEl.innerHTML = '';

    courses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'quiz-card';

        card.innerHTML = `
      <h3>${course.title}</h3>
      <p>${course.description ?? ''}</p>
      <p><strong>Рівень:</strong> ${course.level ?? ''}</p>
      <button>Перейти до курсу</button>
    `;

        card.querySelector('button').onclick = () => loadCourse(course.slug);

        quizListEl.appendChild(card);
    });
}

/* =========================
   QUIZZES OF COURSE
========================= */
function loadCourse(slug) {
    currentCourseSlug = slug;
    showQuizList();
    quizContainerEl.innerHTML = '';

    fetch(`/api/courses/${slug}/quizzes`, { credentials: 'include' })
        .then(res => {
            if (!res.ok) throw new Error('Failed to load quizzes');
            return res.json();
        })
        .then(renderQuizList)
        .catch(() => {
            quizListEl.innerHTML = '<p>Не вдалося завантажити тести курсу</p>';
        });
}

function renderQuizList(quizzes) {
    showQuizList();
    quizListEl.innerHTML = '';

    quizzes.forEach(quiz => {
        // В твоєму форматі квізів ідентифікатор = moduleId
        const quizId = quiz.moduleId;

        if (!quizId) {
            console.error('QUIZ WITHOUT moduleId:', quiz);
            return;
        }

        const card = document.createElement('div');
        card.className = 'quiz-card';

        card.innerHTML = `
      <h3>${quiz.title}</h3>
      <p>Мінімум для проходження: ${quiz.passingScore}%</p>
      <button>Почати тест</button>
    `;

        card.querySelector('button').onclick = () => loadQuiz(currentCourseSlug, quizId);

        quizListEl.appendChild(card);
    });
}

/* =========================
   LOAD QUIZ
========================= */
function loadQuiz(slug, moduleId) {
    currentCourseSlug = slug;

    console.log('LOAD QUIZ:', slug, moduleId);

    showQuizContainer();
    quizContainerEl.innerHTML = '<p>Завантаження тесту...</p>';

    fetch(`/api/courses/${slug}/quizzes/${moduleId}`, { credentials: 'include' })
        .then(res => {
            console.log('QUIZ STATUS:', res.status);
            if (!res.ok) throw new Error('Quiz load failed');
            return res.json();
        })
        .then(quiz => {
            currentQuiz = quiz;
            currentQuiz.moduleId = moduleId;
            currentIndex = 0;
            userAnswers = {};
            renderQuestion();
        })
        .catch(err => {
            console.error(err);
            quizContainerEl.innerHTML = `
        <p style="color:#ef4444">Помилка завантаження тесту</p>
        <button onclick="showQuizList(); loadCourse('${slug}')">← Назад</button>
      `;
        });
}

/* =========================
   PROGRESS
========================= */
function renderProgress() {
    const total = currentQuiz.questions.length;
    const percent = Math.round(((currentIndex + 1) / total) * 100);

    return `
    <div style="margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px">
        <span>Питання ${currentIndex + 1} з ${total}</span>
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
   QUESTION
========================= */
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function renderQuestion() {
    if (!currentQuiz || !currentQuiz.questions?.length) {
        console.error('NO QUIZ OR NO QUESTIONS', currentQuiz);
        quizContainerEl.innerHTML = '<p>Немає питань у цьому тесті</p>';
        return;
    }

    const q = currentQuiz.questions[currentIndex];
    const answer = userAnswers[q.id];

    quizContainerEl.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px">
      <h2 style="margin:0">${currentQuiz.title}</h2>
      <button id="backToQuizzesBtn" type="button">← До списку тестів</button>
    </div>

    ${renderProgress()}
    <div class="question">
      <p>${q.question}</p>
    </div>
  `;

    // назад до списку тестів цього курсу
    quizContainerEl.querySelector('#backToQuizzesBtn').onclick = () => {
        showQuizList();
        loadCourse(currentCourseSlug);
    };

    const block = quizContainerEl.querySelector('.question');

    if (q.image) {
        block.innerHTML += `<img src="${q.image}" style="max-width:100%">`;
    }

    if (q.type === 'single' || q.type === 'multiple') {
        q.options.forEach((opt, i) => {
            const checked =
                q.type === 'single'
                    ? answer === i
                    : Array.isArray(answer) && answer.includes(i);

            block.innerHTML += `
            <label style="display:block;margin-bottom:8px">
                <input
                    type="${q.type === 'single' ? 'radio' : 'checkbox'}"
                    name="q${q.id}"
                    value="${i}"
                    ${checked ? 'checked' : ''}
                >
                ${escapeHtml(opt)}
            </label>
        `;
        });
    }


    if (q.type === 'code') {
        block.innerHTML += `
      <textarea rows="6" style="width:100%">${answer || q.starterCode || ''}</textarea>
    `;
    }

    renderNavButtons();
}

/* =========================
   NAV
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
   ANSWERS
========================= */
function saveAnswer() {
    const q = currentQuiz.questions[currentIndex];
    const block = document.querySelector('.question');
    if (!block) return;

    if (q.type === 'single') {
        const checked = block.querySelector('input:checked');
        if (checked) userAnswers[q.id] = Number(checked.value);
    }

    if (q.type === 'multiple') {
        userAnswers[q.id] = [...block.querySelectorAll('input:checked')].map(i =>
            Number(i.value)
        );
    }

    if (q.type === 'code') {
        userAnswers[q.id] = block.querySelector('textarea')?.value ?? '';
    }
}

function nextQuestion() {
    saveAnswer();
    currentIndex++;
    currentIndex < currentQuiz.questions.length ? renderQuestion() : submitQuiz();
}

function prevQuestion() {
    saveAnswer();
    currentIndex--;
    renderQuestion();
}

/* =========================
   SUBMIT
========================= */
function submitQuiz() {
    quizContainerEl.innerHTML = '<p>Перевіряємо відповіді...</p>';

    fetch(`/api/courses/${currentCourseSlug}/quizzes/${currentQuiz.moduleId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers: userAnswers })
    })
        .then(res => {
            if (!res.ok) throw new Error('Submit failed');
            return res.json();
        })
        .then(showResult)
        .catch(err => {
            console.error(err);
            quizContainerEl.innerHTML = '<p>Помилка відправки тесту</p>';
        });
}

/* =========================
   RESULT
========================= */
function showResult(result) {
    const success = !!result.passed;

    quizContainerEl.innerHTML = `
    <div style="
      background:rgba(255,255,255,0.05);
      border-radius:24px;
      padding:48px;
      text-align:center;
    ">
      <h2 style="color:${success ? '#22c55e' : '#ef4444'}">
        ${success ? '🎉 Тест пройдено!' : '❌ Тест не пройдено'}
      </h2>
      <p>Ваш результат: <strong>${result.percent}%</strong></p>

      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:18px">
        <button onclick="showQuizList(); loadCourse(currentCourseSlug)">Перейти до списку тестів </button>
        <button onclick="location.href='/course?course=' + encodeURIComponent(currentCourseSlug)">← Назад до курсу</button>
        <button onclick="loadQuiz(currentCourseSlug, currentQuiz.moduleId)">🔁 Пройти ще раз</button>
      </div>
    </div>
  `;
}

/* =========================
   LOGOUT
========================= */
function logout() {
    fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
    }).then(() => (location.href = '/login'));
}
