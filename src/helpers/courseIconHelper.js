function getCourseIcon(category, slug, title) {
    const slugLower = (slug || '').toLowerCase();
    const titleLower = (title || '').toLowerCase();
    const categoryLower = (category || '').toLowerCase();

    // JavaScript
    if (slugLower.includes('javascript') || slugLower.includes('js-') ||
        titleLower.includes('javascript')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/javascript.svg" 
                     alt="JavaScript" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // TypeScript
    if (slugLower.includes('typescript') || slugLower.includes('ts-') ||
        titleLower.includes('typescript')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/typescript.svg" 
                     alt="TypeScript" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Python
    if (slugLower.includes('python') || titleLower.includes('python')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/python.svg" 
                     alt="Python" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // React
    if (slugLower.includes('react') || titleLower.includes('react')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/react.svg" 
                     alt="React" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Vue.js
    if (slugLower.includes('vue') || titleLower.includes('vue')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/vuedotjs.svg" 
                     alt="Vue" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Angular
    if (slugLower.includes('angular') || titleLower.includes('angular')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/angular.svg" 
                     alt="Angular" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Node.js
    if (slugLower.includes('node') || titleLower.includes('node')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/nodedotjs.svg" 
                     alt="Node.js" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Next.js
    if (slugLower.includes('next') || titleLower.includes('next')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/nextdotjs.svg" 
                     alt="Next.js" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Express
    if (slugLower.includes('express') || titleLower.includes('express')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/express.svg" 
                     alt="Express" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Django
    if (slugLower.includes('django') || titleLower.includes('django')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/django.svg" 
                     alt="Django" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Flask
    if (slugLower.includes('flask') || titleLower.includes('flask')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/flask.svg" 
                     alt="Flask" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // PostgreSQL
    if (slugLower.includes('postgres') || titleLower.includes('postgres')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/postgresql.svg" 
                     alt="PostgreSQL" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // MySQL
    if (slugLower.includes('mysql') || titleLower.includes('mysql')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mysql.svg" 
                     alt="MySQL" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // MongoDB
    if (slugLower.includes('mongo') || titleLower.includes('mongo')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mongodb.svg" 
                     alt="MongoDB" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Redis
    if (slugLower.includes('redis') || titleLower.includes('redis')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/redis.svg" 
                     alt="Redis" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Docker
    if (slugLower.includes('docker') || titleLower.includes('docker')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/docker.svg" 
                     alt="Docker" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Kubernetes
    if (slugLower.includes('kubernetes') || slugLower.includes('k8s') ||
        titleLower.includes('kubernetes')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/kubernetes.svg" 
                     alt="Kubernetes" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Git
    if (slugLower.includes('git') && !slugLower.includes('github') && !slugLower.includes('gitlab')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/git.svg" 
                     alt="Git" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // GitHub
    if (slugLower.includes('github') || titleLower.includes('github')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg" 
                     alt="GitHub" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // AWS
    if (slugLower.includes('aws') || titleLower.includes('amazon web services')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/amazonaws.svg" 
                     alt="AWS" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Java
    if (slugLower.includes('java') && !slugLower.includes('javascript')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/openjdk.svg" 
                     alt="Java" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // C++
    if (slugLower.includes('cpp') || slugLower.includes('c++') ||
        titleLower.includes('c++')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/cplusplus.svg" 
                     alt="C++" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // C#
    if (slugLower.includes('csharp') || slugLower.includes('c#') ||
        titleLower.includes('c#')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/csharp.svg" 
                     alt="C#" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Go
    if (slugLower.includes('golang') || (slugLower.includes('go') && !slugLower.includes('mongo')) ||
        titleLower.includes('golang')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/go.svg" 
                     alt="Go" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Rust
    if (slugLower.includes('rust') || titleLower.includes('rust')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/rust.svg" 
                     alt="Rust" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Swift
    if (slugLower.includes('swift') || titleLower.includes('swift')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/swift.svg" 
                     alt="Swift" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Kotlin
    if (slugLower.includes('kotlin') || titleLower.includes('kotlin')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/kotlin.svg" 
                     alt="Kotlin" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // PHP
    if (slugLower.includes('php') || titleLower.includes('php')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/php.svg" 
                     alt="PHP" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Laravel
    if (slugLower.includes('laravel') || titleLower.includes('laravel')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/laravel.svg" 
                     alt="Laravel" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Ruby
    if (slugLower.includes('ruby') || titleLower.includes('ruby')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/ruby.svg" 
                     alt="Ruby" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Rails
    if (slugLower.includes('rails') || titleLower.includes('rails')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/rubyonrails.svg" 
                     alt="Rails" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // TensorFlow
    if (slugLower.includes('tensorflow') || titleLower.includes('tensorflow')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/tensorflow.svg" 
                     alt="TensorFlow" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // PyTorch
    if (slugLower.includes('pytorch') || titleLower.includes('pytorch')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/pytorch.svg" 
                     alt="PyTorch" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Pandas
    if (slugLower.includes('pandas') || titleLower.includes('pandas')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/pandas.svg" 
                     alt="Pandas" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // NumPy
    if (slugLower.includes('numpy') || titleLower.includes('numpy')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/numpy.svg" 
                     alt="NumPy" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Jupyter
    if (slugLower.includes('jupyter') || titleLower.includes('jupyter')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/jupyter.svg" 
                     alt="Jupyter" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // HTML5
    if (slugLower.includes('html') || titleLower.includes('html')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/html5.svg" 
                     alt="HTML5" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // CSS3
    if (slugLower.includes('css') || titleLower.includes('css')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/css3.svg" 
                     alt="CSS3" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Tailwind CSS
    if (slugLower.includes('tailwind') || titleLower.includes('tailwind')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/tailwindcss.svg" 
                     alt="Tailwind" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Bootstrap
    if (slugLower.includes('bootstrap') || titleLower.includes('bootstrap')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/bootstrap.svg" 
                     alt="Bootstrap" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // Sass
    if (slugLower.includes('sass') || titleLower.includes('sass')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/sass.svg" 
                     alt="Sass" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // GraphQL
    if (slugLower.includes('graphql') || titleLower.includes('graphql')) {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/graphql.svg" 
                     alt="GraphQL" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    // CATEGORY-BASED FALLBACKS

    if (categoryLower === 'frontend' || categoryLower === 'front-end') {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/react.svg" 
                     alt="Frontend" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    if (categoryLower === 'backend' || categoryLower === 'back-end') {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/nodedotjs.svg" 
                     alt="Backend" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    if (categoryLower === 'data' || categoryLower === 'data science') {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/python.svg" 
                     alt="Data Science" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    if (categoryLower === 'mobile') {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/react.svg" 
                     alt="Mobile" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    if (categoryLower === 'devops') {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/docker.svg" 
                     alt="DevOps" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    if (categoryLower === 'ai' || categoryLower === 'ml' || categoryLower === 'machine learning') {
        return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/tensorflow.svg" 
                     alt="AI/ML" 
                     style="width: 48px; height: 48px; filter: invert(1);">`;
    }

    return `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/visualstudiocode.svg" 
                 alt="Code" 
                 style="width: 48px; height: 48px; filter: invert(1);">`;
}

module.exports = getCourseIcon;