# Класи в TypeScript

Класи в TypeScript розширюють можливості JavaScript-класів за рахунок типів і модифікаторів доступу.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- створювати класи з типізованими полями
- використовувати `public`, `private`, `protected`
- застосовувати `readonly`
- будувати наслідування через `extends`

---

## 🧠 Теорія

### Модифікатори доступу
```ts
class Account {
  public id: number;
  private balance: number;

  constructor(id: number, balance: number) {
    this.id = id;
    this.balance = balance;
  }
}
```

---

### `readonly`
```ts
class User {
  constructor(public readonly email: string) {}
}
```

---

### Наслідування
```ts
class Product {
  constructor(public name: string, protected price: number) {}
}

class Book extends Product {
  getPrice(): number {
    return this.price;
  }
}
```

---
### Глибше про інкапсуляцію
Класи корисні не лише для зберігання полів, а й для захисту інваріантів: наприклад, не дозволяти встановлювати від'ємний баланс або недійсний статус замовлення. Модифікатори доступу допомагають контролювати ці правила централізовано.

Якщо бізнес-обмеження живуть всередині класу, зовнішній код менше залежить від деталей реалізації й стає стабільнішим.

## 💻 Практичний приклад

```ts
class Employee {
  constructor(public name: string, protected rate: number) {}

  calculate(hours: number): number {
    return hours * this.rate;
  }
}

class Developer extends Employee {
  calculate(hours: number): number {
    return super.calculate(hours) + 500;
  }
}

const dev = new Developer("Nazar", 40);
console.log(dev.calculate(20));
```

---

## 📝 Підсумки
- класи формалізують модель предметної області
- модифікатори доступу захищають інваріанти
- наслідування дає повторне використання логіки
