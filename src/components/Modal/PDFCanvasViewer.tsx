import React, { useEffect, useRef, useState } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
// We import specifically to ensure we don't break optimization, 
// but for pdfjs-dist in Next.js we often need to set workerSrc manually.
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source to a stable CDN version matching the likely installed version or a compatible one.
// Since package.json said ^5.4.449, we try to use that or a standard recent one.
// However, using the local file might be safer if configured, but CDN is robust for quick fixes.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type PDFCanvasViewerProps = {
    url: string;
    onLoadComplete: () => void;
};

const PDFCanvasViewer: React.FC<PDFCanvasViewerProps> = ({ url, onLoadComplete }) => {
    const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [pages, setPages] = useState<number[]>([]);
    const [error, setError] = useState<string>("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadPDF = async () => {
            try {
                // Use a generic loading task
                const loadingTask = pdfjsLib.getDocument(url);
                const loadedPdf = await loadingTask.promise;
                setPdf(loadedPdf);

                // Create an array of page numbers [1, 2, ..., numPages]
                const pageNumbers = Array.from({ length: loadedPdf.numPages }, (_, i) => i + 1);
                setPages(pageNumbers);

                onLoadComplete();
            } catch (err: any) {
                console.error("Error loading PDF:", err);
                setError("Failed to load document. It might be restricted or invalid.");
                onLoadComplete(); // Stop spinner even on error
            }
        };

        if (url) {
            loadPDF();
        }
    }, [url]);

    return (
        <VStack spacing={4} w="100%" align="center" bg="gray.100" minH="100%">
            {error && <Text color="red.500">{error}</Text>}

            {pdf && pages.map((pageNum) => (
                <PDFPageCanvas key={pageNum} pdf={pdf} pageNum={pageNum} />
            ))}
        </VStack>
    );
};

const PDFPageCanvas: React.FC<{ pdf: pdfjsLib.PDFDocumentProxy; pageNum: number }> = ({ pdf, pageNum }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        const renderPage = async () => {
            if (!canvasRef.current || isRendered) return;

            try {
                const page = await pdf.getPage(pageNum);

                // Determine scale based on window width usually, but here we can pick a standard quality scale
                // 1.5 is usually good for screen readability
                // We could also dynamically calculate based on container width
                const viewport = page.getViewport({ scale: 1.5 });

                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                if (context) {
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };

                    await page.render(renderContext).promise;
                    setIsRendered(true);
                }
            } catch (err) {
                console.error(`Error rendering page ${pageNum}:`, err);
            }
        };

        renderPage();
    }, [pdf, pageNum]);

    return (
        <Box boxShadow="md" bg="white">
            <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
        </Box>
    );
};

export default PDFCanvasViewer;
