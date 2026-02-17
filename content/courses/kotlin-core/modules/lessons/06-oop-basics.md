# Основи ООП у Kotlin

Kotlin підтримує повноцінний ООП: класи, наслідування, інтерфейси, інкапсуляцію та поліморфізм.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- створювати класи та об'єкти
- використовувати наслідування через `open` і `override`
- працювати з інтерфейсами
- проєктувати прості ієрархії класів

---

## 🧠 Теорія

### Класи і конструктори
```kotlin
class User(val id: Int, var name: String)
```

---

### Наслідування
```kotlin
open class Animal(val name: String) {
    open fun sound() = "..."
}

class Dog(name: String) : Animal(name) {
    override fun sound() = "Гав"
}
```

---

### Інтерфейси
```kotlin
interface Logger {
    fun log(message: String)
}

class ConsoleLogger : Logger {
    override fun log(message: String) {
        println("LOG: $message")
    }
}
```

---
### Глибше про моделювання домену
ООП у Kotlin найкраще працює, коли класи відображають реальні сутності предметної області: користувач, замовлення, платіж, підписка. Якщо модель названа правильно і має чіткі межі, бізнес-правила стають очевиднішими.

Інтерфейси варто застосовувати для контрактів між шарами (наприклад, `Repository`, `Notifier`), а реалізації тримати окремо. Це спрощує заміну інфраструктури та тестування моками.

## 💻 Практичний приклад

```kotlin
open class Employee(val name: String) {
    open fun info(): String = "Працівник: $name"
}

class Developer(name: String, private val stack: String) : Employee(name) {
    override fun info(): String = "Розробник: $name, стек: $stack"
}

fun main() {
    val dev = Developer("Марко", "Kotlin/Spring")
    println(dev.info())
}
```

---

## 📝 Підсумки
- Kotlin робить ООП компактним
- `open`/`override` контролюють розширення поведінки
- інтерфейси дозволяють чисто розділяти контракти і реалізації
