
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import path from 'path';

const headers = [
  "Number", "Invoice Partner Display Name", "Partner/UID", "Partner/Phone", 
  "Invoice/Bill Date", "Payment Status", "Student", "Student/UID", 
  "Grade", "Term", "Gender", "Student Status", "Untaxed Amount", 
  "Tax", "Total Signed", "Total Paid Amount", "Amount Due"
];

const data = [
  headers,
  // Row 1: Valid data
  [
    "INV/2024/0001", "أحمد محمد علي", "1010101010", "0505050505",
    "01/01/2024", "Not Paid", "سعيد أحمد", "S1001",
    "Grade 1", "Term 1", "Male", "Active", "1000",
    "150", "1150", "0", "1150"
  ],
  // Row 2: Another parent
  [
    "INV/2024/0002", "خالد يوسف", "2020202020", "0560606060",
    "01/01/2024", "Partial", "يوسف خالد", "S1002",
    "Grade 2", "Term 1", "Male", "Active", "2000",
    "300", "2300", "1000", "1300"
  ],
  // Row 3: Paid invoice
  [
    "INV/2024/0003", "منى عبدالله", "3030303030", "0540404040",
    "01/01/2024", "Paid", "سارة عبدالله", "S1003",
    "Grade 3", "Term 1", "Female", "Active", "1500",
    "225", "1725", "1725", "0"
  ]
];

// Create Workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(data);

XLSX.utils.book_append_sheet(wb, ws, "Invoices");

// Write to file
const outputPath = path.resolve('public', 'sample_import.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`✅ Sample Excel file created at: ${outputPath}`);
