const seoDefaults = (req, res, next) => {
    res.locals.metaDescription = 'Платформа для навчання IT: курси, тести, гейміфікація та сертифікати.';
    res.locals.ogType = 'website';
    res.locals.ogTitle = res.locals.title || 'TechIndustry';
    res.locals.ogDescription = res.locals.metaDescription;
    res.locals.ogImage = 'https://techindustry.app/assets/img/og-default.png';
    res.locals.noindex = false;
    res.locals.extraCss = [];
    res.locals.extraLibs = [];
    res.locals.extraScripts = [];
    res.locals.extraFonts = null;
    next();
};

module.exports = seoDefaults;