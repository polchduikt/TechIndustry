# Generics in Java

Generics дозволяють створювати типобезпечний код, який може працювати з різними типами даних, забезпечуючи перевірку типів на етапі компіляції.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- розуміти необхідність та переваги generics
- створювати generic класи та методи
- використовувати wildcards та bounded types
- застосовувати generics з колекціями

---

## 🧠 Теорія

### Навіщо потрібні Generics?
До Java 5 колекції працювали з типом Object.

❌ **Без Generics:**
```java
List list = new ArrayList();
list.add("Hello");
list.add(123);

String s = (String) list.get(0);  // потрібне приведення типу
String s2 = (String) list.get(1); // помилка в runtime!
```

✅ **З Generics:**
```java
List<String> list = new ArrayList<>();
list.add("Hello");
// list.add(123);  // помилка компіляції!

String s = list.get(0);  // без приведення типу
```

📌 Generics забезпечують безпеку типів на етапі компіляції.

---

### Generic Class
Клас з параметром типу.

```java
class Box<T> {
    private T content;
    
    public void set(T content) {
        this.content = content;
    }
    
    public T get() {
        return content;
    }
}

// Використання
Box<String> stringBox = new Box<>();
stringBox.set("Hello");
String value = stringBox.get();

Box<Integer> intBox = new Box<>();
intBox.set(123);
Integer num = intBox.get();
```

---

### Множинні параметри типу
```java
class Pair<K, V> {
    private K key;
    private V value;
    
    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }
    
    public K getKey() {
        return key;
    }
    
    public V getValue() {
        return value;
    }
}

// Використання
Pair<String, Integer> pair = new Pair<>("Age", 25);
System.out.println(pair.getKey() + ": " + pair.getValue());
```

---

### Generic Methods
Методи з власними параметрами типу.

```java
class Utils {
    public static <T> void printArray(T[] array) {
        for (T element : array) {
            System.out.println(element);
        }
    }
}

// Використання
Integer[] numbers = {1, 2, 3, 4, 5};
String[] words = {"Hello", "World"};

Utils.printArray(numbers);
Utils.printArray(words);
```

---

### Generic метод з поверненням значення
```java
class ArrayUtils {
    public static <T> T getMiddleElement(T[] array) {
        return array[array.length / 2];
    }
}

// Використання
Integer[] nums = {1, 2, 3, 4, 5};
Integer middle = ArrayUtils.getMiddleElement(nums);
```

---

## 🎯 Bounded Type Parameters

### Upper Bound (extends)
Обмежує тип зверху.

```java
class NumberBox<T extends Number> {
    private T number;
    
    public NumberBox(T number) {
        this.number = number;
    }
    
    public double getDoubleValue() {
        return number.doubleValue();
    }
}

// Можна використовувати
NumberBox<Integer> intBox = new NumberBox<>(10);
NumberBox<Double> doubleBox = new NumberBox<>(10.5);

// Не можна
// NumberBox<String> stringBox = new NumberBox<>("text");
```

📌 `T` має бути Number або його підклас.

---

### Множинні bounds
```java
interface Printable {
    void print();
}

class Document<T extends Number & Comparable<T> & Printable> {
    private T data;
    
    public Document(T data) {
        this.data = data;
    }
}
```

📌 Перший bound має бути клас (якщо є), потім інтерфейси.

---

## 🌟 Wildcards

### Unbounded Wildcard (?)
Невідомий тип.

```java
public static void printList(List<?> list) {
    for (Object element : list) {
        System.out.println(element);
    }
}

// Працює з будь-яким типом
printList(Arrays.asList(1, 2, 3));
printList(Arrays.asList("A", "B", "C"));
```

---

### Upper Bounded Wildcard (? extends)
Тип або його підкласи.

```java
public static double sumOfList(List<? extends Number> list) {
    double sum = 0.0;
    for (Number number : list) {
        sum += number.doubleValue();
    }
    return sum;
}

// Використання
List<Integer> integers = Arrays.asList(1, 2, 3);
List<Double> doubles = Arrays.asList(1.5, 2.5, 3.5);

System.out.println(sumOfList(integers));
System.out.println(sumOfList(doubles));
```

📌 Можна читати, але не можна додавати елементи.

---

### Lower Bounded Wildcard (? super)
Тип або його суперкласи.

```java
public static void addNumbers(List<? super Integer> list) {
    for (int i = 1; i <= 5; i++) {
        list.add(i);
    }
}

// Використання
List<Integer> integers = new ArrayList<>();
List<Number> numbers = new ArrayList<>();
List<Object> objects = new ArrayList<>();

addNumbers(integers);
addNumbers(numbers);
addNumbers(objects);
```

📌 Можна додавати елементи, але при читанні тип буде Object.

---

### PECS правило
**Producer Extends, Consumer Super**

```java
// Producer (читаємо з колекції) - extends
public static void copy(List<? extends Number> source, 
                       List<? super Number> destination) {
    for (Number number : source) {
        destination.add(number);
    }
}
```

---

## 🔧 Generic Interfaces

### Базовий приклад
```java
interface Container<T> {
    void add(T item);
    T get(int index);
    int size();
}

class SimpleContainer<T> implements Container<T> {
    private List<T> items = new ArrayList<>();
    
    @Override
    public void add(T item) {
        items.add(item);
    }
    
    @Override
    public T get(int index) {
        return items.get(index);
    }
    
    @Override
    public int size() {
        return items.size();
    }
}
```

