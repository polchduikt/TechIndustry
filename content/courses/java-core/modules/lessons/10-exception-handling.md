# Exception Handling in Java

Обробка винятків — критично важливий механізм, який дозволяє програмам коректно реагувати на помилки та непередбачені ситуації під час виконання.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- розуміти ієрархію винятків у Java
- використовувати try-catch-finally блоки
- створювати власні винятки
- застосовувати best practices обробки помилок

---

## 🧠 Теорія

### Що таке виняток?
Виняток — це подія, яка порушує нормальний потік виконання програми.

```java
int[] numbers = {1, 2, 3};
System.out.println(numbers[10]);  // ArrayIndexOutOfBoundsException
```

📌 Без обробки програма аварійно завершиться.

---

### Ієрархія винятків
```
Throwable
├── Error (системні помилки, не обробляємо)
└── Exception
    ├── RuntimeException (необов'язково обробляти)
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   └── ArithmeticException
    └── Checked Exceptions (обов'язково обробляти)
        ├── IOException
        ├── SQLException
        └── FileNotFoundException
```

---

### Try-Catch блок
Основна конструкція для обробки винятків.

```java
try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Cannot divide by zero!");
}
```

📌 Код у `catch` виконується тільки якщо виникла помилка.

---

### Множинні catch блоки
```java
try {
    String text = null;
    System.out.println(text.length());
    int[] arr = new int[5];
    System.out.println(arr[10]);
} catch (NullPointerException e) {
    System.out.println("Null pointer!");
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("Index out of bounds!");
}
```

---

### Multi-catch (Java 7+)
```java
try {
    // якийсь код
} catch (IOException | SQLException e) {
    System.out.println("Database or IO error: " + e.getMessage());
}
```

📌 Використовується для однакової обробки різних типів винятків.

---

### Finally блок
Виконується завжди, незалежно від наявності помилки.

```java
FileReader reader = null;
try {
    reader = new FileReader("file.txt");
    // читання файлу
} catch (IOException e) {
    System.out.println("Error reading file");
} finally {
    if (reader != null) {
        try {
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

📌 `finally` використовується для звільнення ресурсів.

---

### Try-with-resources (Java 7+)
Автоматично закриває ресурси.

```java
try (FileReader reader = new FileReader("file.txt");
     BufferedReader br = new BufferedReader(reader)) {
    String line = br.readLine();
    System.out.println(line);
} catch (IOException e) {
    e.printStackTrace();
}
```

📌 Не потрібен `finally` блок для закриття ресурсів.

---

## 🎯 Throw та Throws

### Ключове слово throw
Викидає виняток вручну.

```java
public void checkAge(int age) {
    if (age < 18) {
        throw new IllegalArgumentException("Age must be 18+");
    }
    System.out.println("Access granted");
}
```

---

### Ключове слово throws
Вказує, що метод може викинути виняток.

```java
public void readFile(String filename) throws IOException {
    FileReader reader = new FileReader(filename);
    // читання файлу
}

