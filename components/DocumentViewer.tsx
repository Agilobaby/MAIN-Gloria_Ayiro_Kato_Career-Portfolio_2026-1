
import React, { useEffect, useState, useRef } from 'react';
import { X, Loader2, ShieldCheck, EyeOff, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle, Maximize, ArrowLeft, ArrowRight, ExternalLink, PlayCircle } from 'lucide-react';
import { ProjectDocument } from '../types';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: ProjectDocument | null;
  allDocuments?: ProjectDocument[];
  onSelect?: (doc: ProjectDocument) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ isOpen, onClose, document, allDocuments, onSelect }) => {
  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');
  
  // PDF State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Video State
  const [videoError, setVideoError] = useState(false);

  // Navigation State
  const currentIndex = (allDocuments && document) 
    ? allDocuments.findIndex(d => d.id === document.id) 
    : -1;

  useEffect(() => {
    if (isOpen && document) {
      setLoading(true);
      setRenderError('');
      setVideoError(false);
      setPageNum(1);
      
      const handleBlobCreation = async () => {
        try {
          if (document.content.startsWith('data:')) {
            const mimeMatch = document.content.match(/^data:(.*?);base64,/);
            let mimeType = mimeMatch ? mimeMatch[1] : '';

            if (!mimeType) {
                if (document.type === 'pdf') mimeType = 'application/pdf';
                else if (document.type === 'video') mimeType = 'video/mp4'; 
                else if (document.type === 'image') mimeType = 'image/png';
            }

            setFileType(mimeType);

            const res = await fetch(document.content);
            const blob = await res.blob();
            const typedBlob = new Blob([blob], { type: mimeType });
            const url = URL.createObjectURL(typedBlob);
            
            setBlobUrl(url);

            if (document.type === 'pdf') {
              // @ts-ignore
              if (window.pdfjsLib) {
                 // @ts-ignore
                 const loadingTask = window.pdfjsLib.getDocument(url);
                 loadingTask.promise.then((pdf: any) => {
                   setPdfDoc(pdf);
                   
                   pdf.getPage(1).then((page: any) => {
                      const viewport = page.getViewport({ scale: 1 });
                      const availableHeight = window.innerHeight - 150; 
                      const availableWidth = Math.min(window.innerWidth - 40, 1200);
                      
                      const scaleH = availableHeight / viewport.height;
                      const scaleW = availableWidth / viewport.width;
                      
                      const fitScale = Math.min(scaleH, scaleW) || 1.0;
                      setScale(Math.min(fitScale, 1.5));
                      setLoading(false);
                   });
                 }).catch((err: any) => {
                   console.error("PDF Load Error", err);
                   setRenderError("Could not render this PDF securely. It may be corrupted or password protected.");
                   setLoading(false);
                 });
              } else {
                setRenderError("PDF Viewer Library not loaded. Please refresh.");
                setLoading(false);
              }
            } else {
              setTimeout(() => setLoading(false), 500);
            }

          } else {
            setBlobUrl(document.content);
            setLoading(false);
          }
        } catch (e) {
          console.error("Error creating blob:", e);
          setRenderError("Failed to load content.");
          setBlobUrl(document.content);
          setLoading(false);
        }
      };

      handleBlobCreation();
    }

    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
      setBlobUrl(null);
      setPdfDoc(null);
      setFileType('');
    };
  }, [isOpen, document]);

  // Render PDF Page
  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      pdfDoc.getPage(pageNum).then((page: any) => {
        const viewport = page.getViewport({ scale: scale });
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d');
        
        if (context) {
          const outputScale = window.devicePixelRatio || 1;
          
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          
          canvas.style.width = Math.floor(viewport.width) + "px";
          canvas.style.height = Math.floor(viewport.height) + "px";

          const transform = outputScale !== 1 
            ? [outputScale, 0, 0, outputScale, 0, 0] 
            : null;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            transform: transform
          };
          page.render(renderContext);
        }
      });
    }
  }, [pdfDoc, pageNum, scale]);

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  const renderContent = () => {
    if (renderError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-500">
           <EyeOff size={48} className="mb-4" />
           <p>{renderError}</p>
        </div>
      );
    }

    if (document?.type === 'image') {
      return (
        <div className="flex items-center justify-center w-full h-full bg-black/80 p-4 overflow-hidden" ref={containerRef}>
          <img 
            src={blobUrl || document.content} 
            alt="Protected Content" 
            className="shadow-2xl select-none"
            onContextMenu={(e) => e.preventDefault()}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain',
              imageRendering: 'auto' 
            }}
          />
        </div>
      );
    }

    if (document?.type === 'video') {
       if (document.content.startsWith('http') && (document.content.includes('youtube') || document.content.includes('vimeo'))) {
          return (
            <iframe
              src={getEmbedUrl(document.content)}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          );
       } else {
          return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-black relative">
              {videoError && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 text-center p-4">
                    <AlertCircle className="text-red-500 mb-2" size={32} />
                    <p className="text-white font-bold">Playback Error</p>
                    <p className="text-gray-400 text-xs mt-1 max-w-xs">
                      The browser cannot play this video format ({fileType || 'Unknown'}). 
                    </p>
                 </div>
              )}
              <video 
                key={blobUrl} 
                controls 
                controlsList="nodownload" 
                playsInline
                disablePictureInPicture
                className="w-full h-full max-h-full object-contain focus:outline-none"
                onContextMenu={(e) => e.preventDefault()}
                onError={() => setVideoError(true)}
              >
                <source src={blobUrl || ""} type={fileType} />
                <source src={blobUrl || ""} type="video/mp4" />
                <source src={blobUrl || ""} type="video/webm" />
                <source src={blobUrl || ""} type="video/quicktime" />
                <p className="text-white p-4">Your browser does not support HTML5 video.</p>
              </video>
            </div>
          );
       }
    }

    if (document?.type === 'pdf') {
      return (
         <div className="w-full h-full bg-[#2a2a2a] flex flex-col items-center overflow-auto pt-4 pb-24 relative" ref={containerRef}>
            
            {/* NEW: Interactive Media Alert */}
            <div className="sticky top-0 z-50 mb-4 px-4 w-full flex justify-center pointer-events-none mt-2">
              <div className="bg-blue-600/90 backdrop-blur-md text-white px-5 py-3 rounded-full shadow-xl border border-blue-400/30 flex items-center gap-4 pointer-events-auto animate-in slide-in-from-top-2">
                 <div className="flex items-center gap-2">
                   <PlayCircle size={18} className="text-blue-200 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Video/Audio in Document?</span>
                 </div>
                 <div className="h-3 w-[1px] bg-white/20"></div>
                 <button 
                   onClick={() => window.open(blobUrl || document.content, '_blank')}
                   className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider hover:text-blue-200 transition-colors underline decoration-blue-400/50 underline-offset-4"
                 >
                   Open in New Tab to Play <ExternalLink size={12} />
                 </button>
              </div>
            </div>

            <div className="shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-800 bg-white">
               <canvas ref={canvasRef} onContextMenu={(e) => e.preventDefault()} className="block" />
            </div>

            {/* PDF Controls */}
            {pdfDoc && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#1a1a1a]/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl z-[60] border border-gray-700">
                 <button 
                   onClick={() => setPageNum(prev => Math.max(prev - 1, 1))}
                   disabled={pageNum <= 1}
                   className="hover:text-primary disabled:opacity-30 transition-colors"
                   title="Previous Page"
                 >
                   <ChevronLeft size={20} />
                 </button>
                 <span className="text-xs font-bold font-mono w-20 text-center select-none text-primary">
                   {pageNum} / {pdfDoc.numPages}
                 </span>
                 <button 
                   onClick={() => setPageNum(prev => Math.min(prev + 1, pdfDoc.numPages))}
                   disabled={pageNum >= pdfDoc.numPages}
                   className="hover:text-primary disabled:opacity-30 transition-colors"
                   title="Next Page"
                 >
                   <ChevronRight size={20} />
                 </button>
                 
                 <div className="w-[1px] h-4 bg-gray-600 mx-2"></div>
                 
                 <button onClick={() => setScale(s => Math.max(s - 0.1, 0.4))} className="hover:text-primary transition-colors" title="Zoom Out">
                    <ZoomOut size={16} />
                 </button>
                 <button 
                   onClick={() => {
                      if (pdfDoc && containerRef.current) {
                        pdfDoc.getPage(pageNum).then((page: any) => {
                           const vp = page.getViewport({ scale: 1 });
                           const width = containerRef.current!.clientWidth - 40;
                           setScale(width / vp.width);
                        });
                      }
                   }} 
                   className="hover:text-primary transition-colors" 
                   title="Fit to Width"
                 >
                    <Maximize size={14} />
                 </button>
                 <button onClick={() => setScale(s => Math.min(s + 0.1, 3.0))} className="hover:text-primary transition-colors" title="Zoom In">
                    <ZoomIn size={16} />
                 </button>
              </div>
            )}
         </div>
      );
    }

    if (document?.type === 'doc') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#111]">
           <div className="w-24 h-24 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6">
             <EyeOff size={48} />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">Protected Document</h3>
           <p className="text-gray-400 max-w-md mb-8 text-sm leading-relaxed">
             Word documents cannot be displayed securely. Please convert to <strong>PDF</strong>.
           </p>
        </div>
      );
    }

    return <div className="text-white text-center p-10">Unsupported Format</div>;
  };

  if (!isOpen || !document) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
      onContextMenu={(e) => e.preventDefault()}
    >
      
      {/* GLOBAL NAVIGATION ARROWS */}
      {allDocuments && allDocuments.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button 
              onClick={(e) => {
                 e.stopPropagation();
                 if(onSelect && allDocuments) onSelect(allDocuments[currentIndex - 1]);
              }}
              className="fixed top-1/2 left-4 md:left-8 z-[210] -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-primary hover:text-black text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all shadow-lg border border-white/10"
              title="Previous File"
            >
              <ArrowLeft size={24} />
            </button>
          )}

          {currentIndex < allDocuments.length - 1 && (
            <button 
              onClick={(e) => {
                 e.stopPropagation();
                 if(onSelect && allDocuments) onSelect(allDocuments[currentIndex + 1]);
              }}
              className="fixed top-1/2 right-4 md:right-8 z-[210] -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-primary hover:text-black text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all shadow-lg border border-white/10"
              title="Next File"
            >
              <ArrowRight size={24} />
            </button>
          )}
        </>
      )}
      
      {/* HEADER BAR */}
      <div className="absolute top-0 left-0 w-full bg-[#0a0a0a] border-b border-gray-800 p-4 flex items-center justify-between z-[210] shadow-lg">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-primary">
             <ShieldCheck size={18} />
             <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Read-Only View</span>
           </div>
           <div className="h-4 w-[1px] bg-gray-800 hidden md:block"></div>
           <div className="flex items-center gap-3">
             <h3 className="text-white font-bold text-sm truncate max-w-[150px] md:max-w-md">{document.name}</h3>
             {allDocuments && allDocuments.length > 1 && (
               <span className="text-[9px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-mono">
                 {currentIndex + 1} / {allDocuments.length}
               </span>
             )}
           </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-gray-800 hover:bg-red-500 text-white rounded-sm flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="w-full h-full pt-[60px] pb-4 px-4 md:px-8 flex flex-col items-center justify-center">
        <div className="relative w-full h-full max-w-7xl mx-auto bg-[#151515] border border-gray-800 rounded-sm shadow-2xl overflow-hidden flex flex-col">
           {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500">
                <Loader2 size={48} className="animate-spin text-primary" />
                <p className="text-xs font-black uppercase tracking-widest">Decrypting Secure Content...</p>
             </div>
           ) : (
             <div className="flex-1 relative bg-[#050505] flex flex-col w-full h-full overflow-hidden">
                {renderContent()}
             </div>
           )}
        </div>
      </div>

    </div>
  );
};

export default DocumentViewer;
