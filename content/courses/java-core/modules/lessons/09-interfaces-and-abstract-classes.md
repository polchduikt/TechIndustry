# Interfaces and Abstract Classes in Java

Інтерфейси та абстрактні класи — потужні інструменти для створення гнучкої архітектури програм, які визначають контракти та загальну поведінку об'єктів.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- створювати та використовувати інтерфейси
- розуміти різницю між інтерфейсами та абстрактними класами
- застосовувати множинну реалізацію інтерфейсів
- використовувати default методи в інтерфейсах

---

## 🧠 Теорія

### Що таке інтерфейс?
Інтерфейс — це контракт, що визначає які методи має реалізувати клас.

```java
interface Animal {
    void makeSound();
    void eat();
}

class Dog implements Animal {
    @Override
    public void makeSound() {
        System.out.println("Woof!");
    }
    
    @Override
    public void eat() {
        System.out.println("Dog is eating");
    }
}
```

📌 Всі методи інтерфейсу за замовчуванням `public abstract`.

---

### Ключове слово implements
Клас реалізує інтерфейс через `implements`.

```java
interface Flyable {
    void fly();
}

class Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("Bird is flying");
    }
}
```

---

### Множинна реалізація
Клас може реалізувати декілька інтерфейсів.

```java
interface Swimmable {
    void swim();
}

interface Flyable {
    void fly();
}

class Duck implements Swimmable, Flyable {
    @Override
    public void swim() {
        System.out.println("Duck is swimming");
    }
    
    @Override
    public void fly() {
        System.out.println("Duck is flying");
    }
}
```

📌 Java не підтримує множинне спадкування класів, але дозволяє множинну реалізацію інтерфейсів.

---

### Константи в інтерфейсах
Всі змінні в інтерфейсі за замовчуванням `public static final`.

```java
interface Constants {
    int MAX_SIZE = 100;
    String APP_NAME = "MyApp";
}

class MyClass implements Constants {
    void display() {
        System.out.println(MAX_SIZE);
        System.out.println(APP_NAME);
    }
}
```

---

### Default методи (Java 8+)
З Java 8 інтерфейси можуть мати методи з реалізацією.

```java
interface Vehicle {
    void start();
    
    default void stop() {
        System.out.println("Vehicle stopped");
    }
}

class Car implements Vehicle {
    @Override
    public void start() {
        System.out.println("Car started");
    }
    
    // stop() можна не перевизначати
}
```

---

### Static методи в інтерфейсах
```java
interface MathOperations {
    static int add(int a, int b) {
        return a + b;
    }
    
    static int multiply(int a, int b) {
        return a * b;
    }
}

// Виклик
int sum = MathOperations.add(5, 3);
```

---

## 🎨 Абстрактні класи

### Що таке абстрактний клас?
Клас, який не може мати екземплярів і може містити абстрактні методи.

```java
abstract class Shape {
    String color;
    
    abstract double getArea();
    
    void displayColor() {
        System.out.println("Color: " + color);
    }
}

class Circle extends Shape {
    double radius;
    
    Circle(double radius) {
        this.radius = radius;
    }
    
    @Override
    double getArea() {
        return Math.PI * radius * radius;
    }
}
```

📌 Абстрактний клас може мати як абстрактні, так і звичайні методи.

---

### Абстрактні методи
Методи без реалізації, які мають бути перевизначені в підкласах.

```java
abstract class Animal {
    abstract void makeSound();
    
    void sleep() {
        System.out.println("Sleeping...");
    }
}

class Cat extends Animal {
    @Override
    void makeSound() {
        System.out.println("Meow");
    }
}
```

---

### Конструктори в абстрактних класах
```java
abstract class Employee {
    String name;
    double salary;
    
    Employee(String name, double salary) {
        this.name = name;
        this.salary = salary;
    }
    
    abstract void work();
}

class Developer extends Employee {
    Developer(String name, double salary) {
        super(name, salary);
    }
    
    @Override
    void work() {
        System.out.println(name + " is coding");
    }
}
```

---

## 🆚 Інтерфейс vs Абстрактний клас

### Коли використовувати інтерфейс?
- Потрібна множинна реалізація
- Визначення контракту без реалізації
- Незв'язані класи мають спільну поведінку

```java
interface Printable {
    void print();
}

class Document implements Printable {
    public void print() {
        System.out.println("Printing document");
    }
}
```

---

### Коли використовувати абстрактний клас?
- Є спільний код для підкласів
- Потрібні поля стану
- Логічно пов'язані класи

```java
abstract class Vehicle {
    int speed;
    
    abstract void accelerate();
    
    void brake() {
        speed = 0;
    }
}
```

---

### Порівняльна таблиця

**Інтерфейс:**
- Може мати тільки константи
- Методи за замовчуванням public
- Множинна реалізація
- З Java 8: default та static методи

**Абстрактний клас:**
- Може мати змінні стану
- Різні модифікатори доступу
- Одиничне спадкування
- Може мати конструктори

---

## 💻 Практичний приклад

```java
// Інтерфейс для платіжних систем
interface PaymentMethod {
    boolean processPayment(double amount);
    String getPaymentType();
    
    default void printReceipt(double amount) {
        System.out.println("Payment of $" + amount + " processed");
    }
}

// Абстрактний клас для банківських карток
abstract class BankCard implements PaymentMethod {
    protected String cardNumber;
    protected String holderName;
    
    BankCard(String cardNumber, String holderName) {
        this.cardNumber = cardNumber;
        this.holderName = holderName;
    }
    
    protected boolean validateCard() {
        return cardNumber.length() == 16;
    }
}

// Конкретні реалізації
class CreditCard extends BankCard {
    private double creditLimit;
    
    CreditCard(String cardNumber, String holderName, double creditLimit) {
        super(cardNumber, holderName);
        this.creditLimit = creditLimit;
    }
    
    @Override
    public boolean processPayment(double amount) {
        if (validateCard() && amount <= creditLimit) {
            creditLimit -= amount;
            printReceipt(amount);
            return true;
        }
        return false;
    }
    
    @Override
    public String getPaymentType() {
        return "Credit Card";
    }
}

class DebitCard extends BankCard {
    private double balance;
    
    DebitCard(String cardNumber, String holderName, double balance) {
        super(cardNumber, holderName);
        this.balance = balance;
    }
    
    @Override
    public boolean processPayment(double amount) {
        if (validateCard() && amount <= balance) {
            balance -= amount;
            printReceipt(amount);
            return true;
        }
        return false;
    }
    
    @Override
    public String getPaymentType() {
        return "Debit Card";
    }
}

public class Main {
    public static void main(String[] args) {
        PaymentMethod card1 = new CreditCard("1234567890123456", "John Doe", 5000);
        PaymentMethod card2 = new DebitCard("6543210987654321", "Jane Smith", 2000);
        
        card1.processPayment(1000);
        card2.processPayment(500);
    }
}
```

---

## 📝 Підсумки
- Інтерфейси визначають контракт без реалізації
- Абстрактні класи можуть містити як абстрактні, так і конкретні методи
- Клас може реалізувати багато інтерфейсів
- Default методи дозволяють додавати реалізацію в інтерфейси
- Вибір між інтерфейсом та абстрактним класом залежить від задачі