# Функції, union і type alias

Функції в TypeScript можуть бути суворо типізовані, а `union` та `type alias` роблять моделі гнучкими і читабельними.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- задавати типи параметрів і результату функцій
- використовувати union-типи
- створювати повторно використовувані type alias
- будувати чисті контракти для API і сервісів

---

## 🧠 Теорія

### Типізація функцій
```ts
function multiply(a: number, b: number): number {
  return a * b;
}
```

---

### Union-типи
```ts
type Id = string | number;

function printId(id: Id): string {
  return `ID: ${id}`;
}
```

---

### Type alias
```ts
type OrderStatus = "new" | "paid" | "cancelled";
```

---
### Глибше про контракти функцій
Типізована сигнатура функції — це обіцянка: що функція приймає, що повертає, які варіанти станів підтримує. Якщо контракти продумані, інтеграція між модулями відбувається без "сюрпризів".

Union-типи особливо корисні для моделювання бізнес-станів, де допустимий лише обмежений набір значень.

## 💻 Практичний приклад

```ts
type Currency = "UAH" | "USD";

type Payment = {
  amount: number;
  currency: Currency;
};

function formatPayment(payment: Payment): string {
  return `${payment.amount} ${payment.currency}`;
}

console.log(formatPayment({ amount: 499, currency: "UAH" }));
```

---

## 📝 Підсумки
- явні сигнатури функцій покращують передбачуваність
- union-типи зручні для бізнес-правил
- alias спрощують повторне використання типів
