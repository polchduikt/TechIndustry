let currentLessonId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('lesson');

    if (!lessonId) {
        alert('ID уроку відсутній');
        return;
    }

    currentLessonId = lessonId;

    try {
        const res = await fetch(`/api/courses/lessons/${lessonId}`);

        if (!res.ok) {
            throw new Error('Не вдалося завантажити урок');
        }
        const data = await res.json();
        document.getElementById('lessonTitle').innerText = data.title;
        document.getElementById('lessonContent').innerHTML = data.content;
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        if (data.prev) {
            prevBtn.onclick = () => {
                markLessonAsViewed(lessonId);
                location.href = `/lesson?lesson=${data.prev}`;
            };
            prevBtn.style.display = 'block';
        } else {
            prevBtn.style.display = 'none';
        }

        if (data.next) {
            nextBtn.onclick = async () => {
                await markLessonAsCompleted(lessonId);
                location.href = `/lesson?lesson=${data.next}`;
            };
            nextBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'none';
        }

        markLessonAsViewed(lessonId);
        addCompleteButton(lessonId, data.next);

    } catch (error) {
        console.error('Error loading lesson:', error);
        document.getElementById('lessonContent').innerHTML = `
            <p style="color: red;">Помилка завантаження уроку: ${error.message}</p>
        `;
    }
});

function addCompleteButton(lessonId, hasNext) {
    const lessonCard = document.querySelector('.lesson-card');

    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '32px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '16px';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.alignItems = 'center';

    const completeBtn = document.createElement('button');
    completeBtn.className = 'btn btn-primary';
    completeBtn.textContent = '✓ Позначити як завершений';
    completeBtn.onclick = async () => {
        const success = await markLessonAsCompleted(lessonId);
        if (success) {
            completeBtn.textContent = '✓ Завершено';
            completeBtn.disabled = true;
            completeBtn.style.opacity = '0.6';
        }
    };

    buttonContainer.appendChild(completeBtn);

    if (hasNext) {
        const nextLessonBtn = document.createElement('button');
        nextLessonBtn.className = 'btn btn-secondary';
        nextLessonBtn.textContent = 'Наступний урок →';
        nextLessonBtn.onclick = async () => {
            await markLessonAsCompleted(lessonId);
            location.href = `/lesson?lesson=${hasNext}`;
        };
        buttonContainer.appendChild(nextLessonBtn);
    }

    lessonCard.appendChild(buttonContainer);
}

async function markLessonAsCompleted(lessonId) {
    const token = localStorage.getItem('token');

    if (!token) {
        console.log('User not logged in, skipping progress update');
        return false;
    }
    try {
        const response = await fetch('/api/progress/lesson', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                lessonId: parseInt(lessonId),
                completed: true
            })
        });

        if (response.ok) {
            console.log('Lesson marked as completed');
            return true;
        } else {
            const error = await response.json();
            console.error('Failed to update progress:', error.message);
            return false;
        }
    } catch (error) {
        console.error('Error updating progress:', error);
        return false;
    }
}

async function markLessonAsViewed(lessonId) {
    const token = localStorage.getItem('token');

    if (!token) {
        return;
    }

    try {
        await fetch('/api/progress/lesson', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                lessonId: parseInt(lessonId),
                completed: false
            })
        });
    } catch (error) {
        console.error('Error marking lesson as viewed:', error);
    }
}