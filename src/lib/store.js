import { writable } from 'svelte/store';

// Sample text for each programming language
export const languageSamples = {
    "1": {
        language: "Golang",
        text: `package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
    for i := 0; i < 10; i++ {
        fmt.Printf("%d ", i)
    }
}`
    },
    "2": {
        language: "Java",
        text: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
        for (int i = 0; i < 10; i++) {
            System.out.print(i + " ");
        }
    }
}`
    },
    "3": {
        language: "C#",
        text: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, C#!");
        for (int i = 0; i < 10; i++) {
            Console.Write($"{i} ");
        }
    }
}`
    },
    "4": {
        language: "Python",
        text: `def main():
    print("Hello, Python!")
    for i in range(10):
        print(i, end=" ")

if __name__ == "__main__":
    main()`
    },
    "5": {
        language: "JavaScript",
        text: `function main() {
    console.log("Hello, JavaScript!");
    for (let i = 0; i < 10; i++) {
        console.log(i);
    }
}

main();`
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
    totalChars: 0
});
