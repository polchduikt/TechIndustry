const courseService = require('../services/courseService');

exports.renderIndex = async (req, res) => {
    try {
        const allCourses = await courseService.getAllCourses();
        const popularCourses = allCourses.slice(0, 4);
        res.render('index', {
            title: 'Головна | TechIndustry',
            courses: popularCourses
        });
    } catch (error) {
        console.error('Error rendering home:', error);
        res.status(500).send('Server Error');
    }
};