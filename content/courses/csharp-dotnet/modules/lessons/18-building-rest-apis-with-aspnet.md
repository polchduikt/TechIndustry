# Building REST APIs with ASP.NET Core

REST API — це стандартний спосіб обміну даними між клієнтом і сервером.
ASP.NET Core надає всі необхідні інструменти для **створення надійних,
масштабованих та зрозумілих REST API**.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- розуміти принципи REST
- створювати REST API в ASP.NET Core
- працювати з HTTP-методами
- повертати коректні HTTP-відповіді
- будувати чисту структуру API

---

## 🧠 Теорія

### Що таке REST
**REST (Representational State Transfer)** — це архітектурний стиль
для побудови вебсервісів.

Основні принципи REST:
- клієнт–сервер
- stateless
- використання HTTP
- робота з ресурсами

---

### Ресурси та URL
У REST все є ресурсом.

Приклади:
- `/users`
- `/users/1`
- `/products`

📌 URL описує ресурс, а HTTP-метод — дію.

---

### HTTP-методи
Основні HTTP-методи:

- `GET` — отримання даних
- `POST` — створення даних
- `PUT` — оновлення всього ресурсу
- `PATCH` — часткове оновлення
- `DELETE` — видалення

---

### Контролери
REST API в ASP.NET Core будується на контролерах.

```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
}
```

📌 `[ApiController]` спрощує валідацію та роботу з HTTP.

---

### GET-запит
```csharp
[HttpGet]
public IActionResult GetUsers()
{
    return Ok(new[] { "Anna", "Oleh" });
}
```

---

### GET за id
```csharp
[HttpGet("{id}")]
public IActionResult GetUser(int id)
{
    return Ok($"User {id}");
}
```

---

### POST-запит
```csharp
[HttpPost]
public IActionResult CreateUser(string name)
{
    return Created("", name);
}
```

---

### PUT-запит
```csharp
[HttpPut("{id}")]
public IActionResult UpdateUser(int id, string name)
{
    return NoContent();
}
```

---

### DELETE-запит
```csharp
[HttpDelete("{id}")]
public IActionResult DeleteUser(int id)
{
    return NoContent();
}
```

---

### HTTP-коди відповіді
Коректні коди відповіді — важлива частина REST:

- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `404 Not Found`

---

### DTO (Data Transfer Object)
DTO використовується для передачі даних між клієнтом і сервером.

```csharp
public class CreateUserDto
{
    public string Name { get; set; }
}
```

📌 DTO відокремлює API від внутрішньої моделі.

---

## 💻 Повний приклад

```csharp
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new[] { "Anna", "Oleh" });
    }

    [HttpPost]
    public IActionResult Post(CreateUserDto dto)
    {
        return Created("", dto);
    }
}
```

---

## 📝 Підсумки
- REST — стандарт для API
- HTTP-методи визначають дію
- Контролери керують логікою
- DTO роблять API чистішим
- HTTP-коди важливі для клієнта
