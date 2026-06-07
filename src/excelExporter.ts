/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessResult, GanttBlock } from './types';

/**
 * Generates an Excel (Spreadsheet XML) string and triggers a download.
 * Compatible with Excel, LibreOffice, Google Sheets.
 * Supports multiple sheets: "Summary Sheet" and "Gantt Chart".
 */
export function exportToExcel(
  algorithmName: string,
  processes: ProcessResult[],
  gantt: GanttBlock[],
  maxTime: number
) {
  const xmlStyles = `
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Bottom" ss:Horizontal="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
    </Style>
    <Style ss:ID="Header">
      <Font ss:FontName="Calibri" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="AlgorithmTitle">
      <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#0F172A"/>
      <Alignment ss:Vertical="Center" ss:Horizontal="Left"/>
    </Style>
    <Style ss:ID="StatsHeader">
      <Font ss:FontName="Calibri" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#06B6D4" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="GreenWait">
      <Font ss:FontName="Calibri" ss:Color="#15803D" ss:Bold="1"/>
      <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="RedWait">
      <Font ss:FontName="Calibri" ss:Color="#B91C1C" ss:Bold="1"/>
      <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="GanttHeader">
      <Font ss:FontName="Calibri" ss:Bold="1" ss:Color="#1E293B"/>
      <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="GanttFill">
      <Font ss:FontName="Calibri" ss:Color="#1E3A8A" ss:Bold="1"/>
      <Interior ss:Color="#DDEBF7" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
    </Style>
  </Styles>
  `;

  // Summary worksheet rows
  let summaryRows = '';
  // Title block
  summaryRows += `
    <Row ss:Height="25">
      <Cell ss:StyleID="AlgorithmTitle"><Data ss:Type="String">${algorithmName} - Scheduling Summary</Data></Cell>
    </Row>
    <Row ss:Height="15"/>
  `;

  // Headers
  summaryRows += `
    <Row ss:Height="20">
      <Cell ss:StyleID="Header"><Data ss:Type="String">Process ID</Data></Cell>
      <Cell ss:StyleID="Header"><Data ss:Type="String">Arrival Time</Data></Cell>
      <Cell ss:StyleID="Header"><Data ss:Type="String">Burst Time</Data></Cell>
      <Cell ss:StyleID="Header"><Data ss:Type="String">Start Time</Data></Cell>
      <Cell ss:StyleID="Header"><Data ss:Type="String">Completion Time</Data></Cell>
      <Cell ss:StyleID="Header"><Data ss:Type="String">Turnaround Time</Data></Cell>
      <Cell ss:StyleID="Header"><Data ss:Type="String">Waiting Time</Data></Cell>
    </Row>
  `;

  // Process rows
  processes.forEach(p => {
    // Condition for waiting time coloring (<= 5 green, > 5 red, matching java source)
    const waitStyle = p.waitingTime <= 5 ? 'GreenWait' : 'RedWait';

    summaryRows += `
      <Row ss:Height="18">
        <Cell><Data ss:Type="String">P${p.id}</Data></Cell>
        <Cell><Data ss:Type="Number">${p.arrivalTime}</Data></Cell>
        <Cell><Data ss:Type="Number">${p.burstTime}</Data></Cell>
        <Cell><Data ss:Type="Number">${p.startTime}</Data></Cell>
        <Cell><Data ss:Type="Number">${p.completionTime}</Data></Cell>
        <Cell><Data ss:Type="Number">${p.turnaroundTime}</Data></Cell>
        <Cell ss:StyleID="${waitStyle}"><Data ss:Type="Number">${p.waitingTime}</Data></Cell>
      </Row>
    `;
  });

  // Average Summary metrics
  const totalTurnaround = processes.reduce((s, p) => s + p.turnaroundTime, 0);
  const totalWaiting = processes.reduce((s, p) => s + p.waitingTime, 0);
  const avgTurnaround = (totalTurnaround / processes.length).toFixed(2);
  const avgWaiting = (totalWaiting / processes.length).toFixed(2);

  summaryRows += `
    <Row ss:Height="10"/>
    <Row ss:Height="20">
      <Cell ss:MergeAcross="5" ss:StyleID="StatsHeader"><Data ss:Type="String">Average Turnaround Time</Data></Cell>
      <Cell ss:StyleID="StatsHeader"><Data ss:Type="Number">${avgTurnaround}</Data></Cell>
    </Row>
    <Row ss:Height="20">
      <Cell ss:MergeAcross="5" ss:StyleID="StatsHeader"><Data ss:Type="String">Average Waiting Time</Data></Cell>
      <Cell ss:StyleID="StatsHeader"><Data ss:Type="Number">${avgWaiting}</Data></Cell>
    </Row>
  `;

  // --- Sheet 2: Gantt Chart ---
  let ganttRows = '';
  // Dynamic header with timeline: Column 0: "Process \ Time", Column 1..N: Time indices 0..maxTime
  let ganttHeaderRow = `
    <Row ss:Height="22">
      <Cell ss:StyleID="Header"><Data ss:Type="String">Process \\ Time</Data></Cell>
  `;
  for (let t = 0; t <= maxTime; t++) {
    ganttHeaderRow += `<Cell ss:StyleID="GanttHeader"><Data ss:Type="Number">${t}</Data></Cell>`;
  }
  ganttHeaderRow += `</Row>`;
  ganttRows += ganttHeaderRow;

  // Process rows on Gantt timeline
  // Sort by process ID
  const sortedIds = [...processes].sort((a, b) => a.id - b.id).map(p => p.id);

  sortedIds.forEach(pid => {
    let processRow = `
      <Row ss:Height="18">
        <Cell ss:StyleID="GanttHeader"><Data ss:Type="String">P${pid}</Data></Cell>
    `;

    // For every time slot 't' to 't+1', check if process 'pid' executed
    for (let t = 0; t <= maxTime; t++) {
      // Find if we executed during [t, t+1]
      const executed = gantt.some(
        block =>
          block.type === 'process' &&
          block.processId === pid &&
          block.startTime <= t &&
          block.endTime > t
      );

      if (executed) {
        processRow += `<Cell ss:StyleID="GanttFill"><Data ss:Type="String">■</Data></Cell>`;
      } else {
        processRow += `<Cell><Data ss:Type="String"></Data></Cell>`;
      }
    }
    processRow += `</Row>`;
    ganttRows += processRow;
  });

  // XML content assembler
  const fullXml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>CPU Scheduling Academy</Author>
    <LastAuthor>Educational Platform Optimizer</LastAuthor>
    <Created>${new Date().toISOString()}</Created>
    <Version>16.00</Version>
  </DocumentProperties>
  ${xmlStyles}
  <Worksheet ss:Name="Scheduling Summary">
    <Table ss:ExpandedColumnCount="15" ss:DefaultRowHeight="15">
      <Column ss:Width="80"/>
      <Column ss:Width="100"/>
      <Column ss:Width="100"/>
      <Column ss:Width="100"/>
      <Column ss:Width="110"/>
      <Column ss:Width="110"/>
      <Column ss:Width="110"/>
      ${summaryRows}
    </Table>
  </Worksheet>
  <Worksheet ss:Name="Gantt Chart">
    <Table ss:ExpandedColumnCount="${maxTime + 5}" ss:DefaultRowHeight="15">
      <Column ss:Width="110"/>
      ${Array.from({ length: maxTime + 1 }, () => `<Column ss:Width="40"/>`).join('')}
      ${ganttRows}
    </Table>
  </Worksheet>
</Workbook>`;

  // Trigger browser download
  const blob = new Blob([fullXml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Scheduler_${algorithmName.replace(/\s+/g, '_')}_Output.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
