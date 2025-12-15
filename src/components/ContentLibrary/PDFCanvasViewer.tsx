import React, { useEffect, useState, useRef } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import * as pdfjs from 'pdfjs-dist/build/pdf';

// Set worker source
// Using unpkg to permit generic version matching or specific backup
if (typeof window !== "undefined" && 'workerSrc' in pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface PDFCanvasViewerProps {
    url: string;
    onLoad?: () => void;
    onError?: (error: any) => void;
}

const PDFCanvasViewer: React.FC<PDFCanvasViewerProps> = ({ url, onLoad, onError }) => {
    const [pdf, setPdf] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;
        const loadPdf = async () => {
            setLoading(true);
            setError(null);
            try {
                const loadingTask = pdfjs.getDocument(url);
                const loadedPdf = await loadingTask.promise;
                if (isMounted) {
                    setPdf(loadedPdf);
                    setLoading(false);
                    // Do NOT call onLoad here. Wait for first page.
                    if (loadedPdf.numPages === 0 && onLoad) onLoad(); // Edge case: empty PDF
                }
            } catch (err: any) {
                console.error("Error loading PDF:", err);
                if (isMounted) {
                    setError(err.message || "Failed to load PDF");
                    setLoading(false);
                    if (onError) onError(err);
                }
            }
        };

        if (url) {
            loadPdf();
        }

        return () => {
            isMounted = false;
        };
    }, [url]);

    // Render pages
    return (
        <Box
            w="100%"
            h="100%"
            overflowY="auto"
            bg="gray.100"
            p={4}
            ref={containerRef}
            css={{
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: '#CBD5E0',
                    borderRadius: '4px',
                },
            }}
        >
            {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" h="200px">
                    <Spinner size="xl" color="blue.500" />
                </Box>
            )}

            {error && (
                <Box display="flex" justifyContent="center" alignItems="center" h="200px">
                    <Text color="red.500">Error: {error}</Text>
                </Box>
            )}

            {pdf && (
                <VStack spacing={4} align="center">
                    {Array.from({ length: pdf.numPages }, (_, i) => i + 1).map((pageNum) => (
                        <PDFPage
                            key={pageNum}
                            pdf={pdf}
                            pageNumber={pageNum}
                            scale={1.5}
                            onRenderSuccess={pageNum === 1 ? onLoad : undefined}
                        />
                    ))}
                </VStack>
            )}
        </Box>
    );
};

interface PDFPageProps {
    pdf: any;
    pageNumber: number;
    scale: number;
    onRenderSuccess?: () => void;
}

const PDFPage: React.FC<PDFPageProps> = ({ pdf, pageNumber, scale, onRenderSuccess }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rendered, setRendered] = useState(false);

    useEffect(() => {
        const renderPage = async () => {
            if (!pdf || !canvasRef.current) return;

            try {
                const page = await pdf.getPage(pageNumber);
                const viewport = page.getViewport({ scale });
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
                    setRendered(true);
                    if (onRenderSuccess) onRenderSuccess();
                }
            } catch (err) {
                console.error(`Error rendering page ${pageNumber}`, err);
            }
        };

        renderPage();
    }, [pdf, pageNumber, scale]);
    // Remove onRenderSuccess from dependancy array to avoid loop if parent recreates it (though onLoad should be stable or ignored)
    // Actually safe to omit if we trust it's a stable function or want to ignore updates.

    return (
        <Box
            bg="white"
            boxShadow="md"
            borderRadius="sm"
            overflow="hidden"
            maxW="100%"
        >
            <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
            {!rendered && <Spinner size="sm" m={4} />}
        </Box>
    );
};

export default PDFCanvasViewer;
