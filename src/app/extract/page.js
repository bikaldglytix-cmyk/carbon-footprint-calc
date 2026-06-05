import { execSync } from 'child_process';
import fs from 'fs';

export default async function ExtractPage() {
    let result = '';
    try {
        execSync('npm install mammoth --no-save', { encoding: 'utf-8', shell: 'cmd.exe', cwd: process.cwd() });
        const mammoth = require('mammoth');
        const docx = await mammoth.extractRawText({path: "C:\\Users\\acer\\Desktop\\HW PRO\\DSC\\Shoes\\Drifter\\Trial\\public\\EF_and_Questions (1).docx"});
        fs.writeFileSync('extracted.txt', docx.value);
        result = docx.value;
    } catch(err) {
        result = err.message + '\n' + err.stack;
    }
    return <div><pre>{result}</pre></div>;
}
