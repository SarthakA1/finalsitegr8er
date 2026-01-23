import React, { useEffect, useState, useRef } from 'react';
import { Box, Spinner, Text, VStack, Progress } from '@chakra-ui/react';
import * as pdfjs from 'pdfjs-dist/build/pdf';

// Set worker source
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
    const [progress, setProgress] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Virtualization State
    const [visiblePages, setVisiblePages] = useState(10); // Start with 10 pages

    useEffect(() => {
        let isMounted = true;
        let loadingTask: any = null;

        const loadPdf = async () => {
            setLoading(true);
            setError(null);
            setProgress(0);

            try {
                loadingTask = pdfjs.getDocument(url);

                loadingTask.onProgress = (data: { loaded: number; total: number }) => {
                    if (isMounted && data.total > 0) {
                        const percent = (data.loaded / data.total) * 100;
                        setProgress(Math.round(percent));
                    }
                };

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
            // cleanup previous
            setPdf(null);
            setVisiblePages(10);
            loadPdf();
        }

        return () => {
            isMounted = false;
            if (loadingTask) {
                loadingTask.destroy().catch(() => { });
            }
        };
    }, [url]);

    // Handle Infinite Scroll for Pages
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // If scrolled near bottom (within 1000px)
        if (scrollHeight - scrollTop - clientHeight < 1000) {
            if (pdf && visiblePages < pdf.numPages) {
                // Load next batch
                setVisiblePages(prev => Math.min(prev + 10, pdf.numPages));
            }
        }
    };

    // Render pages
    return (
        <Box
            w="100%"
            h="100%"
            overflowY="auto"
            bg="gray.100"
            p={4}
            ref={containerRef}
            onScroll={handleScroll}
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
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" h="100%" gap={4}>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                    <Box w="200px">
                        <Text mb={2} textAlign="center" fontSize="sm" color="gray.600">
                            Downloading Document... {progress}%
                        </Text>
                        <Progress value={progress} size="sm" colorScheme="blue" borderRadius="full" hasStripe isAnimated />
                    </Box>
                </Box>
            )}

            {error && (
                <Box display="flex" justifyContent="center" alignItems="center" h="200px">
                    <Text color="red.500">Error: {error}</Text>
                </Box>
            )}

            {pdf && (
                <VStack spacing={4} align="center">
                    {Array.from({ length: Math.min(visiblePages, pdf.numPages) }, (_, i) => i + 1).map((pageNum) => (
                        <PDFPage
                            key={`${url}-page-${pageNum}`}
                            pdf={pdf}
                            pageNumber={pageNum}
                            scale={1.5}
                            onRenderSuccess={pageNum === 1 ? onLoad : undefined}
                        />
                    ))}
                    {/* Loader at bottom if more pages exist */}
                    {visiblePages < pdf.numPages && (
                        <Box py={4}>
                            <Spinner size="md" color="gray.400" />
                        </Box>
                    )}
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
    const containerRef = useRef<HTMLDivElement>(null);
    const [rendered, setRendered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Use Intersection Observer to only render when in view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '500px 0px', // Load 500px before
                threshold: 0.01
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        const renderPage = async () => {
            // Only render if visible AND container/canvas exist
            if (!isVisible || !pdf || !canvasRef.current) return;
            // Also check if already rendered to avoid double render
            if (rendered) return;

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
    }, [pdf, pageNumber, scale, isVisible, rendered]); // Dependencies

    return (
        <Box
            ref={containerRef}
            bg="white"
            boxShadow="md"
            borderRadius="sm"
            overflow="hidden"
            maxW="100%"
            minH={rendered ? "auto" : "800px"} // Placeholder height to ensure scroll works/observer triggers. Assuming ~A4 ratio
            position="relative"
            width={rendered ? "fit-content" : "100%"} // Expand to fill width while loading
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: rendered ? 'block' : 'none' }} />
            {!rendered && (
                <Box position="absolute" top="0" left="0" w="100%" h="100%" display="flex" justifyContent="center" alignItems="center">
                    <Spinner size="sm" color="gray.400" />
                    <Text ml={2} fontSize="xs" color="gray.400">Page {pageNumber}</Text>
                </Box>
            )}
        </Box>
    );
};

export default PDFCanvasViewer;
