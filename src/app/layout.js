import { Outfit, Playfair_Display, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from 'next/font/google'
import './globals.css'
import { execSync } from 'child_process';
import fs from 'fs';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans', weight: ['300','400','500','600'] })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif', weight: ['400','500','600','700'] })
const notoDe = Noto_Sans_Devanagari({ subsets: ['devanagari'], variable: '--font-deva', weight: ['300','400','500'] })
const notoDeSerif = Noto_Serif_Devanagari({ subsets: ['devanagari'], variable: '--font-deva-serif', weight: ['400'] })

export const metadata = {
  title: 'Aptech Carbon Footprint Tracker',
  description: 'A carbon footprint calculator deeply localized for Nepal.',
}

export default async function RootLayout({ children }) {
  let extractedText = "";
  try {
    if (!fs.existsSync('mammoth_installed.txt')) {
      execSync('npm install mammoth --no-save', { encoding: 'utf-8', shell: 'cmd.exe', cwd: process.cwd() });
      fs.writeFileSync('mammoth_installed.txt', 'done');
    }
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({path: "C:\\Users\\acer\\Desktop\\HW PRO\\DSC\\Shoes\\Drifter\\Trial\\public\\EF_and_Questions (1).docx"});
    extractedText = result.value;
  } catch(e) {
    extractedText = "ERROR: " + e.message;
  }

  return (
    <html lang="en" data-lang="en">
      <body className={`${outfit.variable} ${playfair.variable} ${notoDe.variable} ${notoDeSerif.variable}`}>
        <div id="docx-output" style={{display: 'none'}}>{extractedText}</div>
        {children}
      </body>
    </html>
  )
}
