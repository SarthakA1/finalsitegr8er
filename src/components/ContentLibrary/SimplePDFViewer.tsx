import React, { useState, useEffect, useCallback } from 'react';
import { Box, Spinner, Text, Button, Flex, Icon } from '@chakra-ui/react';
import { FiExternalLink, FiRefreshCw } from 'react-icons/fi';

interface SimplePDFViewerProps {
    url: string;
}

/**
 * SimplePDFViewer - A robust PDF viewer optimized for Chrome:
 * 1. First tries direct embed (works best for Firebase Storage URLs in Chrome)
 * 2. Falls back to Google Docs Viewer if direct embed fails
 * 3. Provides "Open in New Tab" as final fallback
 */
const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ url }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [viewerMode, setViewerMode] = useState<'direct' | 'google' | 'failed'>('direct');
    const [iframeKey, setIframeKey] = useState(0);

    // Google Docs Viewer URL
    const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

    // Timeout to detect if iframe isn't loading
    useEffect(() => {
        if (!loading) return;

        const timeout = setTimeout(() => {
            if (loading && viewerMode === 'direct') {
                // Direct embed might be stuck, try Google Docs
                console.log('Direct PDF embed timeout, trying Google Docs viewer');
                setViewerMode('google');
                setIframeKey(prev => prev + 1);
            } else if (loading && viewerMode === 'google') {
                // Google Docs also stuck, show error with fallback
                console.log('Google Docs viewer timeout');
                setError(true);
                setLoading(false);
            }
        }, 10000); // 10 second timeout

        return () => clearTimeout(timeout);
    }, [loading, viewerMode]);

    const handleLoad = useCallback(() => {
        setLoading(false);
        setError(false);
    }, []);

    const handleError = useCallback(() => {
        if (viewerMode === 'direct') {
            console.log('Direct embed failed, trying Google Docs');
            setViewerMode('google');
            setIframeKey(prev => prev + 1);
            setLoading(true);
        } else {
            setError(true);
            setLoading(false);
        }
    }, [viewerMode]);

    const handleRetry = () => {
        setError(false);
        setLoading(true);
        setViewerMode('direct');
        setIframeKey(prev => prev + 1);
    };

    const openInNewTab = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (error) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="100%"
                width="100%"
                color="white"
                p={8}
            >
                <Text fontSize="lg" fontWeight="bold">Unable to Display Document</Text>
                <Text fontSize="sm" color="gray.300" textAlign="center" mt={4}>
                    The document couldn't be loaded in the viewer.
                    <br />
                    Click below to view it in a new tab.
                </Text>
                <Box display="flex" mt={4}>
                    <Button
                        leftIcon={<Icon as={FiRefreshCw} />}
                        onClick={handleRetry}
                        colorScheme="blue"
                        size="sm"
                        mr={3}
                    >
                        Retry
                    </Button>
                    <Button
                        leftIcon={<Icon as={FiExternalLink} />}
                        onClick={openInNewTab}
                        colorScheme="green"
                        size="sm"
                    >
                        Open in New Tab
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box position="relative" height="100%" width="100%">
            {/* Loading Spinner */}
            {loading && (
                <Flex
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    align="center"
                    justify="center"
                    bg="gray.800"
                    zIndex={10}
                    direction="column"
                >
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                    <Text mt={4} color="white">Loading Document...</Text>
                    <Text mt={2} fontSize="sm" color="gray.400">
                        {viewerMode === 'direct' ? 'Using direct viewer...' : 'Using Google Docs viewer...'}
                    </Text>
                </Flex>
            )}

            {/* Direct PDF embed - works best in Chrome for most URLs */}
            {viewerMode === 'direct' && (
                <iframe
                    key={`direct-${iframeKey}`}
                    src={url}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: '#1a202c'
                    }}
                    onLoad={handleLoad}
                    onError={handleError}
                    title="PDF Document Viewer"
                    allow="autoplay"
                />
            )}

            {/* Google Docs Viewer fallback */}
            {viewerMode === 'google' && (
                <iframe
                    key={`google-${iframeKey}`}
                    src={googleDocsUrl}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: '#1a202c'
                    }}
                    onLoad={handleLoad}
                    onError={handleError}
                    title="PDF Document Viewer (Google Docs)"
                    referrerPolicy="no-referrer"
                />
            )}

            {/* Open in New Tab button - always visible */}
            <Button
                position="absolute"
                bottom={4}
                right={4}
                leftIcon={<Icon as={FiExternalLink} />}
                onClick={openInNewTab}
                size="sm"
                colorScheme="whiteAlpha"
                bg="blackAlpha.700"
                _hover={{ bg: "blackAlpha.800" }}
                zIndex={20}
            >
                Open in New Tab
            </Button>
        </Box>
    );
};

export default SimplePDFViewer;
