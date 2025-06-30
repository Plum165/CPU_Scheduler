# 🧠 CPU Scheduler: FCFS with Excel Output (Java + Apache POI)

This Java application simulates the **First-Come, First-Served (FCFS)** CPU scheduling algorithm, calculates all key scheduling metrics, and exports the results to a color-coded **Excel spreadsheet** using Apache POI.

---

## 📌 Features

- ✅ Simulates **FCFS** (non-preemptive) scheduling
- ✅ Reads process data from a text file (`processes.txt`)
- ✅ Calculates:
  - Start Time
  - Completion Time
  - Turnaround Time
  - Waiting Time
- ✅ Writes a detailed report to an `.xlsx` Excel file
- ✅ **Color-coded waiting time**:
  - 🟢 Green: `≤ 5` (acceptable wait)
  - 🔴 Red: `> 5` (long wait)

---

## 📥 Input Format: `processes.txt`

```
3
ID ArrivalTime BurstTime
1 0 5
2 2 3
3 4 1
``


- First line: number of processes
- Second line: optional header (skipped)
- Next lines: `ProcessID ArrivalTime BurstTime` separated by spaces

---

## 📤 Output: `process_output.xlsx`

An Excel file is generated with the following columns:

| ProcessID | ArrivalTime | BurstTime | StartTime | CompletionTime | TurnaroundTime | WaitingTime |
|-----------|-------------|-----------|-----------|----------------|----------------|--------------|
| P1        | 0           | 5         | 0         | 5              | 5              | 0            |
| P2        | 2           | 3         | 5         | 8              | 6              | 3            |
| P3        | 4           | 1         | 8         | 9              | 5              | 4            |

**Color key for `WaitingTime`:**
- 🟢 Green = `≤ 5` units
- 🔴 Red = `> 5` units

---

## ⚙️ Algorithm: First-Come, First-Served (FCFS)

- Processes are sorted by **arrival time**
- The CPU executes each process to completion before moving to the next
- **Non-preemptive**, simple, but not always optimal

### ⏱ Calculations

For each process:

- `StartTime` = `max(currentTime, arrivalTime)`
- `CompletionTime` = `StartTime + BurstTime`
- `TurnaroundTime` = `CompletionTime - ArrivalTime`
- `WaitingTime` = `StartTime - ArrivalTime`

---

## 🧪 Example Usage

### 💻 Run the program

```
javac CPUScheduler.java
java CPUScheduler
```