// Виклик методу
public void useFile() {
    try {
        readFile("data.txt");
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

📌 `throws` — в сигнатурі методу, `throw` — для викидання.

---

## 🛠️ Власні винятки

### Створення власного винятку
```java
class InsufficientFundsException extends Exception {
    private double amount;
    
    public InsufficientFundsException(double amount) {
        super("Insufficient funds: need " + amount);
        this.amount = amount;
    }
    
    public double getAmount() {
        return amount;
    }
}
```

---

### Використання власного винятку
```java
class BankAccount {
    private double balance;
    
    public BankAccount(double balance) {
        this.balance = balance;
    }
    
    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(amount - balance);
        }
        balance -= amount;
        System.out.println("Withdrawn: " + amount);
    }
}

// Використання
public class Main {
    public static void main(String[] args) {
        BankAccount account = new BankAccount(1000);
        
        try {
            account.withdraw(1500);
        } catch (InsufficientFundsException e) {
            System.out.println(e.getMessage());
            System.out.println("Missing: " + e.getAmount());
        }
    }
}
```

---

## 📊 Checked vs Unchecked винятки

### Checked Exceptions
Перевіряються на етапі компіляції, обов'язково обробляти.

```java
// Компілятор вимагає обробку
public void openFile() throws IOException {
    FileReader reader = new FileReader("file.txt");
}
```

**Приклади:**
- IOException
- SQLException
- ClassNotFoundException

---

### Unchecked Exceptions
Не перевіряються компілятором, наслідують RuntimeException.

```java
// Обробка необов'язкова
public int divide(int a, int b) {
    return a / b;  // може викинути ArithmeticException
}
```

**Приклади:**
- NullPointerException
- ArrayIndexOutOfBoundsException
- IllegalArgumentException

---

## ⚡ Best Practices

### 1. Ловіть конкретні винятки
❌ **Погано:**
```java
try {
    // код
} catch (Exception e) {
    // занадто загальна обробка
}
```

✅ **Добре:**
```java
try {
    // код
} catch (IOException e) {
    // специфічна обробка
}
```

---

### 2. Не ігноруйте винятки
❌ **Погано:**
```java
try {
    // код
} catch (Exception e) {
    // порожній блок
}
```

✅ **Добре:**
```java
try {
    // код
} catch (Exception e) {
    logger.error("Error occurred", e);
}
```

---

### 3. Використовуйте finally для очищення
```java
Connection conn = null;
try {
    conn = getConnection();
    // робота з базою
} catch (SQLException e) {
    e.printStackTrace();
} finally {
    if (conn != null) {
        try {
            conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

---

### 4. Інформативні повідомлення
```java
throw new IllegalArgumentException(
    "Invalid email format: " + email + 
    ". Expected format: user@domain.com"
);
```

---

## 💻 Комплексний приклад

```java
import java.io.*;
import java.util.*;

class UserNotFoundException extends Exception {
    public UserNotFoundException(String username) {
        super("User not found: " + username);
    }
}

class InvalidPasswordException extends Exception {
    public InvalidPasswordException() {
        super("Invalid password. Must be at least 8 characters");
    }
}

class UserService {
    private Map<String, String> users = new HashMap<>();
    
    public void registerUser(String username, String password) 
            throws InvalidPasswordException {
        if (password.length() < 8) {
            throw new InvalidPasswordException();
        }
        users.put(username, password);
        System.out.println("User registered: " + username);
    }
    
    public void login(String username, String password) 
            throws UserNotFoundException {
        if (!users.containsKey(username)) {
            throw new UserNotFoundException(username);
        }
        
        if (!users.get(username).equals(password)) {
            System.out.println("Incorrect password");
            return;
        }
        
        System.out.println("Login successful: " + username);
    }
    
    public void saveToFile(String filename) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(filename))) {
            for (Map.Entry<String, String> entry : users.entrySet()) {
                writer.println(entry.getKey() + ":" + entry.getValue());
            }
            System.out.println("Users saved to " + filename);
        } catch (IOException e) {
            System.err.println("Error saving file: " + e.getMessage());
        }
    }
}

public class Main {
    public static void main(String[] args) {
        UserService service = new UserService();
        
        // Реєстрація користувача
        try {
            service.registerUser("john", "pass123");  // Помилка: короткий пароль
        } catch (InvalidPasswordException e) {
            System.out.println(e.getMessage());
        }
        
        try {
            service.registerUser("john", "securepass123");
            service.registerUser("jane", "password456");
        } catch (InvalidPasswordException e) {
            System.out.println(e.getMessage());
        }
        
        // Вхід в систему
        try {
            service.login("john", "securepass123");
            service.login("bob", "any");  // Помилка: користувач не знайдений
        } catch (UserNotFoundException e) {
            System.out.println(e.getMessage());
        }
        
        // Збереження в файл
        service.saveToFile("users.txt");
    }
}
```

---

## 📝 Підсумки
- Винятки дозволяють обробляти помилки елегантно
- Try-catch-finally — базова конструкція обробки
- Checked винятки обов'язково обробляти
- Власні винятки покращують читабельність коду
- Try-with-resources автоматично закриває ресурси
- Завжди обробляйте винятки інформативно