document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('lesson');

    if (!lessonId) {
        alert('Lesson ID is missing');
        return;
    }

    const res = await fetch(`/api/lessons/${lessonId}`);
    const data = await res.json();

    document.getElementById('lessonTitle').innerText = data.title;
    document.getElementById('lessonContent').innerHTML = data.content;

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (data.prev) {
        prevBtn.onclick = () => location.href = `/lesson?lesson=${data.prev}`;
        prevBtn.style.display = 'block';
    } else {
        prevBtn.style.display = 'none';
    }

    if (data.next) {
        nextBtn.onclick = () => location.href = `/lesson?lesson=${data.next}`;
        nextBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'none';
    }
});
