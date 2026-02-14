# Java Project: Console Application

Створення повноцінного консольного додатку — чудовий спосіб закріпити всі вивчені концепції Java та побудувати робочий проект для портфоліо.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- проектувати архітектуру консольного додатку
- застосовувати ООП принципи на практиці
- працювати з файлами для збереження даних
- обробляти помилки користувача
- створювати чистий та підтримуваний код

---

## 🎮 Проект: Task Manager

Створимо консольний менеджер задач з наступним функціоналом:
- Додавання, редагування, видалення задач
- Встановлення пріоритетів та дедлайнів
- Фільтрація та сортування
- Збереження у файл
- Статистика виконання

---

## 📐 Архітектура проекту

```
TaskManager/
├── src/
│   ├── models/
│   │   ├── Task.java
│   │   ├── Priority.java
│   │   └── Status.java
│   ├── services/
│   │   ├── TaskService.java
│   │   └── FileService.java
│   ├── ui/
│   │   └── ConsoleUI.java
│   └── Main.java
└── tasks.json
```

---

## 📦 Model Classes

### Priority enum
```java
package models;

public enum Priority {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High"),
    URGENT("Urgent");
    
    private String displayName;
    
    Priority(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static Priority fromString(String text) {
        for (Priority p : Priority.values()) {
            if (p.displayName.equalsIgnoreCase(text)) {
                return p;
            }
        }
        return MEDIUM;
    }
}
```

---

### Status enum
```java
package models;

public enum Status {
    TODO("To Do"),
    IN_PROGRESS("In Progress"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled");
    
    private String displayName;
    
    Status(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static Status fromString(String text) {
        for (Status s : Status.values()) {
            if (s.displayName.equalsIgnoreCase(text)) {
                return s;
            }
        }
        return TODO;
    }
}
```

---

### Task class
```java
package models;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class Task {
    private static int nextId = 1;
    
    private int id;
    private String title;
    private String description;
    private Priority priority;
    private Status status;
    private LocalDate deadline;
    private LocalDate createdDate;
    
    public Task(String title, String description, Priority priority, LocalDate deadline) {
        this.id = nextId++;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = Status.TODO;
        this.deadline = deadline;
        this.createdDate = LocalDate.now();
    }
    
    // Constructor для завантаження з файлу
    public Task(int id, String title, String description, Priority priority, 
                Status status, LocalDate deadline, LocalDate createdDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.deadline = deadline;
        this.createdDate = createdDate;
        
        if (id >= nextId) {
            nextId = id + 1;
        }
    }
    
    // Getters and Setters
    public int getId() { return id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    
    public LocalDate getCreatedDate() { return createdDate; }
    
    public boolean isOverdue() {
        return deadline != null && 
               LocalDate.now().isAfter(deadline) && 
               status != Status.COMPLETED;
    }
    
    @Override
    public String toString() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String deadlineStr = deadline != null ? deadline.format(formatter) : "No deadline";
        String overdueMarker = isOverdue() ? " [OVERDUE]" : "";
        
        return String.format("[%d] %s | %s | %s | Deadline: %s%s\n    %s",
            id, title, priority.getDisplayName(), status.getDisplayName(),
            deadlineStr, overdueMarker, description);
    }
}
```

---

## 🛠️ Service Classes

### TaskService
```java
package services;

import models.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

public class TaskService {
    private List<Task> tasks;
    private FileService fileService;
    
    public TaskService() {
        this.tasks = new ArrayList<>();
        this.fileService = new FileService();
        loadTasks();
    }
    
    public void addTask(String title, String description, Priority priority, LocalDate deadline) {
        Task task = new Task(title, description, priority, deadline);
        tasks.add(task);
        saveTasks();
        System.out.println("✓ Task added successfully!");
    }
    
    public void updateTask(int id, String title, String description, 
                          Priority priority, LocalDate deadline) {
        Task task = findTaskById(id);
        if (task != null) {
            task.setTitle(title);
            task.setDescription(description);
            task.setPriority(priority);
            task.setDeadline(deadline);
            saveTasks();
            System.out.println("✓ Task updated successfully!");
        } else {
            System.out.println("✗ Task not found!");
        }
    }
    
    public void deleteTask(int id) {
        Task task = findTaskById(id);
        if (task != null) {
            tasks.remove(task);
            saveTasks();
            System.out.println("✓ Task deleted successfully!");
        } else {
            System.out.println("✗ Task not found!");
        }
    }
    
    public void changeStatus(int id, Status status) {
        Task task = findTaskById(id);
        if (task != null) {
            task.setStatus(status);
            saveTasks();
            System.out.println("✓ Status changed to: " + status.getDisplayName());
        } else {
            System.out.println("✗ Task not found!");
        }
    }
    
    public List<Task> getAllTasks() {
        return new ArrayList<>(tasks);
    }
    
    public List<Task> getTasksByStatus(Status status) {
        return tasks.stream()
                   .filter(t -> t.getStatus() == status)
                   .collect(Collectors.toList());
    }
    
    public List<Task> getTasksByPriority(Priority priority) {
        return tasks.stream()
                   .filter(t -> t.getPriority() == priority)
                   .collect(Collectors.toList());
    }
    
    public List<Task> getOverdueTasks() {
        return tasks.stream()
                   .filter(Task::isOverdue)
                   .collect(Collectors.toList());
    }
    
    public List<Task> sortByDeadline() {
        return tasks.stream()
                   .sorted(Comparator.comparing(Task::getDeadline, 
                           Comparator.nullsLast(Comparator.naturalOrder())))
                   .collect(Collectors.toList());
    }
    
    public List<Task> sortByPriority() {
        return tasks.stream()
                   .sorted(Comparator.comparing(Task::getPriority).reversed())
                   .collect(Collectors.toList());
    }
    
    public Map<Status, Long> getStatistics() {
        return tasks.stream()
                   .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));
    }
    
    private Task findTaskById(int id) {
        return tasks.stream()
                   .filter(t -> t.getId() == id)
                   .findFirst()
                   .orElse(null);
    }
    
    private void saveTasks() {
        fileService.saveTasks(tasks);
    }
    
    private void loadTasks() {
        tasks = fileService.loadTasks();
    }
}
```

