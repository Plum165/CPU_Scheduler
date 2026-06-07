/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const JAVA_SOURCE_CODE = `import java.io.*;
import java.util.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

class Process {
    int id;
    int arrivalTime;
    int burstTime;
    int startTime;
    int completionTime;
    int turnaroundTime;
    int waitingTime;

    public Process(int id, int arrivalTime, int burstTime) {
        this.id = id;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
    }
}

public class CPUScheduler {

    public static void main(String[] args) {
        String inputFile = "processes.txt";  // Input file path
        String outputExcel = "process_output.xlsx"; // Output Excel path
        List<Process> processes = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new FileReader(inputFile))) {
            int numProcesses = Integer.parseInt(br.readLine().trim());
            br.readLine(); // Skip header

            for (int i = 0; i < numProcesses; i++) {
                String line = br.readLine();
                if (line == null || line.trim().isEmpty()) continue;

                String[] parts = line.trim().split("\\\\s+");
                if (parts.length >= 3) {
                    int id = Integer.parseInt(parts[0]);
                    int arrival = Integer.parseInt(parts[1]);
                    int burst = Integer.parseInt(parts[2]);
                    processes.add(new Process(id, arrival, burst));
                }
            }

            simulateFCFS(processes, outputExcel);

        } catch (IOException e) {
            System.out.println("Error reading the file: " + e.getMessage());
        }
    }

    private static void simulateFCFS(List<Process> processes, String outputExcel) {
        processes.sort(Comparator.comparingInt(p -> p.arrivalTime));
        int currentTime = 0;
        int maxTime = 0;

        for (Process p : processes) {
            if (currentTime < p.arrivalTime) {
                currentTime = p.arrivalTime;
            }

            p.startTime = currentTime;
            p.completionTime = p.startTime + p.burstTime;
            p.turnaroundTime = p.completionTime - p.arrivalTime;
            p.waitingTime = p.startTime - p.arrivalTime;

            currentTime = p.completionTime;
            if (currentTime > maxTime) maxTime = currentTime;
        }

        try (Workbook workbook = new XSSFWorkbook()) {
            createSummarySheet(workbook, processes);
            createGanttChartSheet(workbook, processes, maxTime);

            try (FileOutputStream fileOut = new FileOutputStream(outputExcel)) {
                workbook.write(fileOut);
                System.out.println("Excel written to: " + outputExcel);
            }

        } catch (IOException e) {
            System.out.println("Error writing Excel file: " + e.getMessage());
        }
    }

    private static void createSummarySheet(Workbook workbook, List<Process> processes) {
        Sheet sheet = workbook.createSheet("FCFS Scheduling");
        Row header = sheet.createRow(0);
        String[] headers = {"ProcessID", "ArrivalTime", "BurstTime", "StartTime", "CompletionTime", "TurnaroundTime", "WaitingTime"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
        }

        CellStyle redStyle = workbook.createCellStyle();
        redStyle.setFillForegroundColor(IndexedColors.RED.getIndex());
        redStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        CellStyle greenStyle = workbook.createCellStyle();
        greenStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        greenStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        for (int i = 0; i < processes.size(); i++) {
            Process p = processes.get(i);
            Row row = sheet.createRow(i + 1);
            row.createCell(0).setCellValue("P" + p.id);
            row.createCell(1).setCellValue(p.arrivalTime);
            row.createCell(2).setCellValue(p.burstTime);
            row.createCell(3).setCellValue(p.startTime);
            row.createCell(4).setCellValue(p.completionTime);
            row.createCell(5).setCellValue(p.turnaroundTime);

            Cell waitCell = row.createCell(6);
            waitCell.setCellValue(p.waitingTime);
            waitCell.setCellStyle(p.waitingTime <= 5 ? greenStyle : redStyle);
        }
    }

    private static void createGanttChartSheet(Workbook workbook, List<Process> processes, int maxTime) {
        Sheet gantt = workbook.createSheet("Gantt Chart");

        // Header row with time units
        Row header = gantt.createRow(0);
        header.createCell(0).setCellValue("Process \\\\ Time");
        for (int t = 0; t <= maxTime; t++) {
            header.createCell(t + 1).setCellValue(t);
        }

        // Style for execution cell
        CellStyle execStyle = workbook.createCellStyle();
        execStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        execStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        execStyle.setAlignment(HorizontalAlignment.CENTER);

        for (int i = 0; i < processes.size(); i++) {
            Process p = processes.get(i);
            Row row = gantt.createRow(i + 1);
            row.createCell(0).setCellValue("P" + p.id);

            for (int t = p.startTime; t < p.completionTime; t++) {
                Cell cell = row.createCell(t + 1);
                cell.setCellStyle(execStyle);
            }
        }

        // Auto-size for visibility
        for (int i = 0; i <= maxTime + 1; i++) {
            gantt.autoSizeColumn(i);
        }
    }
}
`;
