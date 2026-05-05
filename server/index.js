const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PDFDocument, rgb, degrees } = require('pdf-lib');
const mammoth = require('mammoth');
const puppeteer = require('puppeteer'); 
const pdfExtract = require('pdf-extraction');
const { Document, Packer, Paragraph, TextRun } = require('docx');

// --- 3 NAYE LIBRARIES ---
const xlsx = require('xlsx'); 
const PptxGenJS = require('pptxgenjs'); 
const AdmZip = require('adm-zip');

const app = express();

app.use(cors({
    origin: ["https://pdf-master-tau.vercel.app", "http://localhost:5173", "http://localhost:3000", "*"],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

// Puppeteer Options for Render (Memory Save)
const puppeteerOptions = { 
    headless: "new", 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process', '--disable-gpu'] 
};

// ==========================================
// 🚀 1. TO PDF CONVERTERS
// ==========================================

// 1. Word to PDF
app.post('/word-to-pdf', upload.single('file'), async (req, res) => {
    let browser;
    try {
        const result = await mammoth.convertToHtml({ buffer: req.file.buffer });
        browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        await page.setContent(`<div style="font-family: Arial; padding: 20px;">${result.value}</div>`);
        const pdf = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
        res.set('Content-Type', 'application/pdf'); res.send(Buffer.from(pdf));
    } catch (err) { if (browser) await browser.close(); res.status(500).send("Word to PDF error."); }
});

// 2. Excel to PDF (Smart Table Render)
app.post('/excel-to-pdf', upload.single('file'), async (req, res) => {
    let browser;
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const htmlStr = xlsx.utils.sheet_to_html(workbook.Sheets[workbook.SheetNames[0]]);
        browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        await page.setContent(`<div style="font-family: Arial; padding: 20px;"><h2>Excel Sheet Data</h2>${htmlStr}</div>`);
        const pdf = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
        res.set('Content-Type', 'application/pdf'); res.send(Buffer.from(pdf));
    } catch (err) { if (browser) await browser.close(); res.status(500).send("Excel to PDF error"); }
});

// 3. PPT to PDF (Placeholder for College Project)
app.post('/ppt-to-pdf', upload.single('file'), async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        await page.setContent(`<div style="font-family: Arial; padding: 50px; text-align: center;"><h1>PowerPoint Document</h1><p>Processed securely by PDF Master.</p><p style="color: gray; font-size: 12px;">(Visual PPT rendering requires heavy server resources/paid APIs)</p></div>`);
        const pdf = await page.pdf({ format: 'A4' });
        await browser.close();
        res.set('Content-Type', 'application/pdf'); res.send(Buffer.from(pdf));
    } catch (err) { if (browser) await browser.close(); res.status(500).send("PPT to PDF error"); }
});

// 4. Image to PDF
app.post('/img-to-pdf', upload.array('images', 20), async (req, res) => {
    try {
        const pdfDoc = await PDFDocument.create();
        for (const file of req.files) {
            let img;
            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') img = await pdfDoc.embedJpg(file.buffer);
            else if (file.mimetype === 'image/png') img = await pdfDoc.embedPng(file.buffer);
            else continue; 
            const page = pdfDoc.addPage([img.width, img.height]);
            page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        }
        res.set('Content-Type', 'application/pdf'); res.send(Buffer.from(await pdfDoc.save()));
    } catch (err) { res.status(500).send("Img to PDF error."); }
});

// 5. TXT to PDF
app.post('/txt-to-pdf', upload.single('file'), async (req, res) => {
    let browser;
    try {
        const text = req.file.buffer.toString('utf8');
        browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        await page.setContent(`<pre style="font-family: monospace; padding: 20px; white-space: pre-wrap;">${text}</pre>`);
        const pdf = await page.pdf({ format: 'A4' });
        await browser.close();
        res.set('Content-Type', 'application/pdf'); res.send(Buffer.from(pdf));
    } catch (err) { if (browser) await browser.close(); res.status(500).send("TXT to PDF error"); }
});

// ==========================================
// 📥 2. FROM PDF CONVERTERS
// ==========================================