---

### FileService
```java
package services;

import models.*;
import java.io.*;
import java.time.LocalDate;
import java.util.*;

public class FileService {
    private static final String FILENAME = "tasks.txt";
    
    public void saveTasks(List<Task> tasks) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(FILENAME))) {
            for (Task task : tasks) {
                writer.println(taskToString(task));
            }
        } catch (IOException e) {
            System.err.println("Error saving tasks: " + e.getMessage());
        }
    }
    
    public List<Task> loadTasks() {
        List<Task> tasks = new ArrayList<>();
        File file = new File(FILENAME);
        
        if (!file.exists()) {
            return tasks;
        }
        
        try (BufferedReader reader = new BufferedReader(new FileReader(FILENAME))) {
            String line;
            while ((line = reader.readLine()) != null) {
                Task task = parseTask(line);
                if (task != null) {
                    tasks.add(task);
                }
            }
        } catch (IOException e) {
            System.err.println("Error loading tasks: " + e.getMessage());
        }
        
        return tasks;
    }
    
    private String taskToString(Task task) {
        return String.format("%d|%s|%s|%s|%s|%s|%s",
            task.getId(),
            task.getTitle(),
            task.getDescription(),
            task.getPriority().name(),
            task.getStatus().name(),
            task.getDeadline(),
            task.getCreatedDate());
    }
    
    private Task parseTask(String line) {
        try {
            String[] parts = line.split("\\|");
            if (parts.length != 7) return null;
            
            int id = Integer.parseInt(parts[0]);
            String title = parts[1];
            String description = parts[2];
            Priority priority = Priority.valueOf(parts[3]);
            Status status = Status.valueOf(parts[4]);
            LocalDate deadline = parts[5].equals("null") ? null : LocalDate.parse(parts[5]);
            LocalDate createdDate = LocalDate.parse(parts[6]);
            
            return new Task(id, title, description, priority, status, deadline, createdDate);
        } catch (Exception e) {
            System.err.println("Error parsing task: " + line);
            return null;
        }
    }
}
```

---

## 🖥️ Console UI

