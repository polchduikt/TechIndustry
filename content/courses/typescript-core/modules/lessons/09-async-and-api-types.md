# Асинхронність і типізація API

Асинхронний код у TypeScript стає значно надійнішим, якщо чітко типізувати відповіді API та помилки.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- типізувати `Promise`-результати
- описувати API-моделі через інтерфейси
- робити безпечну обробку помилок
- будувати перевіряємий сервісний шар

---

## 🧠 Теорія

### `Promise<T>`
```ts
async function getVersion(): Promise<string> {
  return "1.0.0";
}
```

---

### Моделі запиту/відповіді
```ts
interface Post {
  id: number;
  title: string;
}

interface ApiResult<T> {
  success: boolean;
  data: T;
}
```

---

### Обробка помилок
```ts
try {
  // network call
} catch (e: unknown) {
  if (e instanceof Error) {
    console.error(e.message);
  }
}
```

---
### Глибше про надійність інтеграцій
Більшість продакшен-помилок у вебзастосунках пов'язана з некоректними очікуваннями щодо API-відповідей. Типізація не гарантує, що зовнішній сервіс завжди поверне правильні дані, але змушує явно обробити очікувані сценарії.

Для критичних інтеграцій варто поєднувати TypeScript-типи з runtime-валидацією, щоб захиститися від неконсистентних відповідей.

## 💻 Практичний приклад

```ts
interface User {
  id: number;
  name: string;
}

async function fetchUser(id: number): Promise<ApiResult<User>> {
  return {
    success: true,
    data: { id, name: "Olena" }
  };
}

fetchUser(1).then((res) => console.log(res.data.name));
```

---

## 📝 Підсумки
- типізований API-код легше підтримувати
- `unknown` у `catch` робить обробку помилок безпечнішою
- контракти між backend/frontend стають прозорішими
