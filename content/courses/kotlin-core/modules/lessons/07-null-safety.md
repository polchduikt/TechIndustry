# Null Safety у Kotlin

Kotlin на рівні типів захищає від найпоширеніших помилок, пов'язаних із `null`.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- розрізняти nullable і non-null типи
- використовувати `?.`, `?:`, `let`
- уникати зайвого використання `!!`
- писати безпечніший код для продакшену

---

## 🧠 Теорія

### Nullable типи
```kotlin
val title: String = "Kotlin"
val subtitle: String? = null
```

---

### Безпечний доступ
```kotlin
val len = subtitle?.length ?: 0
println(len)
```

---

### `let` для умовної роботи
```kotlin
subtitle?.let {
    println("Підзаголовок: $it")
}
```

---
### Глибше про роботу з відсутніми даними
`null` часто означає не помилку, а допустимий стан: "дані ще не завантажені", "поле не заповнено", "ресурс не знайдено". Важливо заздалегідь домовлятися, де `null` дозволений, а де потрібно повертати явний результат (наприклад, sealed-стан).

Продумана стратегія для `null` значно зменшує кількість аварій у продакшені та робить поведінку API передбачуваною.

## 💻 Практичний приклад

```kotlin
data class Profile(val email: String?)

fun sendWelcome(profile: Profile) {
    val address = profile.email ?: return
    println("Надсилаємо лист на: $address")
}

fun main() {
    sendWelcome(Profile("user@techindustry.com"))
    sendWelcome(Profile(null))
}
```

---

## 📝 Підсумки
- `null safety` — одна з найсильніших сторін Kotlin
- Elvis (`?:`) дає чистий fallback
- `!!` варто використовувати тільки в контрольованих місцях
