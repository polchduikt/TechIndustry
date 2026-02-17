# Data class і sealed class

Ці конструкції допомагають моделювати дані та стани максимально прозоро і без зайвого шаблонного коду.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- використовувати `data class` для моделей
- застосовувати `sealed class` для опису станів
- обробляти стани через безпечний `when`
- розділяти успішні та помилкові сценарії

---

## 🧠 Теорія

### `data class`
```kotlin
data class User(val id: Int, val name: String)
```
Автоматично створюються `equals`, `hashCode`, `toString`, `copy`.

---

### `sealed class`
```kotlin
sealed class Result {
    data class Success(val data: String) : Result()
    data class Error(val message: String) : Result()
    object Loading : Result()
}
```

---

### Обробка через `when`
```kotlin
fun render(result: Result): String = when (result) {
    is Result.Success -> "OK: ${result.data}"
    is Result.Error -> "ERR: ${result.message}"
    Result.Loading -> "Loading..."
}
```

---
### Глибше про керування станами
`sealed class` особливо корисний у UI і мережевому шарі, де є обмежений набір станів: завантаження, успіх, помилка. Це змушує явно обробити кожен сценарій і запобігає "мовчазним" пропускам логіки.

Комбінація `data class + sealed class` робить потоки даних прозорими: легко логувати, тестувати та відтворювати складні сценарії.

## 💻 Практичний приклад

```kotlin
data class Article(val id: Int, val title: String)

sealed class ArticleState {
    object Loading : ArticleState()
    data class Loaded(val items: List<Article>) : ArticleState()
    data class Failed(val reason: String) : ArticleState()
}

fun main() {
    val state: ArticleState = ArticleState.Loaded(listOf(Article(1, "Kotlin Guide")))
    println(
        when (state) {
            is ArticleState.Loading -> "Завантаження"
            is ArticleState.Loaded -> "Статей: ${state.items.size}"
            is ArticleState.Failed -> "Помилка: ${state.reason}"
        }
    )
}
```

---

## 📝 Підсумки
- `data class` ідеально підходить для DTO і моделей
- `sealed class` зручний для finite-state логіки
- разом вони спрощують архітектуру і читабельність
