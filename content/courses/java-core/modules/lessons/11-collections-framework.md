# Collections Framework in Java

Java Collections Framework — це потужна система структур даних та алгоритмів для ефективної роботи з групами об'єктів.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- розуміти ієрархію колекцій у Java
- використовувати List, Set, Map та Queue
- вибирати правильну колекцію для задачі
- застосовувати ітератори та Stream API

---

## 🧠 Теорія

### Що таке Collections Framework?
Набір інтерфейсів та класів для зберігання та обробки груп об'єктів.

**Основні переваги:**
- Стандартизовані структури даних
- Висока продуктивність
- Зручні методи для роботи з даними

---

### Ієрархія колекцій
```
Collection
├── List (впорядкована, дублікати дозволені)
│   ├── ArrayList
│   ├── LinkedList
│   └── Vector
├── Set (унікальні елементи)
│   ├── HashSet
│   ├── LinkedHashSet
│   └── TreeSet
└── Queue (FIFO)
    ├── PriorityQueue
    └── LinkedList

Map (пари ключ-значення)
├── HashMap
├── LinkedHashMap
├── TreeMap
└── Hashtable
```

---

## 📋 List Interface

### ArrayList
Динамічний масив, швидкий доступ за індексом.

```java
import java.util.*;

List<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
names.add("Charlie");
names.add("Alice");  // дублікати дозволені

System.out.println(names.get(0));  // Alice
System.out.println(names.size());  // 4
```

📌 Найкраще для частого читання та доступу за індексом.

---

### LinkedList
Двозв'язний список, швидка вставка/видалення.

```java
LinkedList<String> tasks = new LinkedList<>();
tasks.add("Task 1");
tasks.addFirst("Urgent Task");
tasks.addLast("Last Task");

System.out.println(tasks.getFirst());  // Urgent Task
tasks.removeFirst();
```

📌 Краще для частих вставок/видалень на початку/кінці.

---

### Основні методи List
```java
List<Integer> numbers = new ArrayList<>();

// Додавання
numbers.add(10);
numbers.add(0, 5);  // вставка за індексом

// Оновлення
numbers.set(1, 20);

// Видалення
numbers.remove(0);
numbers.remove(Integer.valueOf(20));

// Пошук
boolean contains = numbers.contains(10);
int index = numbers.indexOf(10);

// Сортування
Collections.sort(numbers);
```

---

## 🎲 Set Interface

### HashSet
Неупорядкована колекція унікальних елементів.

```java
Set<String> emails = new HashSet<>();
emails.add("user@example.com");
emails.add("admin@example.com");
emails.add("user@example.com");  // ігнорується

System.out.println(emails.size());  // 2
```

📌 Найшвидша реалізація Set, але порядок не гарантується.

---

### LinkedHashSet
Зберігає порядок додавання елементів.

```java
Set<String> orderedSet = new LinkedHashSet<>();
orderedSet.add("First");
orderedSet.add("Second");
orderedSet.add("Third");

// Порядок збережеться при ітерації
for (String item : orderedSet) {
    System.out.println(item);
}
```

---

### TreeSet
Автоматично сортує елементи.

```java
Set<Integer> sortedNumbers = new TreeSet<>();
sortedNumbers.add(5);
sortedNumbers.add(1);
sortedNumbers.add(3);

System.out.println(sortedNumbers);  // [1, 3, 5]
```

📌 Елементи мають реалізувати Comparable або використати Comparator.

---

## 🗺️ Map Interface

### HashMap
Пари ключ-значення, швидкий доступ.

```java
Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 95);
scores.put("Bob", 87);
scores.put("Charlie", 92);

System.out.println(scores.get("Alice"));  // 95
System.out.println(scores.containsKey("Bob"));  // true

scores.put("Alice", 98);  // оновлення значення
```

---

### Ітерація по Map
```java
// Через entrySet
for (Map.Entry<String, Integer> entry : scores.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// Через keySet
for (String key : scores.keySet()) {
    System.out.println(key + ": " + scores.get(key));
}

// Через values
for (Integer value : scores.values()) {
    System.out.println(value);
}
```

---

### LinkedHashMap
Зберігає порядок додавання.

```java
Map<String, String> orderedMap = new LinkedHashMap<>();
orderedMap.put("First", "1");
orderedMap.put("Second", "2");
orderedMap.put("Third", "3");
```

---

### TreeMap
Автоматично сортує за ключами.

```java
Map<Integer, String> sortedMap = new TreeMap<>();
sortedMap.put(3, "Three");
sortedMap.put(1, "One");
sortedMap.put(2, "Two");

System.out.println(sortedMap);  // {1=One, 2=Two, 3=Three}
```

---

## 🎯 Queue Interface

### PriorityQueue
Черга з пріоритетом.

