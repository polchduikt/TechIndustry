# Multithreading Basics in Java

Багатопоточність дозволяє програмам виконувати декілька задач одночасно, що підвищує продуктивність та відгук додатків.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- розуміти концепцію потоків (threads)
- створювати та запускати потоки різними способами
- синхронізувати доступ до спільних ресурсів
- використовувати ExecutorService для управління потоками

---

## 🧠 Теорія

### Що таке потік (Thread)?
Потік — це незалежна послідовність виконання в програмі.

**Переваги багатопоточності:**
- Паралельне виконання задач
- Кращий відгук інтерфейсу
- Ефективне використання процесора
- Асинхронна обробка даних

---

### Процес vs Потік
```
Процес:
- Окремий простір пам'яті
- Важкий у створенні
- Комунікація складна

Потік:
- Спільна пам'ять процесу
- Легкий у створенні
- Легка комунікація
```

---

### Життєвий цикл потоку
```
New → Runnable → Running → Blocked/Waiting → Terminated
```

**Стани:**
- **New** — створений, але не запущений
- **Runnable** — готовий до виконання
- **Running** — виконується зараз
- **Blocked/Waiting** — чекає ресурси
- **Terminated** — завершив роботу

---

## 🚀 Створення потоків

### Спосіб 1: Розширення Thread класу
```java
class MyThread extends Thread {
    @Override
    public void run() {
        for (int i = 1; i <= 5; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + i);
            try {
                Thread.sleep(500);  // пауза 500ms
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

// Використання
public class Main {
    public static void main(String[] args) {
        MyThread thread1 = new MyThread();
        MyThread thread2 = new MyThread();
        
        thread1.start();
        thread2.start();
    }
}
```

📌 Метод `start()` запускає потік, `run()` містить код потоку.

---

### Спосіб 2: Реалізація Runnable
```java
class MyRunnable implements Runnable {
    @Override
    public void run() {
        for (int i = 1; i <= 5; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + i);
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

// Використання
public class Main {
    public static void main(String[] args) {
        Thread thread1 = new Thread(new MyRunnable());
        Thread thread2 = new Thread(new MyRunnable());
        
        thread1.start();
        thread2.start();
    }
}
```

📌 Runnable краще, бо дозволяє наслідувати інші класи.

---

### Спосіб 3: Lambda вираз
```java
public class Main {
    public static void main(String[] args) {
        Thread thread = new Thread(() -> {
            for (int i = 1; i <= 5; i++) {
                System.out.println("Count: " + i);
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        
        thread.start();
    }
}
```

---

## 🔄 Основні методи Thread

### sleep()
Призупиняє потік на заданий час.

```java
try {
    Thread.sleep(1000);  // 1 секунда
} catch (InterruptedException e) {
    e.printStackTrace();
}
```

---

### join()
Чекає завершення іншого потоку.

```java
Thread thread = new Thread(() -> {
    System.out.println("Working...");
    try {
        Thread.sleep(2000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    System.out.println("Done!");
});

thread.start();

try {
    thread.join();  // чекаємо завершення
} catch (InterruptedException e) {
    e.printStackTrace();
}

System.out.println("Main thread continues");
```

---

### Пріоритет потоків
```java
Thread thread1 = new Thread(() -> {
    System.out.println("Thread 1");
});

Thread thread2 = new Thread(() -> {
    System.out.println("Thread 2");
});

thread1.setPriority(Thread.MIN_PRIORITY);   // 1
thread2.setPriority(Thread.MAX_PRIORITY);   // 10

thread1.start();
thread2.start();
```

📌 Пріоритет — лише підказка для планувальника.

---

### Daemon потоки
Фонові потоки, що не перешкоджають завершенню програми.

```java
Thread daemon = new Thread(() -> {
    while (true) {
        System.out.println("Daemon running");
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            break;
        }
    }
});

daemon.setDaemon(true);
daemon.start();

Thread.sleep(3000);
System.out.println("Main ending");
// Daemon завершиться автоматично
```

---

## 🔒 Синхронізація

### Проблема race condition
```java
class Counter {
    private int count = 0;
    
    public void increment() {
        count++;  // Не атомарна операція!
    }
    
    public int getCount() {
        return count;
    }
}

// Проблема: втрата даних при конкурентному доступі
```

---

### synchronized метод
```java
class Counter {
    private int count = 0;
    
    public synchronized void increment() {
        count++;
    }
    
    public synchronized int getCount() {
        return count;
    }
}

// Використання
Counter counter = new Counter();

Thread t1 = new Thread(() -> {
    for (int i = 0; i < 1000; i++) {
        counter.increment();
    }
});

Thread t2 = new Thread(() -> {
    for (int i = 0; i < 1000; i++) {
        counter.increment();
    }
});

t1.start();
t2.start();

t1.join();
t2.join();

System.out.println("Count: " + counter.getCount());  // 2000
```

---

### synchronized блок
```java
class BankAccount {
    private double balance = 0;
    private Object lock = new Object();
    
    public void deposit(double amount) {
        synchronized(lock) {
            balance += amount;
        }
    }
    
    public void withdraw(double amount) {
        synchronized(lock) {
            if (balance >= amount) {
                balance -= amount;
            }
        }
    }
}
```

📌 synchronized блок дозволяє гранулярніший контроль.

---

### volatile ключове слово
Гарантує видимість змін між потоками.

