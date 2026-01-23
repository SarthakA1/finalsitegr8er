import React, { useEffect, useState, useRef } from 'react';
import { Box, Spinner, Text, Button, Flex, IconButton, HStack, Progress, Select } from '@chakra-ui/react';
import { ChevronRightIcon, ChevronLeftIcon, AddIcon, MinusIcon } from '@chakra-ui/icons';
import * as pdfjs from 'pdfjs-dist/build/pdf';

// Set worker source
if (typeof window !== "undefined" && 'workerSrc' in pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface PDFPaginatedViewerProps {
    url: string;
    onLoad?: () => void;
    onError?: (error: any) => void;
}

const PDFPaginatedViewer: React.FC<PDFPaginatedViewerProps> = ({ url, onLoad, onError }) => {
    const [pdf, setPdf] = useState<any>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [rendering, setRendering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Initial Load
    useEffect(() => {
        let isMounted = true;
        let loadingTask: any = null;

        const loadPdf = async () => {
            setLoading(true);
            setError(null);
            setDownloadProgress(0);

            try {
                loadingTask = pdfjs.getDocument(url);

                loadingTask.onProgress = (data: { loaded: number; total: number }) => {
                    if (isMounted && data.total > 0) {
                        const percent = (data.loaded / data.total) * 100;
                        setDownloadProgress(Math.round(percent));
                    }
                };

                const loadedPdf = await loadingTask.promise;
                if (isMounted) {
                    setPdf(loadedPdf);
                    setNumPages(loadedPdf.numPages);
                    setPageNumber(1);
                    setLoading(false);
                    if (onLoad) onLoad();
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
            setPdf(null);
            loadPdf();
        }

        return () => {
            isMounted = false;
            if (loadingTask) {
                loadingTask.destroy().catch(() => { });
            }
        };
    }, [url]);

    // Render Page
    useEffect(() => {
        const renderPage = async () => {
            if (!pdf || !canvasRef.current) return;

            setRendering(true);
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
                }
            } catch (err) {
                console.error("Error rendering page:", err);
            } finally {
                setRendering(false);
            }
        };

        renderPage();
    }, [pdf, pageNumber, scale]);

    // Navigation handlers
    const prevPage = () => setPageNumber(p => Math.max(1, p - 1));
    const nextPage = () => setPageNumber(p => Math.min(numPages, p + 1));
    const zoomIn = () => setScale(s => Math.min(3.0, s + 0.2));
    const zoomOut = () => setScale(s => Math.max(0.5, s - 0.2));

    return (
        <Flex direction="column" h="100%" bg="gray.100" overflow="hidden">
            {/* Toolbar */}
            <Flex
                bg="white"
                p={2}
                borderBottom="1px solid"
                borderColor="gray.200"
                align="center"
                justify="space-between"
                wrap="wrap"
                gap={2}
                boxShadow="sm"
                zIndex={10}
            >
                {/* Navigation */}
                <HStack spacing={2}>
                    <IconButton
                        aria-label="Previous Page"
                        icon={<ChevronLeftIcon />}
                        size="sm"
                        onClick={prevPage}
                        isDisabled={pageNumber <= 1 || loading}
                    />
                    <Text fontSize="sm" fontWeight="bold">
                        {pageNumber} / {numPages || '--'}
                    </Text>
                    <IconButton
                        aria-label="Next Page"
                        icon={<ChevronRightIcon />}
                        size="sm"
                        onClick={nextPage}
                        isDisabled={pageNumber >= numPages || loading}
                    />
                </HStack>

                {/* Zoom */}
                <HStack spacing={2}>
                    <IconButton
                        aria-label="Zoom Out"
                        icon={<MinusIcon />}
                        size="sm"
                        onClick={zoomOut}
                        isDisabled={loading}
                    />
                    <Text fontSize="sm" w="50px" textAlign="center">
                        {Math.round(scale * 100)}%
                    </Text>
                    <IconButton
                        aria-label="Zoom In"
                        icon={<AddIcon />}
                        size="sm"
                        onClick={zoomIn}
                        isDisabled={loading}
                    />
                </HStack>
            </Flex>

            {/* Viewer Area */}
            <Box
                flex="1"
                overflow="auto"
                position="relative"
                display="flex"
                justifyContent="center"
                p={4}
            >
                {loading ? (
                    <Box
                        flex="1"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Spinner size="xl" thickness="4px" color="blue.500" mb={4} />
                        <Box w="200px">
                            <Text mb={2} textAlign="center" fontSize="sm" color="gray.600">
                                {downloadProgress > 0 ? `Downloading... ${downloadProgress}%` : 'Initializing...'}
                            </Text>
                            <Progress value={downloadProgress} size="xs" colorScheme="blue" borderRadius="full" hasStripe isAnimated />
                        </Box>
                    </Box>
                ) : error ? (
                    <Flex align="center" justify="center" h="100%" color="red.500">
                        <Text>Error: {error}</Text>
                    </Flex>
                ) : (
                    <Box bg="white" boxShadow="lg" display="inline-block">
                        <canvas ref={canvasRef} />
                    </Box>
                )}
            </Box>
        </Flex>
    );
};

export default PDFPaginatedViewer;
