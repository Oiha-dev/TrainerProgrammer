import { writable } from 'svelte/store';

// Sample text for each programming language
export const languageSamples = {
    "1": {
        language: "Golang",
        texts: [
            `package main
import "fmt"
func main() {
    s := "Hello Go"
    for i := 0; i < 5; i++ {
        fmt.Printf("%s: %d\n", s, i)
    }
}`,
            `package main
import "fmt"
func fib(n int) int {
    if n <= 1 { return n }
    return fib(n-1) + fib(n-2)
}
func main() {
    fmt.Println(fib(10))
}`,
            `package main
import "strings"
func main() {
    s := "go is fun"
    fmt.Println(strings.ToUpper(s))
    fmt.Println(strings.Count(s, "o"))
}`
        ]
    },
    "2": {
        language: "Java",
        texts: [
            `class Main {
    public static void main(String[] args) {
        for(int i=0; i<5; i++) {
            System.out.println("Count: " + i);
        }
    }
}`,
            `import java.util.*;
class Example {
    public static void main(String[] args) {
        List<String> items = Arrays.asList("Java", "Love");
        items.forEach(System.out::println);
    }
}`,
            `class StringDemo {
    public static void main(String[] args) {
        String text = "Java Programming";
        System.out.println(text.toUpperCase());
    }
}`,
            `class MathOps {
    public static void main(String[] args) {
        double[] num = {1.5, 2.7, 3.2};
        System.out.println(Arrays.stream(num).sum());
    }
}`
        ]
    },
    "3": {
        language: "C#",
        texts: [
            `using System;
class Program {
    static void Main() {
        var rand = new Random();
        for(int i=0; i<5; i++) 
            Console.WriteLine(rand.Next(100));
    }
}`,
            `using System.Linq;
class Demo {
    static void Main() {
        var nums = new[] {1, 2, 3, 4, 5};
        Console.WriteLine(nums.Sum());
        Console.WriteLine(nums.Average());
    }
}`
        ]
    },
    "4": {
        language: "Python",
        texts: [
            `import random
def game():
    num = random.randint(1, 10)
    guess = int(input("Guess: "))
    if guess == num:
        print("Correct!")
    else:
        print("Wrong! It was", num)`,
            `from collections import Counter

text = "python is amazing"
char_count = Counter(text)

print(char_count.most_common(3))
print(sorted(char_count.items()))`,
            `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
        yield a

print(list(fibonacci(10)))`
        ]
    },
    "5": {
        language: "JavaScript",
        texts: [
            `function fetchData() {
    return fetch('https://api.example.com/data')
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.error(err));
}`,
            `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const sum = doubled.reduce((s, n) => s + n, 0);
console.log(sum);`,
            `async function processItems(items) {
    const results = [];
    for (const item of items) {
        const result = await processItem(item);
        results.push(result);
    }
    return results;
}`
        ]
    }
};

// Create stores for typing state
export const currentLanguage = writable("1");
export const typingStats = writable({
    wpm: 0,
    accuracy: 100,
    time: 0,
    startTime: null,
    isActive: false,
    correctChars: 0,
    incorrectChars: 0,
    totalChars: 0,
    completed: false,
    wpmOverTime: [] // Array to track WPM measurements over time: [{time: seconds, wpm: value}]
});