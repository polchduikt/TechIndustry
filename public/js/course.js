const params = new URLSearchParams(window.location.search);
  const slug = params.get('course');

  async function loadCourse() {
    const res = await fetch(`/api/courses/${slug}`);
    const course = await res.json();

    document.getElementById('courseTitle').innerText = course.title;

    const modulesDiv = document.getElementById('modules');
    modulesDiv.innerHTML = '';

    course.modules.sort((a, b) => a.order - b.order);
    course.modules.forEach(module => {
        module.lessons.sort((a, b) => a.order - b.order);
        const moduleBlock = document.createElement('div');
        moduleBlock.className = 'module';
        moduleBlock.innerHTML = `<h3>${module.title}</h3>`;

      module.lessons.forEach(lesson => {
        const link = document.createElement('div');
        link.className = 'lesson-link';
        link.textContent = lesson.title;

        link.onclick = () => loadLesson(lesson.id, link);

        moduleBlock.appendChild(link);
      });
      modulesDiv.appendChild(moduleBlock);
    });
  }
  async function loadLesson(lessonId, clickedEl) {
    const preview = document.getElementById('lessonPreview');

    preview.innerHTML = `
      <p style="opacity:.6">Завантаження уроку...</p>
    `;

    const res = await fetch(`/api/lessons/${lessonId}`);
    const data = await res.json();

    preview.innerHTML = `
      <div class="lesson-card">
        <h2>${data.title}</h2>
        <div class="lesson-content">
          ${marked.parse(data.content)}
        </div>
      </div>
    `;

    document.querySelectorAll('.lesson-link')
      .forEach(el => el.classList.remove('active'));

    clickedEl.classList.add('active');
  }


  loadCourse();