let chatHistory = [];
let isFullscreen = false;

function getCsrfToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : '';
}

async function initMentor() {
    restoreChatHistory();
}

document.addEventListener('DOMContentLoaded', initMentor);

async function syncStatusWithServer() {
    try {
        const response = await fetch('/api/ai/status', { credentials: 'include' });
        const status = await response.json();
        updateUIFromStatus(status);
    } catch (err) {
        console.error('Помилка синхронізації статусу:', err);
    }
}

function updateUIFromStatus(status) {
    const { count, limit, resetTime } = status;
    const timerEl = document.getElementById('resetTimer');
    const countEl = document.getElementById('limitCount');
    if (countEl) {
        countEl.textContent = count;
    }

    const limitContainer = document.getElementById('mentorLimit');
    if (limitContainer) {
        limitContainer.classList.remove('warning', 'danger');
        if (count >= limit) limitContainer.classList.add('danger');
        else if (count >= limit * 0.5) limitContainer.classList.add('warning');
    }
    if (resetTime && Date.now() < resetTime) {
        disableInput();
        startLiveTimer(resetTime);
    } else {
        enableInput();
        if (timerEl) timerEl.style.display = 'none';
    }
}

async function sendMessageToMentor() {
    const input = document.getElementById('mentorInput');
    const text = input.value.trim();
    if (!text) return;
    appendMessage('user', text);
    input.value = '';
    showTypingIndicator();
    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': getCsrfToken()
            },
            credentials: 'include',
            body: JSON.stringify({ message: text, history: chatHistory })
        });

        const data = await response.json();
        hideTypingIndicator();

        if (!response.ok) {
            const errorMessage = data.error || 'Сталася помилка. Спробуйте пізніше.';
            appendMessage('mentor', `⚠️ ${errorMessage}`);

            if (data.resetTime) {
                updateUIFromStatus({ count: 10, limit: 10, resetTime: data.resetTime });
            }
            return;
        }
        appendMessage('mentor', data.response);
        if (data.status) {
            updateUIFromStatus(data.status);
        }
    } catch (err) {
        hideTypingIndicator();
        appendMessage('mentor', 'Технічна помилка з\'єднання.');
        console.error('Chat error:', err);
    }
}

function handleMentorKey(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessageToMentor();
    }
}

function startLiveTimer(resetTimestamp) {
    const timerEl = document.getElementById('resetTimer');
    if (timerEl) timerEl.style.display = 'block';
    if (window.mentorTimerInterval) clearInterval(window.mentorTimerInterval);
    window.mentorTimerInterval = setInterval(() => {
        const now = Date.now();
        const diff = resetTimestamp - now;
        if (diff <= 0) {
            clearInterval(window.mentorTimerInterval);
            syncStatusWithServer();
            return;
        }
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const timeString = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        if (timerEl) timerEl.textContent = `Доступ через: ${timeString}`;
    }, 1000);
}

function disableInput() {
    const input = document.getElementById('mentorInput');
    const sendBtn = document.getElementById('mentorSendBtn');
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
}

function enableInput() {
    const input = document.getElementById('mentorInput');
    const sendBtn = document.getElementById('mentorSendBtn');
    if (input) {
        input.disabled = false;
        input.placeholder = 'Запитай про код...';
    }
    if (sendBtn) sendBtn.disabled = false;
}

function toggleMentor() {
    const popup = document.getElementById('mentorPopup');
    if (!popup) return;
    const isVisible = popup.style.display !== 'none';
    if (isVisible) {
        popup.style.display = 'none';
    } else {
        popup.style.display = 'flex';
        syncStatusWithServer();
        setTimeout(() => {
            const container = document.getElementById('mentorMessages');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 100);
    }
}

function toggleFullscreen() {
    const popup = document.getElementById('mentorPopup');
    if (!popup) return;
    isFullscreen = !isFullscreen;
    popup.classList.toggle('fullscreen', isFullscreen);
}

function saveChatHistory() {
    localStorage.setItem('mentor_history', JSON.stringify({
        history: chatHistory,
        timestamp: Date.now()
    }));
}

function restoreChatHistory() {
    const stored = localStorage.getItem('mentor_history');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            chatHistory = data.history || [];
            const container = document.getElementById('mentorMessages');
            const welcomeMsg = container.querySelector('.message.mentor-msg');
            container.innerHTML = '';
            if (welcomeMsg) container.appendChild(welcomeMsg);
            chatHistory.forEach(msg => {
                appendMessageToUI(msg.role === 'user' ? 'user' : 'mentor', msg.parts[0].text, false);
            });
            container.scrollTop = container.scrollHeight;
        } catch (err) {
            console.error('Помилка відновлення історії:', err);
        }
    }
}

function clearChatHistory() {
    localStorage.removeItem('mentor_history');
    chatHistory = [];
    const container = document.getElementById('mentorMessages');
    container.innerHTML = `
        <div class="message mentor-msg">
            Привіт! Я твій IT-ментор. Готовий допомогти з JavaScript, Python або тестами! 🚀
        </div>
    `;
}

function confirmClearChat() {
    if (chatHistory.length === 0) return;
    if (confirm('Очистити всю історію чату?')) {
        clearChatHistory();
        appendMessageToUI('mentor', 'Історію очищено! Почнімо спочатку 🚀');
    }
}

function appendMessage(role, text) {
    chatHistory.push({
        role: role === 'user' ? 'user' : 'model',
        parts: [{ text: text }]
    });
    saveChatHistory();
    appendMessageToUI(role, text);
}

function appendMessageToUI(role, text) {
    const container = document.getElementById('mentorMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role === 'user' ? 'user-msg' : 'mentor-msg'}`;
    if (role === 'mentor') {
        msgDiv.innerHTML = parseMarkdown(text);
    } else {
        msgDiv.textContent = text;
    }
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
    const container = document.getElementById('mentorMessages');
    const indicator = document.createElement('div');
    indicator.id = 'typingIndicator';
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

function parseMarkdown(text) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let html = text;
    html = html.replace(codeBlockRegex, (match, language, code) => {
        const lang = language || 'code';
        const escapedCode = escapeHtml(code.trim());
        const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
        return `
            <div class="code-block">
                <div class="code-header">
                    <span class="code-language">${lang}</span>
                    <button class="code-copy-btn" onclick="copyCode('${codeId}')">Copy</button>
                </div>
                <div class="code-content">
                    <pre><code id="${codeId}">${escapedCode}</code></pre>
                </div>
            </div>`;
    });
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n/g, '<br>');
    return html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyCode(codeId) {
    const text = document.getElementById(codeId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const oldText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = oldText, 2000);
    });
}