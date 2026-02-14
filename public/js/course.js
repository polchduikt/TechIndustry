function getCsrfToken() {
  const token = document.querySelector('meta[name="csrf-token"]');
  return token ? token.getAttribute('content') : '';
}
async function loadLessonSSR(lessonId, clickedEl) {
  const preview = document.getElementById('lessonPreview');
  preview.innerHTML = `
    <div class="loading-state">
        <div class="spinner"></div>
        <p>Завантаження контенту...</p>
    </div>`;

  try {
    const res = await fetch(`/api/courses/lessons/${lessonId}`, {
      credentials: 'same-origin'
    });
    if (!res.ok) throw new Error('Не вдалося завантажити урок');
    const data = await res.json();
    const isLastLesson = !data.next;
    let shouldAutoComplete = false;

    if (isLastLesson && isLoggedInUser) {
      // Отримуємо всі уроки з сайдбару
      const allLessons = document.querySelectorAll('.lessons-link');
      const currentLessonIndex = Array.from(allLessons).findIndex(
          el => el.id === `sidebar-lesson-${lessonId}`
      );

      const allPreviousCompleted = Array.from(allLessons)
          .slice(0, currentLessonIndex)
          .every(el => el.classList.contains('completed'));

      shouldAutoComplete = allPreviousCompleted;
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
        `<button class="btn btn-primary nav-next" onclick="completeAndLoadNext(${lessonId}, ${data.next})">Наступний урок</button>` :
        `<button class="btn btn-primary nav-next" ${shouldAutoComplete ? 'disabled' : `onclick="completeLesson(${lessonId})"`}>🎉 ${shouldAutoComplete ? 'Курс завершено!' : 'Завершити курс'}</button>`
    }
            <button class="nav-quiz" onclick="location.href='/quiz?course=${currentCourseSlug}&lessonId=${data.id}'">
                Перейти до тесту
            </button>
        </div>
      </div>
    `;

    document.querySelectorAll('.lessons-link').forEach(el => el.classList.remove('active'));
    clickedEl?.classList.add('active');
    if (shouldAutoComplete) {
      await completeLesson(lessonId, true);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    preview.innerHTML = `<div class="error-state"><p>Помилка: ${error.message}</p></div>`;
  }
}

async function completeLesson(lessonId, silent = false) {
  if (!isLoggedInUser) {
    if (!silent) {
      alert('Увійдіть, щоб зберегти прогрес');
    }
    return;
  }

  try {
    const progressRes = await fetch('/api/progress/lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': getCsrfToken()
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        lessonId: parseInt(lessonId),
        completed: true
      })
    });

    if (progressRes.ok) {
      const sidebarLink = document.getElementById(`sidebar-lesson-${lessonId}`);
      if (sidebarLink) {
        sidebarLink.classList.add('completed');
      }
    }
  } catch (error) {
    console.error('Помилка збереження прогресу:', error);
  }
}

async function completeAndLoadNext(currentLessonId, nextLessonId) {
  await completeLesson(currentLessonId);
  const nextLessonEl = document.getElementById(`sidebar-lesson-${nextLessonId}`);
  loadLessonSSR(nextLessonId, nextLessonEl);
}

document.addEventListener('DOMContentLoaded', () => {
  let targetLesson = document.querySelector('.lessons-link:not(.completed)');
  if (!targetLesson) targetLesson = document.querySelector('.lessons-link');
  if (targetLesson) {
    const lessonId = targetLesson.id.replace('sidebar-lesson-', '');
    loadLessonSSR(lessonId, targetLesson);
  }
});