// 6. PDF to Word
app.post('/pdf-to-word', upload.single('file'), async (req, res) => {
    try {
        const data = await pdfExtract(req.file.buffer);
        const doc = new Document({ sections: [{ children: data.text.split('\n').map(line => new Paragraph({ children: [new TextRun({ text: line.trim(), font: "Arial", size: 24 })] })) }] });
        res.send(Buffer.from(await Packer.toBuffer(doc)));
    } catch (err) { res.status(500).send("PDF to Word error."); }
});

// 7. PDF to Excel
app.post('/pdf-to-excel', upload.single('file'), async (req, res) => {
    try {
        const data = await pdfExtract(req.file.buffer);
        const rows = data.text.split('\n').map(line => [line]);
        const ws = xlsx.utils.aoa_to_sheet(rows);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Extracted Data");
        res.send(xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' }));
    } catch (err) { res.status(500).send("PDF to Excel error"); }
});

// 8. PDF to PPT
app.post('/pdf-to-ppt', upload.single('file'), async (req, res) => {
    try {
        const data = await pdfExtract(req.file.buffer);
        const pptx = new PptxGenJS();
        const slide = pptx.addSlide();
        slide.addText(data.text.substring(0, 2000), { x: 0.5, y: 0.5, w: '90%', h: '90%', fontSize: 14, color: '363636' });
        const buf = await pptx.write({ outputType: 'nodebuffer' });
        res.send(buf);
    } catch (err) { res.status(500).send("PDF to PPT error"); }
});

// 9. PDF to Image (ZIP Placeholder)
app.post('/pdf-to-img', upload.single('file'), async (req, res) => {
    try {
        const zip = new AdmZip();
        zip.addFile("Notice.txt", Buffer.from("PDF to JPG/PNG rasterization requires Ghostscript on the server. This dummy ZIP maintains the system flow for project demo."));
        res.send(zip.toBuffer());
    } catch (err) { res.status(500).send("PDF to Img error"); }
});

// ==========================================
// ⚙️ 3. UTILITIES & MANIPULATION
// ==========================================

// 10. Merge PDF
app.post('/merge', upload.array('pdfs'), async (req, res) => {
    try {
        const mergedPdf = await PDFDocument.create();
        for (const file of req.files) {
            const pdf = await PDFDocument.load(file.buffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(p => mergedPdf.addPage(p));
        }
        res.set('Content-Type', 'application/pdf'); res.send(Buffer.from(await mergedPdf.save()));
    } catch (err) { res.status(500).send("Merge error."); }
});

// 11. Split PDF
app.post('/split-pdf', upload.single('file'), async (req, res) => {
    try {
        const { startPage, endPage } = req.body;
        const pdfDoc = await PDFDocument.load(req.file.buffer);
        let start = Math.max(0, parseInt(startPage) - 1), end = Math.min(pdfDoc.getPageCount() - 1, parseInt(endPage) - 1);
        const newPdf = await PDFDocument.create();
        const pagesToCopy = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        const copiedPages = await newPdf.copyPages(pdfDoc, pagesToCopy);
        copiedPages.forEach(p => newPdf.addPage(p));
        res.set('Content-Type', 'application/pdf'); res.send(Buffer.from(await newPdf.save()));
    } catch (err) { res.status(500).send("Split PDF error."); }
});

// 12. Remove Pages
app.post('/remove-pages', upload.single('file'), async (req, res) => {
    try {
        const toRemove = req.body.pagesToDelete.split(',').map(n => parseInt(n.trim()) - 1);
        const pdfDoc = await PDFDocument.load(req.file.buffer);
        const pagesToKeep = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i).filter(i => !toRemove.includes(i));
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep);
        copiedPages.forEach(p => newPdf.addPage(p));
        res.set('Content-Type', 'application/pdf'); res.send(Buffer.from(await newPdf.save()));
    } catch (err) { res.status(500).send("Remove Pages error."); }
});

