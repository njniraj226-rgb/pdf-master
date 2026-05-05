import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FaCloudUploadAlt, FaFilePdf, FaFileWord, FaLayerGroup, FaArrowLeft, FaTrash, 
  FaShieldAlt, FaTimes, FaMagic, FaImages, FaCut, FaStamp, FaSyncAlt, FaListOl, 
  FaGlobe, FaEraser, FaFileExcel, FaFilePowerpoint, FaFileAlt, FaFileImage, FaSearch 
} from 'react-icons/fa';
import axios from 'axios';

function App() {
  const [activeTool, setActiveTool] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  const [pageRange, setPageRange] = useState({ start: '', end: '' });
  const [watermarkText, setWatermarkText] = useState('');
  const [rotationAngle, setRotationAngle] = useState('90');
  const [pagesToDelete, setPagesToDelete] = useState('');
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const tools = [
    { id: 'wordToPdf', title: 'Word to PDF', desc: 'Convert Docx to PDF', icon: <FaFileWord />, color: 'from-blue-400 to-indigo-400', border: 'hover:border-blue-300', text: 'text-blue-500', shadow: 'hover:shadow-[0_15px_40px_rgba(59,130,246,0.4)]' },
    { id: 'excelToPdf', title: 'Excel to PDF', desc: 'Convert XLSX to PDF', icon: <FaFileExcel />, color: 'from-emerald-400 to-green-500', border: 'hover:border-emerald-300', text: 'text-emerald-500', shadow: 'hover:shadow-[0_15px_40px_rgba(16,185,129,0.4)]' },
    { id: 'pptToPdf', title: 'PowerPoint to PDF', desc: 'Convert PPTX to PDF', icon: <FaFilePowerpoint />, color: 'from-orange-400 to-red-400', border: 'hover:border-orange-300', text: 'text-orange-500', shadow: 'hover:shadow-[0_15px_40px_rgba(249,115,22,0.4)]' },
    { id: 'imgToPdf', title: 'Image to PDF', desc: 'Convert JPG/PNG to PDF', icon: <FaImages />, color: 'from-pink-400 to-rose-400', border: 'hover:border-pink-300', text: 'text-pink-500', shadow: 'hover:shadow-[0_15px_40px_rgba(244,114,182,0.4)]' },
    { id: 'txtToPdf', title: 'TXT to PDF', desc: 'Convert Text to PDF', icon: <FaFileAlt />, color: 'from-slate-400 to-gray-500', border: 'hover:border-slate-300', text: 'text-slate-500', shadow: 'hover:shadow-[0_15px_40px_rgba(100,116,139,0.4)]' },
    { id: 'pdfToWord', title: 'PDF to Word', desc: 'Extract to Docx', icon: <FaFileWord />, color: 'from-indigo-400 to-violet-500', border: 'hover:border-indigo-300', text: 'text-indigo-500', shadow: 'hover:shadow-[0_15px_40px_rgba(99,102,241,0.4)]' },
    { id: 'pdfToExcel', title: 'PDF to Excel', desc: 'Extract to XLSX', icon: <FaFileExcel />, color: 'from-teal-400 to-emerald-500', border: 'hover:border-teal-300', text: 'text-teal-500', shadow: 'hover:shadow-[0_15px_40px_rgba(20,184,166,0.4)]' },
    { id: 'pdfToPpt', title: 'PDF to PPT', desc: 'Extract to PPTX', icon: <FaFilePowerpoint />, color: 'from-rose-400 to-pink-500', border: 'hover:border-rose-300', text: 'text-rose-500', shadow: 'hover:shadow-[0_15px_40px_rgba(244,63,94,0.4)]' },
    { id: 'pdfToImg', title: 'PDF to Image', desc: 'Convert PDF to JPG/PNG', icon: <FaFileImage />, color: 'from-yellow-400 to-amber-500', border: 'hover:border-yellow-300', text: 'text-yellow-500', shadow: 'hover:shadow-[0_15px_40px_rgba(250,204,21,0.4)]' },
    { id: 'merge', title: 'Merge PDF', desc: 'Combine multiple docs', icon: <FaLayerGroup />, color: 'from-violet-400 to-purple-400', border: 'hover:border-violet-300', text: 'text-violet-500', shadow: 'hover:shadow-[0_15px_40px_rgba(167,139,250,0.4)]' },
    { id: 'splitPdf', title: 'Split PDF', desc: 'Extract specific pages', icon: <FaCut />, color: 'from-amber-400 to-orange-400', border: 'hover:border-amber-300', text: 'text-amber-500', shadow: 'hover:shadow-[0_15px_40px_rgba(251,191,36,0.4)]' },
    { id: 'removePages', title: 'Remove Pages', desc: 'Delete unwanted pages', icon: <FaEraser />, color: 'from-red-400 to-rose-500', border: 'hover:border-red-300', text: 'text-red-500', shadow: 'hover:shadow-[0_15px_40px_rgba(248,113,113,0.4)]' },
    { id: 'ocrPdf', title: 'OCR PDF', desc: 'Scanned PDF to Text', icon: <FaSearch />, color: 'from-cyan-400 to-blue-500', border: 'hover:border-cyan-300', text: 'text-cyan-500', shadow: 'hover:shadow-[0_15px_40px_rgba(34,211,238,0.4)]' },
    { id: 'watermark', title: 'Add Watermark', desc: 'Stamp your PDFs', icon: <FaStamp />, color: 'from-fuchsia-400 to-purple-500', border: 'hover:border-fuchsia-300', text: 'text-fuchsia-500', shadow: 'hover:shadow-[0_15px_40px_rgba(232,121,249,0.4)]' },
    { id: 'rotatePdf', title: 'Rotate PDF', desc: 'Fix upside-down pages', icon: <FaSyncAlt />, color: 'from-sky-400 to-blue-500', border: 'hover:border-sky-300', text: 'text-sky-500', shadow: 'hover:shadow-[0_15px_40px_rgba(56,189,248,0.4)]' },
    { id: 'pageNumbers', title: 'Page Numbers', desc: 'Add numbers to footer', icon: <FaListOl />, color: 'from-lime-400 to-green-400', border: 'hover:border-lime-300', text: 'text-lime-500', shadow: 'hover:shadow-[0_15px_40px_rgba(163,230,53,0.4)]' },
    { id: 'urlToPdf', title: 'URL to PDF', desc: 'Convert websites to PDF', icon: <FaGlobe />, color: 'from-teal-400 to-cyan-500', border: 'hover:border-teal-300', text: 'text-teal-500', shadow: 'hover:shadow-[0_15px_40px_rgba(45,212,191,0.4)]' }
  ];

  const onDrop = (f) => setFiles([...files, ...f]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleAction = async () => {
    // Professional English Error Handling
    if (activeTool !== 'urlToPdf' && files.length === 0) return alert("Please select a file first.");
    if (activeTool === 'urlToPdf' && !urlInput) return alert("Please enter a valid website URL.");
    if (activeTool === 'splitPdf' && (!pageRange.start || !pageRange.end)) return alert("Please specify both the start and end pages.");
    if (activeTool === 'watermark' && !watermarkText) return alert("Please enter the watermark text.");
    if (activeTool === 'removePages' && !pagesToDelete) return alert("Please specify the page numbers to delete (e.g., 1, 3, 5).");

    setLoading(true);
    const formData = new FormData();
    const endpoint = activeTool === 'merge' ? 'merge' : activeTool.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    
    if (activeTool === 'merge') files.forEach(f => formData.append('pdfs', f));
    else if (activeTool === 'imgToPdf') files.forEach(f => formData.append('images', f)); 
    else if (activeTool === 'urlToPdf') formData.append('url', urlInput); 
    else {
        formData.append('file', files[0]);
        if (activeTool === 'splitPdf') { formData.append('startPage', pageRange.start); formData.append('endPage', pageRange.end); }
        if (activeTool === 'watermark') formData.append('watermarkText', watermarkText);
        if (activeTool === 'rotatePdf') formData.append('angle', rotationAngle);
        if (activeTool === 'removePages') formData.append('pagesToDelete', pagesToDelete);
    }

    try {
      let finalData = activeTool === 'urlToPdf' ? { url: urlInput } : formData;
      let config = activeTool === 'urlToPdf' ? { responseType: 'blob', headers: { 'Content-Type': 'application/json' } } : { responseType: 'blob' };
      const res = await axios.post(`https://pdf-master-server.onrender.com/${endpoint}`, finalData, config);
      
      let extension = 'pdf';
      if (activeTool === 'pdfToWord') extension = 'docx';
      else if (activeTool === 'pdfToExcel') extension = 'xlsx';
      else if (activeTool === 'pdfToPpt') extension = 'pptx';
      else if (activeTool === 'pdfToImg') extension = 'zip';

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([res.data]));
      link.download = `PDFMaster_${Date.now()}.${extension}`;
      link.click();
      setFiles([]); setActiveTool(null);
    } catch (e) { 
        alert("Server Error! Please try again or check your network connection."); 
    }
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FFF4F9] text-gray-800 font-sans selection:bg-pink-300 selection:text-white overflow-x-hidden relative">
      
      {/* 🍭 CANDY BACKGROUND WITH DYNAMIC FLOATING IMAGES/ICONS */}
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-gradient-to-br from-[#FFF4F9] via-[#F3F4FF] to-[#EFFFFD]">
        {/* Floating Glass Icons */}
        <div className="absolute top-[10%] left-[5%] text-pink-200/40 animate-bounce duration-[3000ms]"><FaFilePdf size={120}/></div>
        <div className="absolute top-[40%] right-[5%] text-blue-200/40 animate-pulse duration-[4000ms]"><FaFileWord size={100}/></div>
        <div className="absolute bottom-[10%] left-[15%] text-emerald-200/40 animate-bounce duration-[5000ms]"><FaFileExcel size={80}/></div>
        <div className="absolute bottom-[20%] right-[20%] text-orange-200/30 animate-pulse duration-[6000ms]"><FaFilePowerpoint size={140}/></div>
        <div className="absolute top-[60%] left-[40%] text-purple-200/30 animate-bounce duration-[4500ms]"><FaLayerGroup size={60}/></div>

        {/* Soft Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-pink-300/20 rounded-full blur-[120px] mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-300/20 rounded-full blur-[140px] mix-blend-multiply"></div>
      </div>

      <nav className="max-w-7xl mx-auto p-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3 group cursor-pointer bg-white/60 backdrop-blur-md px-6 py-3 rounded-full shadow-sm border border-white/80">
          <div className="bg-gradient-to-tr from-pink-400 to-purple-400 p-2 rounded-full text-white shadow-md"><FaMagic size={18}/></div>
          <span className="text-2xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">PDF Master</span>
        </div>
        <div className="flex items-center gap-6 text-[12px] font-bold tracking-[0.1em] text-gray-500 uppercase bg-white/60 backdrop-blur-md px-6 py-3 rounded-full shadow-sm border border-white/80">
          <button onClick={() => setModal('privacy')} className="hover:text-pink-500 transition-colors">Privacy</button>
          <span className="hidden md:block bg-pink-100 text-pink-600 px-3 py-1 rounded-full">NJ Edition</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {!activeTool ? (
          <div className="animate-in fade-in duration-1000">
            <div className="max-w-4xl mb-16 text-center md:text-left mx-auto md:mx-0">
              <h1 className="text-6xl md:text-[6.5rem] font-black tracking-tighter mb-6 leading-[0.9] text-gray-800">
                SWEET <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 animate-gradient">EFFICIENCY.</span>
              </h1>
              <p className="text-gray-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed mx-auto md:mx-0">
                A colorful, lightning-fast, and secure suite for all your document needs. 17 Premium tools at your fingertips! 🍬
              </p>
            </div> 
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {tools.map(t => (
                <div key={t.id} onClick={() => setActiveTool(t.id)} className={`group relative bg-white/70 backdrop-blur-xl border-2 border-white p-5 rounded-[30px] cursor-pointer transition-all duration-300 hover:-translate-y-2 ${t.border} ${t.shadow} overflow-hidden flex flex-col justify-between min-h-[200px] shadow-[0_8px_30px_rgba(0,0,0,0.04)]`}>
                  <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${t.color} opacity-10 group-hover:opacity-20 rounded-full transition-opacity duration-500`}></div>
                  <div className={`text-3xl mb-4 ${t.text} bg-white w-14 h-14 flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition-transform duration-500`}>{t.icon}</div>
                  <div className="relative z-10">
                      <h3 className="text-lg font-black mb-1 tracking-tight text-gray-800 group-hover:text-pink-600 transition-colors">{t.title}</h3>
                      <p className="text-gray-500 text-[10px] font-bold leading-tight">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-8 fade-in duration-500">
            <button onClick={() => {setActiveTool(null); setFiles([]);}} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-pink-500 font-bold text-xs uppercase tracking-[0.2em] transition-all group bg-white/60 px-5 py-2 rounded-full w-max shadow-sm">
              <FaArrowLeft className="group-hover:-translate-x-2 transition-transform"/> Back to Suite
            </button>
            
            <div className="bg-white/80 backdrop-blur-2xl border-2 border-white rounded-[50px] p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400"></div>
               <h2 className="text-4xl md:text-5xl font-black mb-10 tracking-tighter text-gray-800">{tools.find(t => t.id === activeTool).title}</h2>

               {activeTool !== 'urlToPdf' && (
                 <div {...getRootProps()} className={`border-[3px] border-dashed rounded-[40px] p-16 text-center transition-all duration-300 cursor-pointer bg-white/50 ${isDragActive ? 'border-pink-400 bg-pink-50 scale-95' : 'border-pink-200 hover:border-pink-400 hover:bg-pink-50/50'}`}>
                    <input {...getInputProps()} />
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <FaCloudUploadAlt className={`text-4xl transition-all duration-300 ${isDragActive ? 'text-pink-500' : 'text-pink-300'}`}/>
                    </div>
                    <p className="font-bold text-gray-500 uppercase tracking-[0.2em] text-xs">Drop Your Sweet Document Here</p>
                 </div>
               )}

               {/* Inputs for different tools */}
               {activeTool === 'urlToPdf' && <input type="url" placeholder="https://example.com" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} className="w-full p-6 bg-white border-2 border-pink-100 rounded-full text-gray-700 font-bold outline-none focus:border-pink-400 shadow-inner mt-4" />}
               {activeTool === 'splitPdf' && <div className="mt-6 flex gap-4"><input type="number" placeholder="Start Page" value={pageRange.start} onChange={(e) => setPageRange({...pageRange, start: e.target.value})} className="w-1/2 p-6 bg-white border-2 border-yellow-100 rounded-full text-center font-bold" /><input type="number" placeholder="End Page" value={pageRange.end} onChange={(e) => setPageRange({...pageRange, end: e.target.value})} className="w-1/2 p-6 bg-white border-2 border-yellow-100 rounded-full text-center font-bold" /></div>}
               {activeTool === 'removePages' && <input type="text" placeholder="e.g. 1, 3, 5" value={pagesToDelete} onChange={(e) => setPagesToDelete(e.target.value)} className="w-full p-6 bg-white border-2 border-pink-100 rounded-full text-gray-700 font-bold outline-none focus:border-pink-400 shadow-inner mt-6" />}
               {activeTool === 'watermark' && <input type="text" placeholder="Watermark Text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full p-6 bg-white border-2 border-purple-100 rounded-full mt-6 font-bold" />}

               {activeTool === 'rotatePdf' && (
                 <div className="mt-6">
                    <select value={rotationAngle} onChange={(e) => setRotationAngle(e.target.value)} className="w-full p-6 bg-white border-2 border-cyan-100 rounded-full text-gray-700 font-bold outline-none focus:border-cyan-400 shadow-inner appearance-none cursor-pointer">
                        <option value="90">Rotate 90° Clockwise</option>
                        <option value="180">Rotate 180° Upside Down</option>
                        <option value="270">Rotate 270° Counter-Clockwise</option>
                    </select>
                 </div>
               )}

               {(files.length > 0 || activeTool === 'urlToPdf') && (
                 <div className="mt-10 space-y-4">
                    <button onClick={handleAction} disabled={loading} className="w-full mt-8 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 text-white py-6 rounded-full font-black text-xl tracking-wide hover:shadow-[0_15px_30px_rgba(236,72,153,0.3)] hover:-translate-y-1 active:scale-95 transition-all duration-300">
                         {loading ? "MIXING MAGIC... ✨" : "DO THE MAGIC ✨"}
                    </button>
                 </div>
               )}
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 mt-10 relative z-10">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t-2 border-pink-100 pt-10 text-gray-400 text-[11px] font-black tracking-[0.3em] uppercase">
            <span>Developed by Niraj & Amit</span>
            <div className="flex items-center gap-2 text-pink-500 bg-pink-50 px-5 py-2.5 rounded-full border border-pink-100 shadow-sm"><FaShieldAlt size={14}/> 100% Safe & Sweet</div>
         </div>
      </footer>
    </div>
  );
}

export default App;