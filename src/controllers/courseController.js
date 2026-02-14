const courseService = require('../services/courseService');
const progressService = require('../services/progressService');

exports.renderCourses = async (req, res) => {
  try {
    const allCourses = await courseService.getAllCourses();
    let userProgress = [];
    const userId = res.locals.user ? res.locals.user.id : null;
    if (userId) {
      userProgress = await progressService.getUserProgress(userId);
    }
    const coursesWithProgress = allCourses.map(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      let totalLessons = 0;
      course.modules.forEach(m => totalLessons += (m.lessons?.length || 0));
      const completedCount = progress?.completed_lessons?.length || 0;
      const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      return {
        ...course.toJSON(),
        userProgress: progress,
        progressPercent: percent,
        totalLessons,
        totalHours: totalLessons * 2,
        isCompleted: progress?.status === 'completed',
        isInProgress: progress && progress.status !== 'completed',
        isGuest: !userId
      };
    });
    res.render('courses', {
      title: 'Каталог курсів | TechIndustry',
      metaDescription: 'Повний каталог IT курсів: JavaScript, Python, React, Node.js. Вибирайте курс та починайте навчання з TechIndustry.',
      ogTitle: 'Каталог IT курсів — TechIndustry',
      ogDescription: 'Онлайн курси програмування для початківців та професіоналів. Практичні завдання та сертифікати.',
      extraCss: ['/css/courses.css'],
      courses: coursesWithProgress,
      csrfToken: req.csrfToken ? req.csrfToken() : ''
    });
  } catch (error) {
    console.error('renderCourses error:', error);
    res.status(500).send('Помилка завантаження каталогу');
  }
};

exports.renderCourseDetail = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await courseService.getCourseBySlug(slug);
    if (!course) return res.status(404).send('Курс не знайдено');

    let completedLessons = [];
    const isLoggedIn = !!res.locals.user;
    if (isLoggedIn) {
      const progress = await progressService.getUserProgressByCourse(res.locals.user.id, course.id);
      completedLessons = progress?.completed_lessons || [];
    }

    const coursePlain = course.get({ plain: true });
    coursePlain.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        lesson.isCompleted = completedLessons.includes(lesson.id);
      });
    });

    const metaDescription = coursePlain.description
        ? `${coursePlain.description.substring(0, 150)}... Навчайтесь на TechIndustry.`
        : `Курс ${coursePlain.title} — практичне навчання з сертифікатом на TechIndustry.`;

    res.render('course', {
      title: `${coursePlain.title} | TechIndustry`,
      metaDescription,
      ogTitle: `Курс: ${coursePlain.title}`,
      ogDescription: metaDescription,
      ogImage: coursePlain.thumbnail || 'https://techindustry.app/assets/img/og-course.png',
      course: coursePlain,
      extraCss: ['/css/course.css'],
      isLoggedIn,
      slug,
      csrfToken: req.csrfToken ? req.csrfToken() : ''
    });
  } catch (error) {
    console.error('renderCourseDetail error:', error);
    res.status(500).send('Помилка');
  }
};

exports.getLessonContent = async (req, res) => {
  try {
    const lessonData = await courseService.getLessonContent(req.params.lessonId);
    res.json(lessonData);
  } catch (error) {
    console.error('getLessonContent error:', error);
    res.status(404).json({ message: error.message });
  }
};