// 13 Watermark Endpoint
app.post('/watermark', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send("Please upload a PDF file");
        
        // Frontend se watermarkText aa raha hai
        const { watermarkText } = req.body; 
        if (!watermarkText) return res.status(400).send("Please provide watermark text");

        // PDF Load karo aur Font embed karo
        const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
        const pdfDoc = await PDFDocument.load(req.file.buffer);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica); // Font lazmi hai
        
        const pages = pdfDoc.getPages();

        // Har page par loop lagakar watermark draw karo
        pages.forEach(page => {
            const { width, height } = page.getSize();
            page.drawText(watermarkText, {
                x: width / 2 - 100, // Center ke aas-paas
                y: height / 2,
                size: 50,
                font: helveticaFont, // Ye add karna zaroori tha
                color: rgb(0.95, 0.1, 0.1), // Halka Red color
                opacity: 0.3, // Transparent effect
                rotate: degrees(45), // Tircha (diagonal) watermark
            });
        });
        // 1. Password Protect Endpoint
app.post('/protect-pdf', upload.single('file'), async (req, res) => {
    try {
        const { password } = req.body;
        const { PDFDocument } = require('pdf-lib');
        const pdfDoc = await PDFDocument.load(req.file.buffer);
        
        // Note: pdf-lib basic encryption support karta hai
        // Advanced protection ke liye 'qpdf' or 'hummus' use hota hai
        // Hum yahan file ko re-save karke metadata set kar sakte hain
        const pdfBytes = await pdfDoc.save({ 
            userPassword: password, 
            ownerPassword: password,
            permissions: { printing: 'lowResolution', modifying: false }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(pdfBytes));
    } catch (e) { res.status(500).send("Error protecting PDF"); }
});

// 2. Compress PDF (Basic Level)
app.post('/compress-pdf', upload.single('file'), async (req, res) => {
    try {
        const { PDFDocument } = require('pdf-lib');
        const pdfDoc = await PDFDocument.load(req.file.buffer);
        
        // Compression ke liye hum objects ko re-index aur unnecessary metadata remove karte hain
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });

        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(pdfBytes));
    } catch (e) { res.status(500).send("Error compressing PDF"); }
});

        const pdfBytes = await pdfDoc.save();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="watermarked.pdf"');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error("Watermark Error:", error);
        res.status(500).send("Server error while adding watermark");
    }
});

// 14. Rotate PDF
app.post('/rotate-pdf', upload.single('file'), async (req, res) => {
    try {
        const rotationAngle = parseInt(req.body.angle) || 90;
        const pdfDoc = await PDFDocument.load(req.file.buffer);
        pdfDoc.getPages().forEach(page => page.setRotation(degrees(page.getRotation().angle + rotationAngle)));
        res.set('Content-Type', 'application/pdf'); res.send(Buffer.from(await pdfDoc.save()));
    } catch (err) { res.status(500).send("Rotate error."); }
});

// 15. Page Numbers
app.post('/page-numbers', upload.single('file'), async (req, res) => {
    try {
        const pdfDoc = await PDFDocument.load(req.file.buffer);
        pdfDoc.getPages().forEach((page, index) => {
            page.drawText(`Page ${index + 1}`, { x: page.getSize().width / 2 - 20, y: 30, size: 12, color: rgb(0, 0, 0) });
        });
        res.set('Content-Type', 'application/pdf'); res.send(Buffer.from(await pdfDoc.save()));
    } catch (err) { res.status(500).send("Page numbers error."); }
});

// 16. OCR PDF (Clean Text Extract)
app.post('/ocr-pdf', upload.single('file'), async (req, res) => {
    let browser;
    try {
        const data = await pdfExtract(req.file.buffer);
        browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        await page.setContent(`<div style="font-family: Arial; padding: 20px;"><h2>OCR Extraction Result</h2><pre style="white-space: pre-wrap;">${data.text}</pre></div>`);
        const pdf = await page.pdf({ format: 'A4' });
        await browser.close();
        res.set('Content-Type', 'application/pdf'); res.send(Buffer.from(pdf));
    } catch (err) { if (browser) await browser.close(); res.status(500).send("OCR PDF error"); }
});

// 17. URL to PDF
app.post('/url-to-pdf', async (req, res) => {
    let browser;
    try {
        let { url } = req.body;
        if (!url.startsWith('http')) url = 'https://' + url;
        browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); 
        const pdf = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
        res.set('Content-Type', 'application/pdf'); res.send(Buffer.from(pdf));
    } catch (err) { if (browser) await browser.close(); res.status(500).send("URL to PDF error."); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => { console.log(`Server running with 17 Tools on port ${PORT}`); });