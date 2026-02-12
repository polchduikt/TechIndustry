function getCsrfToken() {
  const token = document.querySelector('meta[name="csrf-token"]');
  return token ? token.getAttribute('content') : '';
}

function showRewardNotification(rewards) {
  if (!rewards) return;

  const notification = document.createElement('div');
  notification.className = 'reward-notification animate-slide-in';

  let content = '<div class="reward-content">';
  content += '<h3>🎉 Нагорода!</h3>';

  if (rewards.xpGained) {
    content += `<div class="reward-item"><span class="reward-icon">✨</span> +${rewards.xpGained} XP</div>`;
  }

  if (rewards.coinsGained) {
    content += `<div class="reward-item"><span class="reward-icon">🪙</span> +${rewards.coinsGained} монет</div>`;
  }

  if (rewards.leveledUp) {
    content += `<div class="reward-item level-up"><span class="reward-icon">🎊</span> Новий рівень: ${rewards.newLevel}!</div>`;
  }

  if (rewards.newBadges && rewards.newBadges.length > 0) {
    rewards.newBadges.forEach(badge => {
      content += `<div class="reward-item badge"><span class="reward-icon">🏆</span> ${badge.name}</div>`;
    });
  }

  content += '</div>';
  notification.innerHTML = content;

  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 5000);
}

function showCourseCompletionNotification(courseCompletion) {
  if (!courseCompletion) return;
  const notification = document.createElement('div');
  notification.className = 'reward-notification course-completion animate-slide-in';

  let content = '<div class="reward-content">';
  content += '<h3>🎓 Курс завершено!</h3>';

  if (courseCompletion.xpGained) {
    content += `<div class="reward-item"><span class="reward-icon">✨</span> +${courseCompletion.xpGained} XP</div>`;
  }

  if (courseCompletion.coinsGained) {
    content += `<div class="reward-item"><span class="reward-icon">🪙</span> +${courseCompletion.coinsGained} монет</div>`;
  }

  if (courseCompletion.leveledUp) {
    content += `<div class="reward-item level-up"><span class="reward-icon">🎊</span> Новий рівень: ${courseCompletion.newLevel}!</div>`;
  }

  if (courseCompletion.newBadges && courseCompletion.newBadges.length > 0) {
    courseCompletion.newBadges.forEach(badge => {
      content += `<div class="reward-item badge"><span class="reward-icon">🏆</span> ${badge.name}</div>`;
    });
  }
  content += '</div>';
  notification.innerHTML = content;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 7000);
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

    if (isLoggedInUser) {
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
        const progressData = await progressRes.json();
        if (progressData.rewards) {
          showRewardNotification(progressData.rewards);
        }
        if (progressData.courseCompletion) {
          setTimeout(() => {
            showCourseCompletionNotification(progressData.courseCompletion);
          }, 500);
        }
      }
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