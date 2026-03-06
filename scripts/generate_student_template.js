import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateStudentTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    // Define columns
    worksheet.columns = [
        { header: 'StudentCode', key: 'studentCode', width: 15 },
        { header: 'StudentName', key: 'studentName', width: 25 },
        { header: 'CardId', key: 'cardId', width: 15 },
        { header: 'Email', key: 'email', width: 30 },
    ];

    // Add sample data
    worksheet.addRow({
        studentCode: 'SE123456',
        studentName: 'Nguyen Van A',
        cardId: '001234567891',
        email: 'nguyenvana@example.com'
    });

    worksheet.addRow({
        studentCode: 'SE654321',
        studentName: 'Tran Thi B',
        cardId: '001234567892',
        email: 'tranthib@example.com'
    });

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Save file
    const outputPath = path.resolve(__dirname, '../public/templates/student_import_template.xlsx');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Template generated at: ${outputPath}`);
};

generateStudentTemplate().catch(console.error);
