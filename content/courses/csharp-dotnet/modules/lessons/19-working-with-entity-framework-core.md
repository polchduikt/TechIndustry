# Working with Entity Framework Core

Entity Framework Core (EF Core) — це ORM (Object-Relational Mapper),
який дозволяє **працювати з базами даних через C#-класи**,
без написання великої кількості SQL-коду.
EF Core тісно інтегрується з ASP.NET Core і широко використовується в backend-розробці.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- розуміти, що таке ORM та EF Core
- підключати EF Core до ASP.NET Core проєкту
- створювати моделі даних
- працювати з `DbContext`
- виконувати базові CRUD-операції

---

## 🧠 Теорія

### Що таке ORM
**ORM (Object-Relational Mapping)** — це підхід,
який дозволяє відображати таблиці бази даних
на обʼєкти в коді.

Переваги ORM:
- менше SQL-коду
- робота з даними через обʼєкти
- краща читабельність
- швидша розробка

---

### Що таке Entity Framework Core
**Entity Framework Core** — це сучасний ORM від Microsoft
для платформи .NET.

EF Core підтримує:
- PostgreSQL
- SQL Server
- SQLite
- MySQL
- InMemory бази

📌 EF Core працює кросплатформено.

---

### Встановлення EF Core
Для ASP.NET Core Web API зазвичай потрібні пакети:

```bash
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
```

---

### Модель даних
Модель — це клас, який відповідає таблиці в базі даних.

```csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
}
```

📌 Кожен обʼєкт `User` — це рядок у таблиці.

---

### DbContext
`DbContext` — це основний клас для роботи з базою даних.

```csharp
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<User> Users { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }
}
```

---

### Реєстрація DbContext
У `Program.cs` потрібно зареєструвати контекст:

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
```

---

### CRUD-операції

#### Створення (Create)
```csharp
context.Users.Add(new User { Name = "Anna" });
context.SaveChanges();
```

---

#### Читання (Read)
```csharp
var users = context.Users.ToList();
```

---

#### Оновлення (Update)
```csharp
var user = context.Users.First();
user.Name = "Oleh";
context.SaveChanges();
```

---

#### Видалення (Delete)
```csharp
context.Users.Remove(user);
context.SaveChanges();
```

---

### Асинхронні методи
EF Core підтримує асинхронні операції.

```csharp
await context.Users.ToListAsync();
```

📌 У Web API завжди краще використовувати async-методи.

---

### Міграції
Міграції дозволяють керувати схемою бази даних.

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## 💻 Повний приклад

```csharp
[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var users = await _context.Users.ToListAsync();
        return Ok(users);
    }
}
```

---

## 📝 Підсумки
- EF Core — ORM для .NET
- Моделі відображають таблиці
- DbContext керує доступом до БД
- CRUD легко реалізується через EF Core
- Async — стандарт для Web API
