import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FaFilePdf, FaFileWord, FaLayerGroup, FaArrowLeft, FaTrash, 
  FaShieldAlt, FaMagic, FaImages, FaCut, FaStamp, FaSyncAlt, FaListOl, 
  FaGlobe, FaEraser, FaFileExcel, FaFilePowerpoint, FaFileAlt, FaFileImage, FaSearch,
  FaChevronDown, FaChevronUp, FaCheckCircle, FaBolt, FaLock, FaUnlock
} from 'react-icons/fa';
import axios from 'axios';

function App() {
  const [activeTool, setActiveTool] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  
  const [pageRange, setPageRange] = useState({ start: '', end: '' });
  const [watermarkText, setWatermarkText] = useState('');
  const [rotationAngle, setRotationAngle] = useState('90');
  const [pagesToDelete, setPagesToDelete] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => { setMounted(true); }, []);

  // Professional + Candy Mix Tools List (All 22 Tools)
  const tools = [
    { id: 'wordToPdf', title: 'Word to PDF', desc: 'Convert Docx to PDF', icon: <FaFileWord />, color: 'from-blue-400 to-indigo-400', border: 'hover:border-blue-300', text: 'text-blue-500', shadow: 'hover:shadow-[0_15px_40px_rgba(59,130,246,0.3)]' },
    { id: 'excelToPdf', title: 'Excel to PDF', desc: 'Convert XLSX to PDF', icon: <FaFileExcel />, color: 'from-emerald-400 to-green-500', border: 'hover:border-emerald-300', text: 'text-emerald-500', shadow: 'hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)]' },
    { id: 'pptToPdf', title: 'PowerPoint to PDF', desc: 'Convert PPTX to PDF', icon: <FaFilePowerpoint />, color: 'from-orange-400 to-red-400', border: 'hover:border-orange-300', text: 'text-orange-500', shadow: 'hover:shadow-[0_15px_40px_rgba(249,115,22,0.3)]' },
    { id: 'imgToPdf', title: 'Image to PDF', desc: 'Convert JPG/PNG to PDF', icon: <FaImages />, color: 'from-pink-400 to-rose-400', border: 'hover:border-pink-300', text: 'text-pink-500', shadow: 'hover:shadow-[0_15px_40px_rgba(244,114,182,0.3)]' },
    { id: 'txtToPdf', title: 'TXT to PDF', desc: 'Convert Text to PDF', icon: <FaFileAlt />, color: 'from-slate-400 to-gray-500', border: 'hover:border-slate-300', text: 'text-slate-500', shadow: 'hover:shadow-[0_15px_40px_rgba(100,116,139,0.3)]' },
    { id: 'pdfToWord', title: 'PDF to Word', desc: 'Extract to Docx', icon: <FaFileWord />, color: 'from-indigo-400 to-violet-500', border: 'hover:border-indigo-300', text: 'text-indigo-500', shadow: 'hover:shadow-[0_15px_40px_rgba(99,102,241,0.3)]' },
    { id: 'compressPdf', title: 'Compress PDF', desc: 'Reduce file size', icon: <FaLayerGroup />, color: 'from-orange-300 to-yellow-500', border: 'hover:border-orange-300', text: 'text-orange-500', shadow: 'hover:shadow-[0_15px_40px_rgba(249,115,22,0.3)]' },
    { id: 'protectPdf', title: 'Password Protect', desc: 'Encrypt your PDF', icon: <FaLock />, color: 'from-red-500 to-red-700', border: 'hover:border-red-400', text: 'text-red-600', shadow: 'hover:shadow-[0_15px_40px_rgba(220,38,38,0.3)]' },
    { id: 'unlockPdf', title: 'Unlock PDF', desc: 'Remove password', icon: <FaUnlock />, color: 'from-green-400 to-teal-600', border: 'hover:border-green-300', text: 'text-green-600', shadow: 'hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)]' },
    { id: 'merge', title: 'Merge PDF', desc: 'Combine multiple docs', icon: <FaLayerGroup />, color: 'from-violet-400 to-purple-400', border: 'hover:border-violet-300', text: 'text-violet-500', shadow: 'hover:shadow-[0_15px_40px_rgba(167,139,250,0.3)]' },
    { id: 'splitPdf', title: 'Split PDF', desc: 'Extract specific pages', icon: <FaCut />, color: 'from-amber-400 to-orange-400', border: 'hover:border-amber-300', text: 'text-amber-500', shadow: 'hover:shadow-[0_15px_40px_rgba(251,191,36,0.3)]' },
    { id: 'watermark', title: 'Add Watermark', desc: 'Stamp your PDFs', icon: <FaStamp />, color: 'from-fuchsia-400 to-purple-500', border: 'hover:border-fuchsia-300', text: 'text-fuchsia-500', shadow: 'hover:shadow-[0_15px_40px_rgba(232,121,249,0.3)]' },
    { id: 'rotatePdf', title: 'Rotate PDF', desc: 'Fix page orientation', icon: <FaSyncAlt />, color: 'from-sky-400 to-blue-500', border: 'hover:border-sky-300', text: 'text-sky-500', shadow: 'hover:shadow-[0_15px_40px_rgba(56,189,248,0.3)]' },
    { id: 'cropPdf', title: 'Crop PDF', desc: 'Trim document edges', icon: <FaCut />, color: 'from-blue-400 to-cyan-500', border: 'hover:border-blue-300', text: 'text-blue-500', shadow: 'hover:shadow-[0_15px_40px_rgba(59,130,246,0.3)]' },
    { id: 'redactPdf', title: 'Redact PDF', desc: 'Hide sensitive info', icon: <FaEraser />, color: 'from-gray-600 to-black', border: 'hover:border-gray-500', text: 'text-gray-800', shadow: 'hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]' }
  ];

  const faqs = [
    { q: "What is PDF Master?", a: "PDF Master is an all-in-one professional suite for managing, converting, and editing your PDF documents securely online." },
    { q: "Do I need to download or install anything?", a: "No! Our tool is completely web-based. Process your files directly in your browser without installing any software." },
    { q: "Is PDF Master safe to use?", a: "Yes, absolutely. We use a Zero-Data Log policy. Your files are processed securely and deleted immediately." },
    { q: "Can I convert a Word document into a PDF?", a: "Yes, our 'Word to PDF' tool accurately converts your .docx files into perfectly formatted PDFs." }
  ];

  const onDrop = (f) => setFiles([...files, ...f]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleAction = async () => {
    if (activeTool !== 'urlToPdf' && files.length === 0) return alert("Please select a file first.");
    setLoading(true);
    const formData = new FormData();
    const endpoint = activeTool === 'merge' ? 'merge' : activeTool.replace(/[A-Z]/g, l => `-${l.toLowerCase()}`);
    
    if (activeTool === 'merge') files.forEach(f => formData.append('pdfs', f));
    else if (activeTool === 'imgToPdf') files.forEach(f => formData.append('images', f)); 
    else {
        formData.append('file', files[0]);
        if (activeTool === 'splitPdf') { formData.append('startPage', pageRange.start); formData.append('endPage', pageRange.end); }
        if (activeTool === 'watermark') formData.append('watermarkText', watermarkText);
        if (activeTool === 'rotatePdf') formData.append('angle', rotationAngle);
        if (activeTool === 'protectPdf') formData.append('password', password);
    }

    try {
      const res = await axios.post(`https://pdf-master-server.onrender.com/${endpoint}`, formData, { responseType: 'blob' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([res.data]));
      link.download = `PDFMaster_${Date.now()}.pdf`;
      link.click();
      setFiles([]); setActiveTool(null);
    } catch (e) { alert("Server Error! Please try again."); }
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FFF4F9] text-gray-800 font-sans selection:bg-pink-300 relative overflow-x-hidden">
      
      {/* CANDY BACKGROUND */}
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-gradient-to-br from-[#FFF4F9] via-[#F3F4FF] to-[#EFFFFD]">
        <div className="absolute top-[10%] left-[5%] text-pink-200/40 animate-bounce duration-[3000ms]"><FaFilePdf size={120}/></div>
        <div className="absolute top-[40%] right-[5%] text-blue-200/40 animate-pulse duration-[4000ms]"><FaFileWord size={100}/></div>
        <div className="absolute bottom-[20%] right-[20%] text-orange-200/30 animate-pulse duration-[6000ms]"><FaFilePowerpoint size={140}/></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-pink-300/20 rounded-full blur-[120px]"></div>
      </div>

      <nav className="max-w-7xl mx-auto p-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3 cursor-pointer bg-white/60 backdrop-blur-md px-6 py-3 rounded-full shadow-sm border border-white" onClick={() => {setActiveTool(null); setFiles([]);}}>
          <div className="bg-gradient-to-tr from-pink-400 to-purple-400 p-2 rounded-full text-white shadow-md"><FaMagic size={18}/></div>
          <span className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">PDF Master</span>
        </div>
        <div className="flex items-center gap-6 text-[12px] font-bold text-gray-500 uppercase bg-white/60 px-6 py-3 rounded-full shadow-sm">
          <span>NJ Edition</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {!activeTool ? (
          <div className="animate-in fade-in duration-1000">
            {/* HERO SECTION (Image 1 Style) */}
            <div className="max-w-4xl text-center mx-auto mb-10">
              <h1 className="text-5xl md:text-[4.5rem] font-black tracking-tighter mb-6 leading-[1.1] text-gray-900">All-in-One Online PDF Editor</h1>
              <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">Easily edit, convert and sign PDFs. Fast, simple and secure.</p>
            </div> 

            {/* MAIN DROPZONE (Image 1 Style) */}
            <div {...getRootProps()} className={`mb-20 border-[3px] border-dashed rounded-[30px] bg-white p-16 text-center transition-all cursor-pointer shadow-sm max-w-4xl mx-auto ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:shadow-md'}`}>
                <input {...getInputProps()} />
                <div className="w-16 h-16 mx-auto mb-4 text-gray-800">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 12 15 15"></polyline></svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Drop your file here</h3>
                <button className="bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold py-4 px-12 rounded-lg shadow-md transition-colors">Browse files</button>
            </div>

            {/* TOOLS GRID (Candy Style) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-24">
              {tools.map(t => (
                <div key={t.id} onClick={() => setActiveTool(t.id)} className={`group bg-white/70 backdrop-blur-xl border-2 border-white p-5 rounded-[30px] cursor-pointer transition-all duration-300 hover:-translate-y-2 ${t.border} ${t.shadow} flex flex-col justify-between min-h-[180px]`}>
                  <div className={`text-3xl mb-4 ${t.text} bg-white w-12 h-12 flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition-transform`}>{t.icon}</div>
                  <div>
                      <h3 className="text-lg font-black mb-1 text-gray-800 group-hover:text-pink-600">{t.title}</h3>
                      <p className="text-gray-500 text-[10px] font-bold">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* BENEFITS SECTION */}
            <div className="max-w-5xl mx-auto mb-24 grid md:grid-cols-3 gap-10 border-t border-pink-100 pt-20">
               <div className="text-center bg-white/50 p-8 rounded-[30px] border border-white">
                  <div className="w-14 h-14 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 text-xl"><FaBolt /></div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Lightning Fast</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Process your documents in seconds. Our cloud-based servers handle the heavy lifting instantly.</p>
               </div>
               <div className="text-center bg-white/50 p-8 rounded-[30px] border border-white">
                  <div className="w-14 h-14 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 text-xl"><FaShieldAlt /></div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Secure & Private</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Your files are completely safe. We use end-to-end processing and instantly delete files from our servers.</p>
               </div>
               <div className="text-center bg-white/50 p-8 rounded-[30px] border border-white">
                  <div className="w-14 h-14 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6 text-xl"><FaCheckCircle /></div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">High Quality</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Enjoy 100% accurate conversions. Formatting, images, and text alignment stay perfectly intact.</p>
               </div>
            </div>

            {/* FAQ SECTION (Image 2 Style) */}
            <div className="max-w-4xl mx-auto mb-20">
               <h2 className="text-3xl font-black text-center text-gray-800 mb-10">Frequently Asked Questions</h2>
               <div className="space-y-4">
                  {faqs.map((faq, index) => (
                     <div key={index} className="bg-white border-2 border-white rounded-[20px] overflow-hidden shadow-sm">
                        <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full px-8 py-6 flex justify-between items-center text-left">
                           <span className="font-bold text-gray-800 text-lg">{faq.q}</span>
                           <span className="text-gray-400">{openFaq === index ? <FaChevronUp /> : <FaChevronDown />}</span>
                        </button>
                        {openFaq === index && <div className="px-8 pb-6 text-gray-500 border-t border-gray-50 pt-4">{faq.a}</div>}
                     </div>
                  ))}
               </div>
            </div>

          </div>
        ) : (
          /* ACTIVE TOOL PAGE */
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
            <button onClick={() => {setActiveTool(null); setFiles([]);}} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-pink-500 font-bold text-xs uppercase tracking-widest bg-white/60 px-5 py-2 rounded-full shadow-sm">
              <FaArrowLeft /> Back to Suite
            </button>
            <div className="bg-white/80 backdrop-blur-2xl border-2 border-white rounded-[50px] p-10 md:p-14 shadow-xl relative overflow-hidden text-center">
               <h2 className="text-4xl font-black text-gray-800 mb-4">{tools.find(t => t.id === activeTool).title}</h2>
               {files.length === 0 && <div {...getRootProps()} className="border-2 border-dashed border-pink-200 p-10 rounded-[30px] hover:bg-pink-50 cursor-pointer"><input {...getInputProps()} /><p className="font-bold text-pink-300">Drop or Select File</p></div>}
               {activeTool === 'protectPdf' && <input type="password" placeholder="Set Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 mt-6 border-2 border-red-100 rounded-full text-center outline-none" />}
               {activeTool === 'watermark' && <input type="text" placeholder="Watermark Text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full p-4 mt-6 border-2 border-purple-100 rounded-full text-center outline-none" />}
               {files.length > 0 && (
                 <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center bg-pink-50 p-4 rounded-full px-6">
                        <span className="text-sm font-bold text-gray-600 truncate">{files[0].name}</span>
                        <FaTrash className="text-red-400 cursor-pointer" onClick={() => setFiles([])}/>
                    </div>
                    <button onClick={handleAction} disabled={loading} className="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 text-white py-5 rounded-full font-black text-xl hover:shadow-lg transition-all">
                        {loading ? "PROCESSING..." : "EXECUTE MAGIC ✨"}
                    </button>
                 </div>
               )}
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 mt-10 border-t-2 border-pink-100 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
         Developed by Niraj & Amit • 100% Safe & Sweet
      </footer>
    </div>
  );
}

export default App;