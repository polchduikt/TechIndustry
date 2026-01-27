const courseService = require('../services/courseService');

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await courseService.getCourseBySlug(req.params.slug);
    res.json(course);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getLessonContent = async (req, res) => {
  try {
    const lessonData = await courseService.getLessonContent(req.params.lessonId);
    res.json(lessonData);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};