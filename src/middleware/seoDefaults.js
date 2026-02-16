const seoDefaults = (req, res, next) => {
    const siteUrl = process.env.SITE_URL || 'https://techindustry.app';
    const path = req.path || '/';

    res.locals.metaDescription = 'TechIndustry platform for IT learning: courses, quizzes, gamification, and certificates.';
    res.locals.ogType = 'website';
    res.locals.ogTitle = res.locals.title || 'TechIndustry';
    res.locals.ogDescription = res.locals.metaDescription;
    res.locals.ogImage = 'https://techindustry.app/assets/img/og-default.png';
    res.locals.noindex = false;
    res.locals.extraCss = [];
    res.locals.extraLibs = [];
    res.locals.extraScripts = [];
    res.locals.extraFonts = null;
    res.locals.structuredData = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'TechIndustry',
        url: `${siteUrl}${path}`
    });

    next();
};

module.exports = seoDefaults;