```java
Queue<Integer> pq = new PriorityQueue<>();
pq.offer(5);
pq.offer(1);
pq.offer(3);

System.out.println(pq.poll());  // 1 (найменший)
System.out.println(pq.poll());  // 3
System.out.println(pq.poll());  // 5
```

---

### LinkedList як Queue
```java
Queue<String> queue = new LinkedList<>();
queue.offer("First");
queue.offer("Second");
queue.offer("Third");

System.out.println(queue.poll());  // First (FIFO)
System.out.println(queue.peek());  // Second (без видалення)
```

---

## 🔄 Ітератори

### Iterator
```java
List<String> list = new ArrayList<>(Arrays.asList("A", "B", "C"));
Iterator<String> iterator = list.iterator();

while (iterator.hasNext()) {
    String item = iterator.next();
    if (item.equals("B")) {
        iterator.remove();  // безпечне видалення
    }
}
```

---

### ListIterator
Двонаправлений ітератор для List.

```java
List<Integer> numbers = new ArrayList<>(Arrays.asList(1, 2, 3, 4));
ListIterator<Integer> listIter = numbers.listIterator();

while (listIter.hasNext()) {
    int num = listIter.next();
    listIter.set(num * 2);  // подвоїти кожен елемент
}
```

---

## 🛠️ Корисні методи Collections

### Сортування
```java
List<Integer> numbers = Arrays.asList(5, 2, 8, 1, 9);
Collections.sort(numbers);
Collections.reverse(numbers);

List<String> words = Arrays.asList("banana", "apple", "cherry");
Collections.sort(words);
```

---

### Пошук
```java
List<Integer> numbers = Arrays.asList(1, 3, 5, 7, 9);
int index = Collections.binarySearch(numbers, 5);  // 2

int max = Collections.max(numbers);
int min = Collections.min(numbers);
```

---

### Перемішування та заповнення
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
Collections.shuffle(numbers);

Collections.fill(numbers, 0);  // всі елементи = 0
```

---

### Незмінні колекції
```java
List<String> list = Arrays.asList("A", "B", "C");
List<String> immutable = Collections.unmodifiableList(list);

// immutable.add("D");  // UnsupportedOperationException
```

---

## 💻 Практичний приклад

```java
import java.util.*;

class Student {
    String name;
    int grade;
    
    Student(String name, int grade) {
        this.name = name;
        this.grade = grade;
    }
    
    @Override
    public String toString() {
        return name + " (" + grade + ")";
    }
}

class StudentManager {
    private List<Student> students = new ArrayList<>();
    private Map<String, Integer> gradeMap = new HashMap<>();
    private Set<String> uniqueNames = new HashSet<>();
    
    public void addStudent(Student student) {
        students.add(student);
        gradeMap.put(student.name, student.grade);
        uniqueNames.add(student.name);
    }
    
    public void displayAllStudents() {
        System.out.println("\nAll Students:");
        for (Student s : students) {
            System.out.println(s);
        }
    }
    
    public void sortByGrade() {
        students.sort((s1, s2) -> Integer.compare(s2.grade, s1.grade));
        System.out.println("\nSorted by grade (descending):");
        displayAllStudents();
    }
    
    public Student getTopStudent() {
        return Collections.max(students, 
            Comparator.comparingInt(s -> s.grade));
    }
    
    public Map<Integer, List<Student>> groupByGrade() {
        Map<Integer, List<Student>> grouped = new TreeMap<>();
        
        for (Student s : students) {
            grouped.computeIfAbsent(s.grade, k -> new ArrayList<>()).add(s);
        }
        
        return grouped;
    }
    
    public void displayStatistics() {
        int total = students.size();
        int sum = students.stream().mapToInt(s -> s.grade).sum();
        double average = (double) sum / total;
        
        System.out.println("\nStatistics:");
        System.out.println("Total students: " + total);
        System.out.println("Unique names: " + uniqueNames.size());
        System.out.println("Average grade: " + String.format("%.2f", average));
        System.out.println("Top student: " + getTopStudent());
    }
}

public class Main {
    public static void main(String[] args) {
        StudentManager manager = new StudentManager();
        
        manager.addStudent(new Student("Alice", 95));
        manager.addStudent(new Student("Bob", 87));
        manager.addStudent(new Student("Charlie", 92));
        manager.addStudent(new Student("David", 87));
        manager.addStudent(new Student("Eve", 98));
        
        manager.displayAllStudents();
        manager.sortByGrade();
        manager.displayStatistics();
        
        System.out.println("\nGrouped by grade:");
        Map<Integer, List<Student>> grouped = manager.groupByGrade();
        for (Map.Entry<Integer, List<Student>> entry : grouped.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
    }
}
```

---

## 📝 Підсумки
- List — впорядкована колекція з дублікатами
- Set — унікальні елементи без порядку
- Map — пари ключ-значення
- Queue — черга FIFO або з пріоритетом
- Вибір колекції залежить від специфіки задачі
- Collections містить корисні утилітні методи