# Колекції в Kotlin

Колекції в Kotlin мають потужний набір операцій, що дозволяє обробляти дані декларативно.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- працювати з `List`, `Set`, `Map`
- використовувати `map`, `filter`, `groupBy`
- розуміти різницю між immutable та mutable колекціями
- писати чисту обробку даних без зайвих циклів

---

## 🧠 Теорія

### Типи колекцій
```kotlin
val list = listOf(1, 2, 3)
val mutable = mutableListOf("a", "b")
```

---

### Трансформації
```kotlin
val doubled = list.map { it * 2 }
val even = list.filter { it % 2 == 0 }
```

---

### Групування і сортування
```kotlin
val grouped = listOf("qa", "dev", "design", "data").groupBy { it.length }
println(grouped)
```

---
### Глибше про продуктивність колекцій
Ланцюжки операцій `map/filter/sorted` дуже зручні, але у великих обсягах даних можуть створювати зайві проміжні колекції. Для гарячих ділянок варто перевіряти вартість операцій і за потреби використовувати `asSequence()`.

Баланс між читабельністю і продуктивністю досягається профілюванням, а не здогадками. Спочатку пиши чисто, потім оптимізуй виміряні вузькі місця.

## 💻 Практичний приклад

```kotlin
data class Student(val name: String, val score: Int)

fun main() {
    val students = listOf(
        Student("Оля", 95),
        Student("Тарас", 72),
        Student("Ірина", 88)
    )

    val top = students
        .filter { it.score >= 80 }
        .sortedByDescending { it.score }
        .map { "${it.name}: ${it.score}" }

    println(top)
}
```

---

## 📝 Підсумки
- колекції — основа обробки даних у Kotlin
- функціональні операції зменшують шаблонний код
- immutable-підхід спрощує дебаг і тестування
