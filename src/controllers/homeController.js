const courseService = require('../services/courseService');

exports.renderIndex = async (req, res) => {
    try {
        const allCourses = await courseService.getAllCourses();
        const popularCourses = allCourses.slice(0, 4);
        res.render('index', {
            title: 'Головна | TechIndustry',
            metaDescription: 'Практичне навчання IT: курси по JavaScript, Python, React. Тести, гейміфікація, прогрес та сертифікати на TechIndustry.',
            ogTitle: 'TechIndustry — навчання програмуванню онлайн',
            ogDescription: 'Вивчайте програмування з TechIndustry: курси, практичні завдання, тести та сертифікати.',
            ogImage: 'https://techindustry.app/assets/img/og-home.png',
            courses: popularCourses,
            csrfToken: req.csrfToken ? req.csrfToken() : ''
        });
    } catch (error) {
        console.error('Error rendering home:', error);
        res.status(500).send('Server Error');
    }
};