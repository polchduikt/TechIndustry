function showTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    const forms = document.querySelectorAll('.form');

    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    button.classList.toggle('active');
}

// Форматування телефону
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, ''); // Видаляємо все крім цифр

    // Якщо користувач стирає все, залишаємо +380
    if (value.length === 0) {
        input.value = '+380';
        return;
    }

    // Завжди починаємо з 380
    if (!value.startsWith('380')) {
        value = '380' + value.replace(/^380/, '');
    }

    // Обмежуємо до 12 цифр (380 + 9 цифр)
    value = value.substring(0, 12);

    // Форматуємо: +380XX-XXX-XX-XX
    let formatted = '+380';

    if (value.length > 3) {
        formatted += value.substring(3, 5);
    }
    if (value.length > 5) {
        formatted += '-' + value.substring(5, 8);
    }
    if (value.length > 8) {
        formatted += '-' + value.substring(8, 10);
    }
    if (value.length > 10) {
        formatted += '-' + value.substring(10, 12);
    }

    input.value = formatted;
}

// Ініціалізація поля телефону при завантаженні
document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phoneInput');

    if (phoneInput) {
        // Встановлюємо початкове значення
        phoneInput.value = '+380';

        // Обробник введення
        phoneInput.addEventListener('input', (e) => {
            formatPhoneNumber(e.target);
        });

        // Запобігаємо видаленню +380
        phoneInput.addEventListener('keydown', (e) => {
            const cursorPosition = e.target.selectionStart;
            const selectionEnd = e.target.selectionEnd;
            const hasSelection = cursorPosition !== selectionEnd;

            // Якщо виділено текст і натиснуто Backspace або Delete
            if ((e.key === 'Backspace' || e.key === 'Delete') && hasSelection) {
                // Перевіряємо, чи виділення включає частину +380
                if (cursorPosition < 4) {
                    e.preventDefault();
                    // Видаляємо тільки те, що після +380
                    const value = e.target.value;
                    const beforeSelection = value.substring(0, 4); // +380
                    const afterSelection = value.substring(selectionEnd);
                    e.target.value = beforeSelection + afterSelection;
                    formatPhoneNumber(e.target);
                    e.target.setSelectionRange(4, 4);
                }
                return;
            }

            // Якщо намагаємося видалити частину +380 без виділення
            if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPosition <= 4 && !hasSelection) {
                e.preventDefault();
            }
        });

        // Запобігаємо вставці некоректних даних
        phoneInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const numbers = pastedText.replace(/\D/g, '');

            if (numbers) {
                let value = numbers;
                if (!value.startsWith('380')) {
                    value = '380' + value.replace(/^380/, '');
                }
                e.target.value = '+380';

                // Імітуємо введення для форматування
                const event = new Event('input', { bubbles: true });
                e.target.value = '+' + value;
                formatPhoneNumber(e.target);
            }
        });

        // Запобігаємо кліку перед +380
        phoneInput.addEventListener('click', (e) => {
            if (e.target.selectionStart < 4) {
                e.target.setSelectionRange(e.target.value.length, e.target.value.length);
            }
        });

        // Обробка виділення тексту
        phoneInput.addEventListener('select', (e) => {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;

            // Якщо виділення починається до позиції 4 (+380)
            if (start < 4 && end > 4) {
                // Перемістити початок виділення на позицію 4
                e.target.setSelectionRange(4, end);
            } else if (start < 4 && end <= 4) {
                // Якщо виділено тільки +380, скасувати виділення
                e.target.setSelectionRange(4, 4);
            }
        });
    }
});

async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const messageDiv = document.getElementById('loginMessage');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = result.message;
            setTimeout(() => window.location.href = '/', 1000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = result.message;
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Помилка з\'єднання з сервером';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    // Очищаємо телефон від тире для відправки на сервер
    const phoneInput = document.getElementById('phoneInput');
    const cleanPhone = phoneInput.value.replace(/\D/g, ''); // Тільки цифри

    // Перевіряємо довжину (має бути 380 + 9 цифр = 12)
    if (cleanPhone.length !== 12) {
        const messageDiv = document.getElementById('registerMessage');
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Введіть повний номер телефону';
        return;
    }

    formData.set('phone', '+' + cleanPhone);
    const messageDiv = document.getElementById('registerMessage');

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = result.message;
            setTimeout(() => window.location.href = '/', 1000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = result.message || result.errors?.[0]?.msg;
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Помилка з\'єднання з сервером';
    }
}