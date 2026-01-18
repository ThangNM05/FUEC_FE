import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Teachers');

    // Define columns
    worksheet.columns = [
        { header: 'TeacherCode', key: 'TeacherCode', width: 15 },
        { header: 'TeacherName', key: 'TeacherName', width: 25 },
        { header: 'CardId', key: 'CardId', width: 15 },
        { header: 'Email', key: 'Email', width: 30 },
        { header: 'DepartmentCode', key: 'DepartmentCode', width: 15 }
    ];

    // Add sample row (optional)
    worksheet.addRow({
        TeacherCode: 'GV001',
        TeacherName: 'Nguyen Van A',
        CardId: '123456789',
        Email: 'nguyenvana@example.com',
        DepartmentCode: 'IT'
    });

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Path to save: ../public/templates/teacher_import_template.xlsx (relative to this script)
    const outputPath = path.join(__dirname, '../public/templates/teacher_import_template.xlsx');

    console.log(`Generating template at: ${outputPath}`);
    try {
        await workbook.xlsx.writeFile(outputPath);
        console.log('Template created successfully!');
    } catch (err) {
        console.error('Error creating template:', err);
    }
};

generateTemplate();
