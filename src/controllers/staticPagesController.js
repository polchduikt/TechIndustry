class StaticPagesController {
    renderAbout(req, res) {
        res.render('about', {
            title: 'Про нас | TechIndustry',
            metaDescription: 'Дізнайтеся більше про TechIndustry — платформу для навчання програмуванню з практичними курсами та сертифікатами.',
            ogTitle: 'Про TechIndustry — навчальна IT платформа',
            ogDescription: 'Місія, команда та цінності TechIndustry. Практичне навчання IT для всіх.',
            extraCss: ['/css/about.css'],
            noindex: false
        });
    }

    renderFAQ(req, res) {
        res.render('faq', {
            title: 'FAQ | TechIndustry',
            metaDescription: 'Відповіді на часті запитання про навчання, курси, сертифікати та гейміфікацію на TechIndustry.',
            ogTitle: 'FAQ — Часті питання | TechIndustry',
            ogDescription: 'Знайдіть відповіді на найпопулярніші питання про платформу TechIndustry.',
            extraCss: ['/css/faq.css'],
            noindex: false
        });
    }

    renderLogin(req, res) {
        res.render('login', {
            title: 'Вхід | TechIndustry',
            metaDescription: 'Увійдіть у свій акаунт TechIndustry для доступу до курсів, тестів та вашого прогресу навчання.',
            ogTitle: 'Вхід в акаунт | TechIndustry',
            ogDescription: 'Авторизуйтесь для продовження навчання на TechIndustry.',
            extraCss: ['/css/login.css'],
            noindex: true
        });
    }

    renderSandbox(req, res) {
        res.render('sandbox', {
            title: 'Sandbox | TechIndustry',
            metaDescription: 'Інтерактивна пісочниця для експериментів з кодом на TechIndustry. Практикуйте програмування в реальному часі.',
            ogTitle: 'Code Sandbox — Онлайн редактор коду',
            ogDescription: 'Експериментуйте з кодом в безпечному середовищі. Онлайн sandbox для практики програмування.',
            extraFonts: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&display=swap',
            extraLibs: [
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/monokai.min.css',
                'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/hint/show-hint.css'
            ],
            extraCss: ['/css/sandbox.css'],
            noindex: true
        });
    }
}

module.exports = new StaticPagesController();