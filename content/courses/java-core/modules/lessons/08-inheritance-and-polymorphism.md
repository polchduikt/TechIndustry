# Inheritance and Polymorphism in Java

Спадкування та поліморфізм — це фундаментальні концепції об'єктно-орієнтованого програмування, які дозволяють створювати гнучкі та масштабовані додатки.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- розуміти принципи спадкування в Java
- використовувати ключові слова `extends` та `super`
- застосовувати поліморфізм для гнучкого коду
- перевизначати методи батьківського класу

---

## 🧠 Теорія

### Що таке спадкування?
Спадкування дозволяє створювати нові класи на основі існуючих, успадковуючи їх властивості та методи.

```java
class Animal {
    String name;
    
    void makeSound() {
        System.out.println("Some sound");
    }
}

class Dog extends Animal {
    void bark() {
        System.out.println("Woof!");
    }
}
```

📌 `Dog` успадковує всі поля та методи з `Animal`.

---

### Ключове слово extends
Використовується для створення класу-нащадка.

```java
class Vehicle {
    int speed;
    
    void start() {
        System.out.println("Vehicle started");
    }
}

class Car extends Vehicle {
    int doors = 4;
}
```

---

### Ключове слово super
`super` дозволяє звертатися до батьківського класу.

```java
class Parent {
    String name = "Parent";
    
    void display() {
        System.out.println("Parent class");
    }
}

class Child extends Parent {
    String name = "Child";
    
    void show() {
        System.out.println(name);        // Child
        System.out.println(super.name);  // Parent
        super.display();                 // Parent class
    }
}
```

---

### Конструктори при спадкуванні
Конструктор батьківського класу викликається автоматично.

```java
class Animal {
    Animal() {
        System.out.println("Animal created");
    }
}

class Dog extends Animal {
    Dog() {
        System.out.println("Dog created");
    }
}

// Вивід:
// Animal created
// Dog created
```

---

### Явний виклик конструктора super()
```java
class Person {
    String name;
    
    Person(String name) {
        this.name = name;
    }
}

class Student extends Person {
    int grade;
    
    Student(String name, int grade) {
        super(name);  // Виклик конструктора батька
        this.grade = grade;
    }
}
```

📌 `super()` має бути першим рядком у конструкторі.

---

## 🔄 Поліморфізм

### Що таке поліморфізм?
Можливість об'єкта приймати різні форми. В Java це досягається через перевизначення методів.

```java
class Shape {
    void draw() {
        System.out.println("Drawing shape");
    }
}

class Circle extends Shape {
    @Override
    void draw() {
        System.out.println("Drawing circle");
    }
}

class Square extends Shape {
    @Override
    void draw() {
        System.out.println("Drawing square");
    }
}
```

---

### Анотація @Override
Вказує, що метод перевизначає метод батьківського класу.

```java
class Animal {
    void makeSound() {
        System.out.println("Animal sound");
    }
}

class Cat extends Animal {
    @Override
    void makeSound() {
        System.out.println("Meow");
    }
}
```

📌 Компілятор перевірить, чи існує такий метод у батьківському класі.

---

### Поліморфізм у дії
```java
Animal animal1 = new Dog();
Animal animal2 = new Cat();

animal1.makeSound();  // Woof
animal2.makeSound();  // Meow
```

📌 Тип змінної — `Animal`, але викликаються методи конкретних класів.

---

### Приведення типів (Casting)
```java
Animal animal = new Dog();

// Downcast (небезпечно без перевірки)
Dog dog = (Dog) animal;
dog.bark();

// Перевірка типу
if (animal instanceof Dog) {
    Dog myDog = (Dog) animal;
    myDog.bark();
}
```

---

### final класи та методи
`final` забороняє спадкування або перевизначення.

```java
final class ImmutableClass {
    // Не може мати нащадків
}

class Parent {
    final void cannotOverride() {
        // Не може бути перевизначений
    }
}
```

---

## 💻 Приклад застосування

```java
class BankAccount {
    protected double balance;
    
    BankAccount(double balance) {
        this.balance = balance;
    }
    
    void deposit(double amount) {
        balance += amount;
    }
    
    void withdraw(double amount) {
        if (amount <= balance) {
            balance -= amount;
        }
    }
    
    void displayBalance() {
        System.out.println("Balance: " + balance);
    }
}

class SavingsAccount extends BankAccount {
    private double interestRate;
    
    SavingsAccount(double balance, double rate) {
        super(balance);
        this.interestRate = rate;
    }
    
    void addInterest() {
        balance += balance * interestRate;
    }
    
    @Override
    void displayBalance() {
        super.displayBalance();
        System.out.println("Interest Rate: " + interestRate);
    }
}

public class Main {
    public static void main(String[] args) {
        SavingsAccount account = new SavingsAccount(1000, 0.05);
        account.deposit(500);
        account.addInterest();
        account.displayBalance();
    }
}
```

---

## 📝 Підсумки
- Спадкування дозволяє перевикористовувати код
- `extends` створює клас-нащадок
- `super` звертається до батьківського класу
- Поліморфізм забезпечує гнучкість коду
- `@Override` допомагає уникати помилок
- `final` забороняє спадкування або перевизначення