---

### Comparable приклад
```java
class Student implements Comparable<Student> {
    String name;
    int grade;
    
    Student(String name, int grade) {
        this.name = name;
        this.grade = grade;
    }
    
    @Override
    public int compareTo(Student other) {
        return Integer.compare(this.grade, other.grade);
    }
}

// Використання
List<Student> students = new ArrayList<>();
students.add(new Student("Alice", 95));
students.add(new Student("Bob", 87));
Collections.sort(students);
```

---

## 🚫 Обмеження Generics

### Не можна створити екземпляр типу
```java
class Container<T> {
    // T item = new T();  // Помилка!
}
```

---

### Не можна створити масив generic типу
```java
// List<String>[] array = new List<String>[10];  // Помилка!

// Рішення: використовувати List<List<String>>
List<List<String>> listOfLists = new ArrayList<>();
```

---

### Не можна використовувати primitive types
```java
// List<int> numbers = new ArrayList<>();  // Помилка!

List<Integer> numbers = new ArrayList<>();  // Правильно
```

---

## 💻 Комплексний приклад

```java
import java.util.*;

// Generic інтерфейс
interface Repository<T, ID> {
    void save(T entity);
    T findById(ID id);
    List<T> findAll();
    void delete(ID id);
}

// Generic клас
class Entity<ID> {
    private ID id;
    
    public Entity(ID id) {
        this.id = id;
    }
    
    public ID getId() {
        return id;
    }
}

// Конкретний тип Entity
class User extends Entity<Integer> {
    private String name;
    private String email;
    
    public User(Integer id, String name, String email) {
        super(id);
        this.name = name;
        this.email = email;
    }
    
    public String getName() {
        return name;
    }
    
    public String getEmail() {
        return email;
    }
    
    @Override
    public String toString() {
        return "User{id=" + getId() + ", name='" + name + "', email='" + email + "'}";
    }
}

// Реалізація Repository
class UserRepository implements Repository<User, Integer> {
    private Map<Integer, User> storage = new HashMap<>();
    
    @Override
    public void save(User user) {
        storage.put(user.getId(), user);
        System.out.println("User saved: " + user);
    }
    
    @Override
    public User findById(Integer id) {
        return storage.get(id);
    }
    
    @Override
    public List<User> findAll() {
        return new ArrayList<>(storage.values());
    }
    
    @Override
    public void delete(Integer id) {
        User removed = storage.remove(id);
        if (removed != null) {
            System.out.println("User deleted: " + removed);
        }
    }
}

// Generic Service клас
class Service<T extends Entity<ID>, ID> {
    private Repository<T, ID> repository;
    
    public Service(Repository<T, ID> repository) {
        this.repository = repository;
    }
    
    public void create(T entity) {
        repository.save(entity);
    }
    
    public T getById(ID id) {
        return repository.findById(id);
    }
    
    public List<T> getAll() {
        return repository.findAll();
    }
    
    public void remove(ID id) {
        repository.delete(id);
    }
}

// Утилітний клас з generic методами
class CollectionUtils {
    public static <T> List<T> filter(List<T> list, Predicate<T> predicate) {
        List<T> result = new ArrayList<>();
        for (T item : list) {
            if (predicate.test(item)) {
                result.add(item);
            }
        }
        return result;
    }
    
    public static <T extends Comparable<T>> T findMax(List<T> list) {
        if (list.isEmpty()) {
            return null;
        }
        T max = list.get(0);
        for (T item : list) {
            if (item.compareTo(max) > 0) {
                max = item;
            }
        }
        return max;
    }
}

// Functional interface для фільтрації
interface Predicate<T> {
    boolean test(T t);
}

public class Main {
    public static void main(String[] args) {
        // Створення репозиторію та сервісу
        UserRepository userRepo = new UserRepository();
        Service<User, Integer> userService = new Service<>(userRepo);
        
        // Додавання користувачів
        userService.create(new User(1, "Alice", "alice@example.com"));
        userService.create(new User(2, "Bob", "bob@example.com"));
        userService.create(new User(3, "Charlie", "charlie@example.com"));
        
        // Отримання всіх користувачів
        System.out.println("\nAll users:");
        List<User> allUsers = userService.getAll();
        allUsers.forEach(System.out::println);
        
        // Пошук за ID
        System.out.println("\nFind user by ID 2:");
        User user = userService.getById(2);
        System.out.println(user);
        
        // Фільтрація користувачів
        System.out.println("\nUsers with 'a' in name:");
        List<User> filtered = CollectionUtils.filter(allUsers, 
            u -> u.getName().toLowerCase().contains("a"));
        filtered.forEach(System.out::println);
        
        // Видалення користувача
        System.out.println("\nDeleting user 2:");
        userService.remove(2);
        
        System.out.println("\nRemaining users:");
        userService.getAll().forEach(System.out::println);
    }
}
```

---

## 📝 Підсумки
- Generics забезпечують безпеку типів на етапі компіляції
- Параметри типу позначаються `<T>`, `<K, V>` тощо
- Bounded types обмежують допустимі типи
- Wildcards (`?`, `? extends`, `? super`) додають гнучкість
- PECS: Producer Extends, Consumer Super
- Generics не працюють з primitive types
- Використовуйте generics для створення переусного коду