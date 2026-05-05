import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FaFilePdf, FaFileWord, FaLayerGroup, FaArrowLeft, FaTrash, 
  FaShieldAlt, FaMagic, FaImages, FaCut, FaStamp, FaSyncAlt, FaListOl, 
  FaGlobe, FaEraser, FaFileExcel, FaFilePowerpoint, FaFileAlt, FaFileImage, FaSearch,
  FaChevronDown, FaChevronUp, FaCheckCircle, FaBolt, FaLock, FaUnlock, FaPenNib
} from 'react-icons/fa';
import axios from 'axios';

function App() {
  const [activeTool, setActiveTool] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const menuRef = useRef(null);
  
  const [pageRange, setPageRange] = useState({ start: '', end: '' });
  const [watermarkText, setWatermarkText] = useState('');
  const [rotationAngle, setRotationAngle] = useState('90');
  const [pagesToDelete, setPagesToDelete] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => { 
    setMounted(true);
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowMegaMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Categorized Tools for Mega Menu
  const megaMenuTools = {
    "Edit & Annotate": [
      { id: 'compressPdf', title: 'Compress', icon: <FaLayerGroup />, color: 'text-orange-600' },
      { id: 'watermark', title: 'Add watermark', icon: <FaStamp />, color: 'text-fuchsia-500' },
      { id: 'protectPdf', title: 'Password protect', icon: <FaLock />, color: 'text-red-600' },
      { id: 'unlockPdf', title: 'Unlock PDF', icon: <FaUnlock />, color: 'text-teal-600' },
      { id: 'redactPdf', title: 'Redact', icon: <FaEraser />, color: 'text-black' },
      { id: 'cropPdf', title: 'Crop', icon: <FaCut />, color: 'text-blue-600' }
    ],
    "Organize": [
      { id: 'merge', title: 'Merge PDF', icon: <FaLayerGroup />, color: 'text-purple-600' },
      { id: 'splitPdf', title: 'Split PDF', icon: <FaCut />, color: 'text-amber-500' },
      { id: 'rotatePdf', title: 'Rotate PDF', icon: <FaSyncAlt />, color: 'text-sky-500' },
      { id: 'removePages', title: 'Delete pages', icon: <FaEraser />, color: 'text-red-600' }
    ],
    "Convert to PDF": [
      { id: 'wordToPdf', title: 'WORD to PDF', icon: <FaFileWord />, color: 'text-blue-500' },
      { id: 'excelToPdf', title: 'EXCEL to PDF', icon: <FaFileExcel />, color: 'text-green-500' },
      { id: 'pptToPdf', title: 'POWERPOINT to PDF', icon: <FaFilePowerpoint />, color: 'text-orange-500' },
      { id: 'imgToPdf', title: 'JPG to PDF', icon: <FaImages />, color: 'text-pink-500' },
      { id: 'txtToPdf', title: 'TXT to PDF', icon: <FaFileAlt />, color: 'text-gray-500' }
    ],
    "Convert from PDF": [
      { id: 'pdfToWord', title: 'PDF to WORD', icon: <FaFileWord />, color: 'text-blue-400' },
      { id: 'pdfToExcel', title: 'PDF to EXCEL', icon: <FaFileExcel />, color: 'text-green-400' },
      { id: 'pdfToImg', title: 'PDF to JPG', icon: <FaFileImage />, color: 'text-yellow-500' }
    ]
  };

  // Original Candy Grid Tools (Keeping them same)
  const gridTools = [
    { id: 'wordToPdf', title: 'Word to PDF', desc: 'Convert Docx to PDF', icon: <FaFileWord />, color: 'from-blue-400 to-indigo-400', border: 'hover:border-blue-300', text: 'text-blue-500', shadow: 'hover:shadow-[0_15px_40px_rgba(59,130,246,0.3)]' },
    { id: 'excelToPdf', title: 'Excel to PDF', desc: 'Convert XLSX to PDF', icon: <FaFileExcel />, color: 'from-emerald-400 to-green-500', border: 'hover:border-emerald-300', text: 'text-emerald-500', shadow: 'hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)]' },
    { id: 'imgToPdf', title: 'Image to PDF', desc: 'Convert JPG/PNG to PDF', icon: <FaImages />, color: 'from-pink-400 to-rose-400', border: 'hover:border-pink-300', text: 'text-pink-500', shadow: 'hover:shadow-[0_15px_40px_rgba(244,114,182,0.3)]' },
    { id: 'merge', title: 'Merge PDF', desc: 'Combine multiple docs', icon: <FaLayerGroup />, color: 'from-violet-400 to-purple-400', border: 'hover:border-violet-300', text: 'text-violet-500', shadow: 'hover:shadow-[0_15px_40px_rgba(167,139,250,0.3)]' },
    { id: 'compressPdf', title: 'Compress PDF', desc: 'Reduce file size', icon: <FaLayerGroup />, color: 'from-orange-300 to-yellow-500', border: 'hover:border-orange-300', text: 'text-orange-500', shadow: 'hover:shadow-[0_15px_40px_rgba(249,115,22,0.3)]' },
    { id: 'protectPdf', title: 'Password Protect', desc: 'Encrypt your PDF', icon: <FaLock />, color: 'from-red-500 to-red-700', border: 'hover:border-red-400', text: 'text-red-600', shadow: 'hover:shadow-[0_15px_40px_rgba(220,38,38,0.3)]' },
    { id: 'watermark', title: 'Add Watermark', desc: 'Stamp your PDFs', icon: <FaStamp />, color: 'from-fuchsia-400 to-purple-500', border: 'hover:border-fuchsia-300', text: 'text-fuchsia-500', shadow: 'hover:shadow-[0_15px_40px_rgba(232,121,249,0.3)]' },
    { id: 'rotatePdf', title: 'Rotate PDF', desc: 'Fix page orientation', icon: <FaSyncAlt />, color: 'from-sky-400 to-blue-500', border: 'hover:border-sky-300', text: 'text-sky-500', shadow: 'hover:shadow-[0_15px_40px_rgba(56,189,248,0.3)]' }
  ];

  const onDrop = (f) => setFiles([...files, ...f]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleAction = async () => {
    if (files.length === 0) return alert("Please select a file first.");
    setLoading(true);
    const formData = new FormData();
    const endpoint = activeTool.replace(/[A-Z]/g, l => `-${l.toLowerCase()}`);
    formData.append('file', files[0]);
    try {
      const res = await axios.post(`https://pdf-master-server.onrender.com/${endpoint}`, formData, { responseType: 'blob' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([res.data]));
      link.download = `PDFMaster_${activeTool}.pdf`;
      link.click();
      setFiles([]); setActiveTool(null);
    } catch (e) { alert("Server Error!"); }
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FFF4F9] text-gray-800 font-sans selection:bg-pink-300 relative">
      
      {/* NAVBAR WITH UPDATED MEGA MENU */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setActiveTool(null); setFiles([]);}}>
          <div className="bg-red-600 text-white p-1.5 rounded text-sm"><FaFilePdf size={16}/></div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">PDF Master</span>
        </div>
        
        <div className="flex items-center gap-8 relative" ref={menuRef}>
          <button className="hidden md:block text-sm font-semibold text-gray-600 hover:text-gray-900">Contact us</button>
          <button 
            onClick={() => setShowMegaMenu(!showMegaMenu)}
            className="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors"
          >
            All PDF tools <FaChevronDown size={10} className={`transition-transform ${showMegaMenu ? 'rotate-180' : ''}`}/>
          </button>

          {/* MEGA MENU PANEL (Image Style) */}
          {showMegaMenu && (
            <div className="absolute top-full right-0 mt-4 w-[90vw] max-w-5xl bg-white shadow-2xl rounded-xl border border-gray-100 p-8 animate-in fade-in zoom-in-95 duration-200 flex gap-10">
                <div className="grid grid-cols-4 gap-8 flex-grow">
                    {Object.keys(megaMenuTools).map(cat => (
                        <div key={cat}>
                            <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-6 border-b pb-2">{cat}</h4>
                            <ul className="space-y-4">
                                {megaMenuTools[cat].map(t => (
                                    <li key={t.id} onClick={() => {setActiveTool(t.id); setShowMegaMenu(false);}} className="flex items-center gap-3 text-[13px] font-bold text-gray-700 hover:text-blue-600 cursor-pointer group">
                                        <span className={`${t.color} group-hover:scale-110 transition-transform`}>{t.icon}</span>
                                        {t.title}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="border-l pl-10 w-48">
                    <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-6 border-b pb-2">E-Sign</h4>
                    <div className="flex items-center gap-3 text-[13px] font-bold text-gray-700 hover:text-blue-600 cursor-pointer">
                        <FaPenNib className="text-black" /> Sign PDF
                    </div>
                </div>
            </div>
          )}
        </div>
      </nav>

      {/* CANDY BACKGROUND (Unchanged) */}
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-gradient-to-br from-[#FFF4F9] via-[#F3F4FF] to-[#EFFFFD]">
        <div className="absolute top-[10%] left-[5%] text-pink-200/40 animate-bounce duration-[3000ms]"><FaFilePdf size={120}/></div>
        <div className="absolute bottom-[10%] left-[15%] text-emerald-200/40 animate-bounce duration-[5000ms]"><FaFileExcel size={80}/></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-pink-300/20 rounded-full blur-[120px]"></div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {!activeTool ? (
          <div className="animate-in fade-in duration-1000">
            <div className="max-w-4xl text-center mx-auto mb-10">
              <h1 className="text-5xl md:text-[4.5rem] font-black tracking-tighter mb-6 leading-[1.1] text-gray-900">All-in-One Online PDF Editor</h1>
              <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">Easily edit, convert and sign PDFs. Fast, simple and secure.</p>
            </div> 

            {/* MAIN DROPZONE (Same as Image 1) */}
            <div {...getRootProps()} className={`mb-20 border-[3px] border-dashed rounded-[30px] bg-white p-16 text-center transition-all cursor-pointer shadow-sm max-w-4xl mx-auto ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:shadow-md'}`}>
                <input {...getInputProps()} />
                <div className="w-16 h-16 mx-auto mb-4 text-gray-800">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 12 15 15"></polyline></svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Drop your file here</h3>
                <button className="bg-[#1877F2] text-white font-semibold py-4 px-12 rounded-lg shadow-md">Browse files</button>
            </div>

            {/* CANDY GRID TOOLS (Keeping Your Original Selection) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5 mb-24">
              {gridTools.map(t => (
                <div key={t.id} onClick={() => setActiveTool(t.id)} className={`group bg-white/70 backdrop-blur-xl border-2 border-white p-5 rounded-[30px] cursor-pointer transition-all duration-300 hover:-translate-y-2 ${t.border} ${t.shadow} flex flex-col justify-between min-h-[180px]`}>
                  <div className={`text-3xl mb-4 ${t.text} bg-white w-12 h-12 flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition-transform`}>{t.icon}</div>
                  <div>
                      <h3 className="text-lg font-black mb-1 text-gray-800 group-hover:text-pink-600">{t.title}</h3>
                      <p className="text-gray-500 text-[10px] font-bold">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ACTIVE TOOL PAGE (Keep Unchanged) */
          <div className="max-w-3xl mx-auto bg-white p-12 rounded-[40px] shadow-xl border border-gray-100 text-center animate-in zoom-in-95">
             <button onClick={() => setActiveTool(null)} className="mb-6 text-gray-400 hover:text-pink-500 flex items-center gap-2 mx-auto font-bold uppercase text-xs tracking-widest"><FaArrowLeft/> Back</button>
             <h2 className="text-3xl font-black mb-8">{activeTool.toUpperCase()}</h2>
             {files.length === 0 ? (
               <div {...getRootProps()} className="border-2 border-dashed border-gray-200 p-10 rounded-2xl cursor-pointer hover:bg-gray-50"><input {...getInputProps()}/><p className="font-bold text-gray-400">Select File</p></div>
             ) : (
               <div className="space-y-6">
                  <div className="bg-pink-50 p-4 rounded-full font-bold text-pink-600 truncate px-6">{files[0].name}</div>
                  <button onClick={handleAction} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-full font-bold text-lg shadow-lg">
                    {loading ? "Magic in progress..." : "Execute ✨"}
                  </button>
               </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;