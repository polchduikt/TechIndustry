# File I/O in Java

Робота з файлами — фундаментальна частина багатьох програм. Java надає потужні інструменти для читання, запису та маніпуляції файлами.

---

## 🎯 Мета уроку
Після цього уроку ти зможеш:
- читати та записувати текстові файли
- працювати з бінарними файлами
- використовувати сучасний NIO.2 API
- обробляти помилки при роботі з файлами

---

## 🧠 Теорія

### Потоки введення/виведення
Java використовує концепцію потоків (streams) для I/O операцій.

**Два типи потоків:**
- **Byte streams** — робота з байтами (бінарні дані)
- **Character streams** — робота з символами (текст)

---

### Ієрархія класів I/O
```
Byte Streams:
├── InputStream
│   ├── FileInputStream
│   └── BufferedInputStream
└── OutputStream
    ├── FileOutputStream
    └── BufferedOutputStream

Character Streams:
├── Reader
│   ├── FileReader
│   └── BufferedReader
└── Writer
    ├── FileWriter
    └── BufferedWriter
```

---

## 📝 Читання файлів

### FileReader - базове читання
```java
import java.io.*;

public class FileReadExample {
    public static void main(String[] args) {
        try (FileReader reader = new FileReader("data.txt")) {
            int character;
            while ((character = reader.read()) != -1) {
                System.out.print((char) character);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

📌 Try-with-resources автоматично закриває файл.

---

### BufferedReader - ефективне читання
```java
try (BufferedReader br = new BufferedReader(new FileReader("data.txt"))) {
    String line;
    while ((line = br.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

📌 BufferedReader читає рядками, що значно швидше.

---

### Scanner для читання файлів
```java
import java.util.Scanner;

try (Scanner scanner = new Scanner(new File("numbers.txt"))) {
    while (scanner.hasNextLine()) {
        String line = scanner.nextLine();
        System.out.println(line);
    }
} catch (FileNotFoundException e) {
    e.printStackTrace();
}
```

---

## ✍️ Запис у файли

### FileWriter - базовий запис
```java
try (FileWriter writer = new FileWriter("output.txt")) {
    writer.write("Hello, World!\n");
    writer.write("This is a test file.");
} catch (IOException e) {
    e.printStackTrace();
}
```

📌 За замовчуванням перезаписує файл.

---

### FileWriter з append режимом
```java
// true - додавати в кінець файлу
try (FileWriter writer = new FileWriter("output.txt", true)) {
    writer.write("\nNew line appended");
} catch (IOException e) {
    e.printStackTrace();
}
```

---

### BufferedWriter - ефективний запис
```java
try (BufferedWriter bw = new BufferedWriter(new FileWriter("output.txt"))) {
    bw.write("First line");
    bw.newLine();
    bw.write("Second line");
    bw.newLine();
} catch (IOException e) {
    e.printStackTrace();
}
```

---

### PrintWriter - зручний запис
```java
try (PrintWriter writer = new PrintWriter("output.txt")) {
    writer.println("Line 1");
    writer.println("Line 2");
    writer.printf("Number: %d%n", 42);
} catch (IOException e) {
    e.printStackTrace();
}
```

📌 PrintWriter має методи як у System.out.

---

## 🔢 Бінарні файли

### FileInputStream
```java
try (FileInputStream fis = new FileInputStream("data.bin")) {
    int byteData;
    while ((byteData = fis.read()) != -1) {
        // Обробка байту
        System.out.print(byteData + " ");
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

---

### FileOutputStream
```java
try (FileOutputStream fos = new FileOutputStream("output.bin")) {
    byte[] data = {65, 66, 67, 68, 69};  // A, B, C, D, E
    fos.write(data);
} catch (IOException e) {
    e.printStackTrace();
}
```

---

### DataInputStream та DataOutputStream
Для читання/запису примітивних типів.

```java
// Запис
try (DataOutputStream dos = new DataOutputStream(
        new FileOutputStream("data.bin"))) {
    dos.writeInt(123);
    dos.writeDouble(45.67);
    dos.writeUTF("Hello");
} catch (IOException e) {
    e.printStackTrace();
}

// Читання
try (DataInputStream dis = new DataInputStream(
        new FileInputStream("data.bin"))) {
    int number = dis.readInt();
    double decimal = dis.readDouble();
    String text = dis.readUTF();
    
    System.out.println(number);
    System.out.println(decimal);
    System.out.println(text);
} catch (IOException e) {
    e.printStackTrace();
}
```

---

## 🆕 NIO.2 API (Java 7+)

### Files клас - сучасний підхід
```java
import java.nio.file.*;
import java.util.List;

// Читання всього файлу
try {
    List<String> lines = Files.readAllLines(Paths.get("data.txt"));
    for (String line : lines) {
        System.out.println(line);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

---

### Запис через Files
```java
import java.nio.file.*;
import java.util.Arrays;

List<String> lines = Arrays.asList(
    "First line",
    "Second line",
    "Third line"
);

try {
    Files.write(Paths.get("output.txt"), lines);
} catch (IOException e) {
    e.printStackTrace();
}
```

---

### Копіювання файлів
```java
Path source = Paths.get("source.txt");
Path target = Paths.get("target.txt");

try {
    Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);
} catch (IOException e) {
    e.printStackTrace();
}
```

---

### Переміщення файлів
```java
Path source = Paths.get("old_location.txt");
Path target = Paths.get("new_location.txt");

try {
    Files.move(source, target, StandardCopyOption.REPLACE_EXISTING);
} catch (IOException e) {
    e.printStackTrace();
}
```

---

### Видалення файлів
```java
Path file = Paths.get("to_delete.txt");

try {
    Files.deleteIfExists(file);
    System.out.println("File deleted");
} catch (IOException e) {
    e.printStackTrace();
}
```

---

## 📁 Робота з директоріями

### Створення директорій
```java
Path dir = Paths.get("new_folder");

try {
    Files.createDirectory(dir);
    
    // Створення всіх вкладених директорій
    Path nestedDir = Paths.get("parent/child/grandchild");
    Files.createDirectories(nestedDir);
} catch (IOException e) {
    e.printStackTrace();
}
```

---

### Список файлів у директорії
```java
Path dir = Paths.get(".");

try (DirectoryStream<Path> stream = Files.newDirectoryStream(dir)) {
    for (Path file : stream) {
        System.out.println(file.getFileName());
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

---

### Фільтрація файлів
```java
try (DirectoryStream<Path> stream = 
        Files.newDirectoryStream(dir, "*.txt")) {
    for (Path file : stream) {
        System.out.println(file.getFileName());
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

---

### Files.walk - рекурсивний обхід
```java
import java.nio.file.*;

try {
    Files.walk(Paths.get("."))
         .filter(Files::isRegularFile)
         .filter(p -> p.toString().endsWith(".txt"))
         .forEach(System.out::println);
} catch (IOException e) {
    e.printStackTrace();
}
```

---

## 🔍 Перевірка файлів

### Існування та властивості
```java
Path file = Paths.get("data.txt");

boolean exists = Files.exists(file);
boolean isFile = Files.isRegularFile(file);
boolean isDir = Files.isDirectory(file);
boolean isReadable = Files.isReadable(file);
boolean isWritable = Files.isWritable(file);
boolean isHidden = Files.isHidden(file);

System.out.println("Exists: " + exists);
System.out.println("Is file: " + isFile);
```

---

### Розмір та час модифікації
```java
try {
    long size = Files.size(file);
    FileTime modified = Files.getLastModifiedTime(file);
    
    System.out.println("Size: " + size + " bytes");
    System.out.println("Modified: " + modified);
} catch (IOException e) {
    e.printStackTrace();
}
```

---

## 💻 Практичний приклад

```java
import java.io.*;
import java.nio.file.*;
import java.util.*;

class FileManager {
    
    // Запис даних у CSV файл
    public static void writeCSV(String filename, List<String[]> data) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(filename))) {
            for (String[] row : data) {
                writer.println(String.join(",", row));
            }
            System.out.println("CSV file created: " + filename);
        } catch (IOException e) {
            System.err.println("Error writing CSV: " + e.getMessage());
        }
    }
    
    // Читання CSV файлу
    public static List<String[]> readCSV(String filename) {
        List<String[]> data = new ArrayList<>();
        
        try (BufferedReader br = new BufferedReader(new FileReader(filename))) {
            String line;
            while ((line = br.readLine()) != null) {
                data.add(line.split(","));
            }
        } catch (IOException e) {
            System.err.println("Error reading CSV: " + e.getMessage());
        }
        
        return data;
    }
    
    // Копіювання файлу з прогрес-баром
    public static void copyWithProgress(Path source, Path target) {
        try {
            long size = Files.size(source);
            long copied = 0;
            
            try (InputStream in = Files.newInputStream(source);
                 OutputStream out = Files.newOutputStream(target)) {
                
                byte[] buffer = new byte[8192];
                int bytesRead;
                
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                    copied += bytesRead;
                    
                    int progress = (int) ((copied * 100) / size);
                    System.out.print("\rProgress: " + progress + "%");
                }
                
                System.out.println("\nCopy completed!");
            }
        } catch (IOException e) {
            System.err.println("Error copying: " + e.getMessage());
        }
    }
    
    // Пошук тексту у файлах
    public static void searchInFiles(Path directory, String searchText) {
        try {
            Files.walk(directory)
                 .filter(Files::isRegularFile)
                 .filter(p -> p.toString().endsWith(".txt"))
                 .forEach(path -> {
                     try {
                         List<String> lines = Files.readAllLines(path);
                         for (int i = 0; i < lines.size(); i++) {
                             if (lines.get(i).contains(searchText)) {
                                 System.out.println(path.getFileName() + 
                                     " (line " + (i + 1) + "): " + lines.get(i).trim());
                             }
                         }
                     } catch (IOException e) {
                         e.printStackTrace();
                     }
                 });
        } catch (IOException e) {
            System.err.println("Error searching: " + e.getMessage());
        }
    }
    
    // Статистика файлів у директорії
    public static void printDirectoryStats(Path directory) {
        try {
            long totalSize = 0;
            int fileCount = 0;
            int dirCount = 0;
            
            try (DirectoryStream<Path> stream = Files.newDirectoryStream(directory)) {
                for (Path entry : stream) {
                    if (Files.isDirectory(entry)) {
                        dirCount++;
                    } else {
                        fileCount++;
                        totalSize += Files.size(entry);
                    }
                }
            }
            
            System.out.println("Directory: " + directory);
            System.out.println("Files: " + fileCount);
            System.out.println("Directories: " + dirCount);
            System.out.println("Total size: " + totalSize + " bytes");
        } catch (IOException e) {
            System.err.println("Error reading directory: " + e.getMessage());
        }
    }
}

public class Main {
    public static void main(String[] args) {
        // Приклад 1: Робота з CSV
        List<String[]> studentData = Arrays.asList(
            new String[]{"Name", "Grade", "Subject"},
            new String[]{"Alice", "95", "Math"},
            new String[]{"Bob", "87", "Physics"},
            new String[]{"Charlie", "92", "Chemistry"}
        );
        
        FileManager.writeCSV("students.csv", studentData);
        
        System.out.println("\nReading CSV:");
        List<String[]> readData = FileManager.readCSV("students.csv");
        for (String[] row : readData) {
            System.out.println(Arrays.toString(row));
        }
        
        // Приклад 2: Статистика директорії
        System.out.println("\nDirectory statistics:");
        FileManager.printDirectoryStats(Paths.get("."));
        
        // Приклад 3: Пошук тексту
        System.out.println("\nSearching for 'test' in files:");
        FileManager.searchInFiles(Paths.get("."), "test");
    }
}
```

---

## 📝 Підсумки
- Використовуйте BufferedReader/Writer для текстових файлів
- NIO.2 Files API — сучасний та зручний підхід
- Try-with-resources автоматично закриває ресурси
- DataInputStream/OutputStream для примітивних типів
- Files.walk для рекурсивного обходу директорій
- Завжди обробляйте IOException
- Використовуйте Path замість File (NIO.2)