### ConsoleUI
```java
package ui;

import models.*;
import services.TaskService;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

public class ConsoleUI {
    private TaskService taskService;
    private Scanner scanner;
    
    public ConsoleUI() {
        this.taskService = new TaskService();
        this.scanner = new Scanner(System.in);
    }
    
    public void start() {
        System.out.println("╔════════════════════════════════════╗");
        System.out.println("║     Task Manager Console App      ║");
        System.out.println("╚════════════════════════════════════╝");
        
        while (true) {
            showMenu();
            int choice = getIntInput("Enter choice: ");
            
            switch (choice) {
                case 1: addTask(); break;
                case 2: viewAllTasks(); break;
                case 3: viewTasksByStatus(); break;
                case 4: viewTasksByPriority(); break;
                case 5: updateTask(); break;
                case 6: changeTaskStatus(); break;
                case 7: deleteTask(); break;
                case 8: viewOverdueTasks(); break;
                case 9: viewSortedTasks(); break;
                case 10: viewStatistics(); break;
                case 0:
                    System.out.println("Goodbye!");
                    return;
                default:
                    System.out.println("Invalid choice!");
            }
            
            System.out.println("\nPress Enter to continue...");
            scanner.nextLine();
        }
    }
    
    private void showMenu() {
        System.out.println("\n" + "=".repeat(40));
        System.out.println("1. Add Task");
        System.out.println("2. View All Tasks");
        System.out.println("3. View Tasks by Status");
        System.out.println("4. View Tasks by Priority");
        System.out.println("5. Update Task");
        System.out.println("6. Change Task Status");
        System.out.println("7. Delete Task");
        System.out.println("8. View Overdue Tasks");
        System.out.println("9. View Sorted Tasks");
        System.out.println("10. View Statistics");
        System.out.println("0. Exit");
        System.out.println("=".repeat(40));
    }
    
    private void addTask() {
        System.out.println("\n--- Add New Task ---");
        
        String title = getStringInput("Title: ");
        String description = getStringInput("Description: ");
        Priority priority = selectPriority();
        LocalDate deadline = getDateInput("Deadline (dd/MM/yyyy) or press Enter to skip: ");
        
        taskService.addTask(title, description, priority, deadline);
    }
    
    private void viewAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        displayTasks(tasks, "All Tasks");
    }
    
    private void viewTasksByStatus() {
        Status status = selectStatus();
        List<Task> tasks = taskService.getTasksByStatus(status);
        displayTasks(tasks, "Tasks - " + status.getDisplayName());
    }
    
    private void viewTasksByPriority() {
        Priority priority = selectPriority();
        List<Task> tasks = taskService.getTasksByPriority(priority);
        displayTasks(tasks, "Tasks - " + priority.getDisplayName() + " Priority");
    }
    
    private void updateTask() {
        int id = getIntInput("Enter task ID: ");
        
        String title = getStringInput("New title: ");
        String description = getStringInput("New description: ");
        Priority priority = selectPriority();
        LocalDate deadline = getDateInput("New deadline (dd/MM/yyyy) or Enter to skip: ");
        
        taskService.updateTask(id, title, description, priority, deadline);
    }
    
    private void changeTaskStatus() {
        int id = getIntInput("Enter task ID: ");
        Status status = selectStatus();
        taskService.changeStatus(id, status);
    }
    
    private void deleteTask() {
        int id = getIntInput("Enter task ID: ");
        taskService.deleteTask(id);
    }
    
    private void viewOverdueTasks() {
        List<Task> tasks = taskService.getOverdueTasks();
        displayTasks(tasks, "Overdue Tasks");
    }
    
    private void viewSortedTasks() {
        System.out.println("\n1. Sort by Deadline");
        System.out.println("2. Sort by Priority");
        int choice = getIntInput("Choice: ");
        
        List<Task> tasks = choice == 1 ? 
            taskService.sortByDeadline() : 
            taskService.sortByPriority();
            
        String title = choice == 1 ? "Sorted by Deadline" : "Sorted by Priority";
        displayTasks(tasks, title);
    }
    
    private void viewStatistics() {
        Map<Status, Long> stats = taskService.getStatistics();
        
        System.out.println("\n--- Statistics ---");
        for (Status status : Status.values()) {
            long count = stats.getOrDefault(status, 0L);
            System.out.println(status.getDisplayName() + ": " + count);
        }
    }
    
    private void displayTasks(List<Task> tasks, String title) {
        System.out.println("\n--- " + title + " ---");
        if (tasks.isEmpty()) {
            System.out.println("No tasks found.");
        } else {
            for (Task task : tasks) {
                System.out.println(task);
                System.out.println();
            }
        }
    }
    
    private Priority selectPriority() {
        System.out.println("\nSelect Priority:");
        Priority[] priorities = Priority.values();
        for (int i = 0; i < priorities.length; i++) {
            System.out.println((i + 1) + ". " + priorities[i].getDisplayName());
        }
        int choice = getIntInput("Choice: ");
        return priorities[Math.max(0, Math.min(choice - 1, priorities.length - 1))];
    }
    
    private Status selectStatus() {
        System.out.println("\nSelect Status:");
        Status[] statuses = Status.values();
        for (int i = 0; i < statuses.length; i++) {
            System.out.println((i + 1) + ". " + statuses[i].getDisplayName());
        }
        int choice = getIntInput("Choice: ");
        return statuses[Math.max(0, Math.min(choice - 1, statuses.length - 1))];
    }
    
    private String getStringInput(String prompt) {
        System.out.print(prompt);
        return scanner.nextLine().trim();
    }
    
    private int getIntInput(String prompt) {
        while (true) {
            try {
                System.out.print(prompt);
                int value = Integer.parseInt(scanner.nextLine().trim());
                return value;
            } catch (NumberFormatException e) {
                System.out.println("Invalid number. Try again.");
            }
        }
    }
    
    private LocalDate getDateInput(String prompt) {
        System.out.print(prompt);
        String input = scanner.nextLine().trim();
        
        if (input.isEmpty()) {
            return null;
        }
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            return LocalDate.parse(input, formatter);
        } catch (DateTimeParseException e) {
            System.out.println("Invalid date format. Using no deadline.");
            return null;
        }
    }
}
```

---

## 🚀 Main Class

```java
public class Main {
    public static void main(String[] args) {
        ConsoleUI ui = new ConsoleUI();
        ui.start();
    }
}
```

---

## 📝 Підсумки

**Що ми використали:**
- ООП принципи (інкапсуляція, спадкування)
- Enum для типів даних
- Collections (List, Map, Stream API)
- File I/O для збереження
- Обробка винятків
- Валідація вводу

**Можливі покращення:**
- Додати категорії задач
- Реалізувати пошук за ключовими словами
- Додати нагадування
- Експорт у різні формати (JSON, CSV)
- Багатокористувацький режим
- Web або GUI інтерфейс

Цей проект демонструє всі основні концепції Java і готовий до додавання в портфоліо!