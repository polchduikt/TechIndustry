const params = new URLSearchParams(window.location.search);
const slug = params.get('course');
let completedLessonsGlobal = [];

async function loadCourse() {
  try {
    const token = localStorage.getItem('token');

    // 1. Отримуємо дані курсу
    const res = await fetch(`/api/courses/${slug}`);
    if (!res.ok) throw new Error('Не вдалося завантажити курс');
    const course = await res.json();
    document.getElementById('courseTitle').innerText = course.title;
    if (token) {
      const progressRes = await fetch(`/api/progress/course/${slug}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        if (progressData.started) {
          completedLessonsGlobal = progressData.progress.completed_lessons || [];
        }
      }
    }

    const modulesDiv = document.getElementById('modules');
    modulesDiv.innerHTML = '';
    let lessonToLoad = null;

    course.modules.sort((a, b) => a.order - b.order);
    course.modules.forEach(module => {
      const moduleTitle = document.createElement('h3');
      moduleTitle.textContent = module.title;
      modulesDiv.appendChild(moduleTitle);

      module.lessons.sort((a, b) => a.order - b.order);
      module.lessons.forEach(lesson => {
        const isCompleted = completedLessonsGlobal.includes(lesson.id);

        const link = document.createElement('div');
        link.className = `lessons-link ${isCompleted ? 'completed' : ''}`;
        link.id = `sidebar-lesson-${lesson.id}`;

        link.textContent = lesson.title;

        link.onclick = () => loadLesson(lesson.id, link);
        modulesDiv.appendChild(link);

        if (!lessonToLoad && !isCompleted) {
          lessonToLoad = { id: lesson.id, element: link };
        }
      });
    });

    if (!lessonToLoad && course.modules[0]?.lessons[0]) {
      const first = course.modules[0].lessons[0];
      lessonToLoad = { id: first.id, element: modulesDiv.querySelector('.lessons-link') };
    }

    if (lessonToLoad) {
      loadLesson(lessonToLoad.id, lessonToLoad.element);
    }

    await startCourseProgress(slug);

  } catch (error) {
    document.getElementById('lessonPreview').innerHTML = `<p style="color: red;">${error.message}</p>`;
  }
}

async function loadLesson(lessonId, clickedEl) {
  const preview = document.getElementById('lessonPreview');
  preview.innerHTML = `<p style="opacity:.6">Завантаження контенту...</p>`;

  try {
    const res = await fetch(`/api/courses/lessons/${lessonId}`);
    if (!res.ok) throw new Error('Не вдалося завантажити урок');
    const data = await res.json();
    await updateProgress(lessonId);

    preview.innerHTML = `
      <div class="lesson-card">
        <h2>${data.title}</h2>
        <div class="lesson-content">${data.content}</div>
        <div class="lesson-navigation" style="margin-top: 30px; display: flex; gap: 16px;">
          ${data.next ?
        `<button class="btn btn-primary" onclick="loadNext(${data.next})">Наступний урок</button>` :
        `<button class="btn btn-primary" disabled>Курс завершено</button>`
    }
        <button class="btn btn-secondary" style="background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border);" 
                  onclick="location.href='/quiz?course=${encodeURIComponent(slug)}&lessonId=${data.id}'">
            Почати тестування
          </button>
        </div>
      </div>
    `;

    document.querySelectorAll('.lessons-link').forEach(el => el.classList.remove('active'));
    if (clickedEl) {
      clickedEl.classList.add('active');
    } else {
      const activeLink = document.getElementById(`sidebar-lesson-${lessonId}`);
      if (activeLink) activeLink.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    preview.innerHTML = `<p style="color: red;">Помилка: ${error.message}</p>`;
  }
}

async function updateProgress(lessonId) {
  const token = localStorage.getItem('token');
  if (!token) return;

  const res = await fetch('/api/progress/lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ lessonId: parseInt(lessonId), completed: true })
  });
  if (res.ok) {
    const sidebarLink = document.getElementById(`sidebar-lesson-${lessonId}`);
    if (sidebarLink) {
      sidebarLink.classList.add('completed');
    }
  }
}

function loadNext(nextId) {
  loadLesson(nextId, null);
}

async function startCourseProgress(courseSlug) {
  const token = localStorage.getItem('token');
  if (!token) return;
  await fetch('/api/progress/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ courseSlug })
  });
}

loadCourse();