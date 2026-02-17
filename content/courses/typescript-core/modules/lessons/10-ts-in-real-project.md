# TypeScript у реальному проєкті

У продакшені TypeScript працює найкраще, коли типи покривають усі шари: UI, бізнес-логіку, API, інфраструктуру.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- організувати структуру TS-проєкту
- стандартизувати правила типізації
- підготувати кодову базу до масштабування
- обрати практики для довгострокової підтримки

---

## 🧠 Теорія

### Архітектурні принципи
- `strict` за замовчуванням
- мінімум `any`
- окремі типи для DTO та доменної моделі
- єдина політика лінтингу

```ts
export interface RequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  body?: unknown;
}
```

---

### Структура папок
- `src/types`
- `src/modules`
- `src/services`
- `src/utils`

---

### Технічна дисципліна
- ESLint + Prettier
- unit tests
- CI-перевірка `tsc --noEmit`

---
### Глибше про масштабування кодової бази
Коли проєкт зростає, головною проблемою стає не написання нового коду, а безпечна зміна існуючого. TypeScript допомагає проводити великі рефакторинги контрольовано: компілятор показує точки, які потрібно оновити.

Разом із CI-перевірками, тестами та єдиними правилами лінтингу це формує передбачуваний цикл поставки змін у продакшен.

## 💻 Практичний приклад

```ts
interface Course {
  id: number;
  title: string;
}

interface CourseService {
  getAll(): Promise<Course[]>;
  getById(id: number): Promise<Course | null>;
}

class ApiCourseService implements CourseService {
  async getAll(): Promise<Course[]> {
    return [{ id: 1, title: "TS Core" }];
  }

  async getById(id: number): Promise<Course | null> {
    const items = await this.getAll();
    return items.find((x) => x.id === id) ?? null;
  }
}
```

---

## 📝 Підсумки
- якість TS-проєкту визначається не лише синтаксисом, а й правилами команди
- чіткі контракти зменшують вартість змін
- стандарти з першого дня прискорюють розвиток продукту
