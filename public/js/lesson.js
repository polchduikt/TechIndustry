document.addEventListener('DOMContentLoaded', async () => {
      const params = new URLSearchParams(window.location.search);
      const lessonId = params.get('lesson');

      if (!lessonId) {
        alert('Lesson ID missing');
        return;
      }

      const res = await fetch(`/api/lessons/${lessonId}`);
      const data = await res.json();

      console.log('API response:', data);
      
      document.getElementById('lessonTitle').innerText = data.title;
      document.getElementById('lessonContent').innerHTML =
        marked.parse(data.content);

      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');

      if (data.prev) {
        prevBtn.onclick = () =>
          location.href = `/lesson?lesson=${data.prev}`;
      } else {
        prevBtn.style.display = 'none';
      }

      if (data.next) {
        nextBtn.onclick = () =>
          location.href = `/lesson?lesson=${data.next}`;
      } else {
        nextBtn.style.display = 'none';
      }
    });