```java
class Flag {
    private volatile boolean running = true;
    
    public void stop() {
        running = false;
    }
    
    public void run() {
        while (running) {
            // виконання
        }
    }
}
```

📌 volatile для простих змінних, synchronized для складних операцій.

---

## 🎯 Deadlock

### Що таке deadlock?
Ситуація, коли потоки блокують один одного.

```java
class Resource {
    public synchronized void method1(Resource other) {
        System.out.println("method1");
        other.method2();
    }
    
    public synchronized void method2() {
        System.out.println("method2");
    }
}

// Deadlock
Resource r1 = new Resource();
Resource r2 = new Resource();

Thread t1 = new Thread(() -> r1.method1(r2));
Thread t2 = new Thread(() -> r2.method1(r1));

t1.start();
t2.start();
```

---

### Уникнення deadlock
```java
// Завжди блокувати ресурси в одному порядку
synchronized(resource1) {
    synchronized(resource2) {
        // код
    }
}
```

---

## 🏊 Thread Pools (ExecutorService)

### Навіщо потрібні пули?
- Обмеження кількості потоків
- Повторне використання потоків
- Управління життєвим циклом

---

### FixedThreadPool
```java
import java.util.concurrent.*;

ExecutorService executor = Executors.newFixedThreadPool(3);

for (int i = 1; i <= 10; i++) {
    final int taskId = i;
    executor.submit(() -> {
        System.out.println("Task " + taskId + " by " + 
            Thread.currentThread().getName());
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    });
}

executor.shutdown();
```

📌 Створює пул з фіксованою кількістю потоків.

---

### CachedThreadPool
```java
ExecutorService executor = Executors.newCachedThreadPool();

// Створює потоки за потребою
for (int i = 0; i < 5; i++) {
    executor.submit(() -> {
        System.out.println("Task by " + Thread.currentThread().getName());
    });
}

executor.shutdown();
```

---

### SingleThreadExecutor
```java
ExecutorService executor = Executors.newSingleThreadExecutor();

// Виконує задачі послідовно
for (int i = 1; i <= 5; i++) {
    final int taskId = i;
    executor.submit(() -> {
        System.out.println("Task " + taskId);
    });
}

executor.shutdown();
```

---

### ScheduledExecutorService
Для відкладених та періодичних задач.

```java
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

// Виконати через 2 секунди
scheduler.schedule(() -> {
    System.out.println("Delayed task");
}, 2, TimeUnit.SECONDS);

// Виконувати кожні 3 секунди
scheduler.scheduleAtFixedRate(() -> {
    System.out.println("Periodic task");
}, 0, 3, TimeUnit.SECONDS);

// scheduler.shutdown();
```

---

## 💻 Комплексний приклад

```java
import java.util.concurrent.*;
import java.util.*;

class DownloadTask implements Callable<String> {
    private String filename;
    private int duration;
    
    public DownloadTask(String filename, int duration) {
        this.filename = filename;
        this.duration = duration;
    }
    
    @Override
    public String call() throws Exception {
        System.out.println("Downloading: " + filename + " by " + 
            Thread.currentThread().getName());
        
        for (int i = 0; i <= 100; i += 20) {
            Thread.sleep(duration / 5);
            System.out.println(filename + ": " + i + "%");
        }
        
        return filename + " completed";
    }
}

class DownloadManager {
    private ExecutorService executor;
    private List<Future<String>> futures;
    
    public DownloadManager(int threadCount) {
        this.executor = Executors.newFixedThreadPool(threadCount);
        this.futures = new ArrayList<>();
    }
    
    public void download(String filename, int duration) {
        Future<String> future = executor.submit(new DownloadTask(filename, duration));
        futures.add(future);
    }
    
    public void waitForAll() {
        for (Future<String> future : futures) {
            try {
                String result = future.get();  // чекаємо завершення
                System.out.println("✓ " + result);
            } catch (InterruptedException | ExecutionException e) {
                e.printStackTrace();
            }
        }
        
        executor.shutdown();
        
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }
    }
}

class SharedCounter {
    private int count = 0;
    private Lock lock = new ReentrantLock();
    
    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();
        }
    }
    
    public int getCount() {
        lock.lock();
        try {
            return count;
        } finally {
            lock.unlock();
        }
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Download Manager Example ===");
        
        DownloadManager manager = new DownloadManager(3);
        
        manager.download("file1.zip", 2000);
        manager.download("file2.pdf", 1500);
        manager.download("file3.mp4", 3000);
        manager.download("file4.jpg", 1000);
        manager.download("file5.doc", 2500);
        
        manager.waitForAll();
        
        System.out.println("\n=== Shared Counter Example ===");
        
        SharedCounter counter = new SharedCounter();
        ExecutorService executor = Executors.newFixedThreadPool(10);
        
        for (int i = 0; i < 10; i++) {
            executor.submit(() -> {
                for (int j = 0; j < 1000; j++) {
                    counter.increment();
                }
            });
        }
        
        executor.shutdown();
        
        try {
            executor.awaitTermination(10, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        
        System.out.println("Final count: " + counter.getCount());
    }
}
```

---

## 📝 Підсумки
- Thread — базова одиниця паралельного виконання
- Runnable краще за розширення Thread
- synchronized забезпечує потокобезпечність
- ExecutorService спрощує управління потоками
- Уникайте deadlock через правильний порядок блокування
- Callable дозволяє повертати результат
- volatile для простої видимості змін