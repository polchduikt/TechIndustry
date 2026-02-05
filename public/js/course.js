async function loadLessonSSR(lessonId, clickedEl) {
  const preview = document.getElementById('lessonPreview');
  preview.innerHTML = `
    <div class="loading-state">
        <div class="spinner"></div>
        <p>Завантаження контенту...</p>
    </div>`;

  try {
    const res = await fetch(`/api/courses/lessons/${lessonId}`);
    if (!res.ok) throw new Error('Не вдалося завантажити урок');
    const data = await res.json();

    if (isLoggedInUser) {
      await fetch('/api/progress/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: parseInt(lessonId), completed: true })
      });

      const sidebarLink = document.getElementById(`sidebar-lesson-${lessonId}`);
      if (sidebarLink) {
        sidebarLink.classList.add('completed');
      }
    }

    preview.innerHTML = `
      <div class="lesson-content animate-fade-in">
        <div class="lesson-header">
            <div class="lesson-breadcrumbs">
                <span onclick="location.href='/courses'">Курси</span>
                <span class="separator">/</span>
                <span onclick="location.href='/course/${currentCourseSlug}'">${currentCourseSlug}</span>
            </div>
        </div>

        <h2 class="lesson-title">${data.title}</h2>
        
        <div class="markdown-body">
            ${data.content}
        </div>
        
        <div class="lesson-navigation">
            ${data.next ?
        `<button class="btn btn-primary nav-next" onclick="loadLessonSSR(${data.next}, document.getElementById('sidebar-lesson-${data.next}'))">Наступний урок</button>` :
        `<button class="btn btn-primary nav-next" disabled>🎉 Курс завершено!</button>`
    }
            <button class="nav-quiz" onclick="location.href='/quiz?course=${currentCourseSlug}&lessonId=${data.id}'">
                Перейти до тесту
            </button>
        </div>
      </div>
    `;

    document.querySelectorAll('.lessons-link').forEach(el => el.classList.remove('active'));
    clickedEl?.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    preview.innerHTML = `<div class="error-state"><p>Помилка: ${error.message}</p></div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let targetLesson = document.querySelector('.lessons-link:not(.completed)');
  if (!targetLesson) targetLesson = document.querySelector('.lessons-link');
  if (targetLesson) {
    const lessonId = targetLesson.id.replace('sidebar-lesson-', '');
    loadLessonSSR(lessonId, targetLesson);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  let targetLesson = document.querySelector('.lessons-link:not(.completed)');
  if (!targetLesson) {
    targetLesson = document.querySelector('.lessons-link');
  }
  if (targetLesson) {
    const lessonId = targetLesson.id.replace('sidebar-lesson-', '');
    loadLessonSSR(lessonId, targetLesson);
  }
});