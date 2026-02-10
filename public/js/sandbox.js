let codeEditor;
const defaultTemplate = `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;600&display=swap');
        
        body {
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #0f172a;
            font-family: 'Poppins', sans-serif;
            overflow: hidden;
        }

        .card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            color: white;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            transform: translateY(0);
            transition: all 0.3s ease;
            max-width: 300px;
        }

        .card:hover {
            transform: translateY(-10px);
            box-shadow: 0 30px 60px rgba(99, 102, 241, 0.3);
            border-color: #6366f1;
        }

        h1 {
            margin: 0 0 10px;
            background: linear-gradient(90deg, #6366f1, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p { color: #94a3b8; font-size: 14px; margin-bottom: 30px; }

        button {
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            border: none;
            padding: 12px 24px;
            color: white;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }

        button:active { transform: scale(0.95); }
        
        #counter {
            font-size: 40px;
            font-weight: bold;
            display: block;
            margin-top: 20px;
            color: #fff;
        }
    </style>
</head>
<body>

    <div class="card">
        <h1>TechIndustry</h1>
        <p>Інтерактивний редактор коду</p>
        <button id="clickBtn">Натисни мене ✨</button>
        <span id="counter">0</span>
    </div>

    <script>
        const btn = document.getElementById('clickBtn');
        const counterDisplay = document.getElementById('counter');
        let count = 0;

        btn.addEventListener('click', () => {
            count++;
            counterDisplay.innerText = count;
            const colors = ['#6366f1', '#a855f7', '#ec4899', '#22c55e'];
            counterDisplay.style.color = colors[Math.floor(Math.random() * colors.length)];
            
            console.log(\`Клік номер: \${count}\`);
        });
        
        console.log('Sandbox готовий до роботи! 🚀');
    </script>
</body>
</html>`;

document.addEventListener('DOMContentLoaded', () => {
    initEditor();
    setupEventListeners();
});

function initEditor() {
    const textArea = document.getElementById('codeEditor');
    codeEditor = CodeMirror.fromTextArea(textArea, {
        mode: 'htmlmixed',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Ctrl-Enter": runCode
        }
    });

    const saved = localStorage.getItem('sandbox_code');
    if (!saved || saved.trim() === '') {
        codeEditor.setValue(defaultTemplate);
    } else {
        codeEditor.setValue(saved);
    }

    codeEditor.on('change', () => {
        localStorage.setItem('sandbox_code', codeEditor.getValue());
        updateLineCount();
    });
    updateLineCount();
    setTimeout(runCode, 500);
}

function setupEventListeners() {
    document.getElementById('runBtn').addEventListener('click', runCode);
    document.getElementById('formatBtn').addEventListener('click', formatCode);
    document.getElementById('clearBtn').addEventListener('click', clearCode);
    const consoleBtn = document.getElementById('consoleBtn');
    if(consoleBtn) consoleBtn.addEventListener('click', toggleConsole);
    const clearConsoleBtn = document.getElementById('clearConsoleBtn');
    if(clearConsoleBtn) clearConsoleBtn.addEventListener('click', clearConsole);
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if(fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
    window.addEventListener('message', (event) => {
        if (event.data.type === 'console') {
            logToConsole(event.data.method, event.data.args);
        }
    });
}

function updateLineCount() {
    const count = codeEditor.lineCount();
    const el = document.getElementById('lineCount');
    if(el) el.textContent = `Lines: ${count}`;
}

function runCode() {
    const code = codeEditor.getValue();
    const preview = document.getElementById('preview');
    const consoleInject = `
    <script>
        (function(){
            const oldLog = console.log;
            const oldError = console.error;
            const oldWarn = console.warn;
            
            function send(method, args) {
                window.parent.postMessage({
                    type: 'console',
                    method: method,
                    args: Array.from(args).map(a => String(a))
                }, '*');
            }

            console.log = function(...args) { send('log', args); oldLog.apply(console, args); };
            console.error = function(...args) { send('error', args); oldError.apply(console, args); };
            console.warn = function(...args) { send('warn', args); oldWarn.apply(console, args); };
            window.onerror = function(msg, url, line) {
                send('error', [msg + " (Line: " + line + ")"]);
            };
        })();
    </script>
    `;

    let finalCode = code;
    if (code.includes('<head>')) {
        finalCode = code.replace('<head>', '<head>' + consoleInject);
    } else {
        finalCode = consoleInject + code;
    }
    preview.srcdoc = finalCode;
}

function formatCode() {
    const totalLines = codeEditor.lineCount();
    const range = {
        from: {line: 0, ch: 0},
        to: {line: totalLines, ch: 0}
    };

    try {
        codeEditor.autoFormatRange(range.from, range.to);
        codeEditor.setCursor({line: 0, ch: 0});
    } catch (e) {
        console.error("Помилка форматування:", e);
        for (let i = 0; i < totalLines; i++) {
            codeEditor.indentLine(i);
        }
    }
}

function clearCode() {
    if(confirm("Ви впевнені, що хочете очистити редактор? Це видалить ваш поточний код.")) {
        const skeleton = `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; padding: 20px; }
    </style>
</head>
<body>
    <h1>Hello World</h1>
    <script>
        console.log('Start coding...');
    </script>
</body>
</html>`;
        codeEditor.setValue(skeleton);
        runCode();
    }
}

function toggleConsole() {
    const panel = document.getElementById('consolePanel');
    panel.classList.toggle('active');
}

function clearConsole() {
    document.getElementById('consoleOutput').innerHTML = '';
}

function logToConsole(method, args) {
    const output = document.getElementById('consoleOutput');
    const row = document.createElement('div');
    row.className = `console-log ${method}`;

    const time = new Date().toLocaleTimeString('uk-UA', { hour12: false });
    row.textContent = `[${time}] ${args.join(' ')}`;

    output.appendChild(row);
    output.scrollTop = output.scrollHeight;
}

function toggleFullscreen() {
    const panel = document.querySelector('.preview-panel');
    panel.classList.toggle('fullscreen');
}