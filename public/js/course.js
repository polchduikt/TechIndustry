const params = new URLSearchParams(window.location.search);
const slug = params.get('course');

async function loadCourse() {
  try {
    const res = await fetch(`/api/courses/${slug}`);
    if (!res.ok) throw new Error('Не вдалося завантажити курс');

    const course = await res.json();
    document.getElementById('courseTitle').innerText = course.title;

    const modulesDiv = document.getElementById('modules');
    modulesDiv.innerHTML = '';

    course.modules.sort((a, b) => a.order - b.order);
    course.modules.forEach(module => {
      module.lessons.sort((a, b) => a.order - b.order);

      const moduleTitle = document.createElement('h3');
      moduleTitle.textContent = module.title;
      modulesDiv.appendChild(moduleTitle);

      module.lessons.forEach(lesson => {
        const link = document.createElement('div');
        link.className = 'lessons-link';
        link.textContent = lesson.title;
        link.onclick = () => loadLesson(lesson.id, link);
        modulesDiv.appendChild(link);
      });
    });

    if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      const firstLesson = course.modules[0].lessons[0];
      const firstLink = modulesDiv.querySelector('.lessons-link');
      if (firstLink) {
        loadLesson(firstLesson.id, firstLink);
      }
    }
  } catch (error) {
    console.error('Помилка завантаження курсу:', error);
    document.getElementById('lessonPreview').innerHTML =
        `<p style="color: red;">Помилка завантаження курсу: ${error.message}</p>`;
  }
}

async function loadLesson(lessonId, clickedEl) {
  const preview = document.getElementById('lessonPreview');
  preview.innerHTML = `<p style="opacity:.6">Завантаження уроку...</p>`;

  try {
    const res = await fetch(`/api/courses/lessons/${lessonId}`);
    if (!res.ok) throw new Error('Не вдалося завантажити урок');

    const data = await res.json();

    if (!data.content || data.content === 'undefined') {
      throw new Error('Контент уроку відсутній');
    }

    preview.innerHTML = `
      <div class="lesson-card">
        <h2>${data.title}</h2>
        <div class="lesson-content">
          ${data.content}
        </div>
        
        <div class="lesson-navigation" style="margin-top: 30px; display: flex; gap: 16px;">
          ${data.next ?
        `<button class="btn btn-primary" onclick="loadNextLesson(${data.next})">Наступний урок</button>` :
        `<button class="btn btn-primary" disabled>Завершення курсу</button>`
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
      const sidebarLinks = document.querySelectorAll('.lessons-link');
      sidebarLinks.forEach(link => {
        if (link.textContent === data.title) link.classList.add('active');
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (error) {
    console.error('Помилка завантаження уроку:', error);
    preview.innerHTML = `<div class="lesson-card"><p style="color: red;">Помилка: ${error.message}</p></div>`;
  }
}

function loadNextLesson(nextId) {
  loadLesson(nextId, null);
}

loadCourse();
