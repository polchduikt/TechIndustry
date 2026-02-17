# Основи корутин

Корутини — механізм асинхронності в Kotlin, який дозволяє писати неблокуючий код у звичному послідовному стилі.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- розуміти роль `suspend` функцій
- запускати корутини через `launch` і `async`
- чекати результат через `await`
- організовувати структуру асинхронного коду

---

## 🧠 Теорія

### Базові поняття
- `CoroutineScope`
- `Dispatchers`
- `Job`, `Deferred`

```kotlin
import kotlinx.coroutines.*
```

---

### `launch` і `async`
```kotlin
val job = launch { /* без результату */ }
val deferred = async { 42 } // з результатом
```

---

### `suspend` функції
```kotlin
suspend fun loadData(): String {
    delay(300)
    return "дані готові"
}
```

---
### Глибше про контроль життєвого циклу
Асинхронний код стає небезпечним, якщо задачі живуть довше, ніж потрібний їм контекст. Тому важливо прив'язувати корутини до життєвого циклу компонента (екрану, запиту, сервісу) і своєчасно скасовувати їх.

Структурована конкуренція — це не лише синтаксис, а дисципліна керування ресурсами: менше витоків, менше зависань, стабільніша поведінка системи під навантаженням.

## 💻 Практичний приклад

```kotlin
import kotlinx.coroutines.*

suspend fun loadUser(): String {
    delay(200)
    return "User: Іра"
}

suspend fun loadStats(): String {
    delay(200)
    return "Stats: 128"
}

fun main() = runBlocking {
    val userDeferred = async { loadUser() }
    val statsDeferred = async { loadStats() }

    println(userDeferred.await())
    println(statsDeferred.await())
}
```

---

## 📝 Підсумки
- корутини спрощують асинхронну логіку
- `async/await` зручні для паралельних задач
- структурована конкуренція зменшує витоки ресурсів
