import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Box, Flex, Text, Spinner } from '@chakra-ui/react';

type DocumentViewerModalProps = {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title?: string;
    userEmail?: string;
};

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, url, title, userEmail }) => {
    const [isFileLoaded, setIsFileLoaded] = React.useState(false);

    // Reset state when url changes or modal opens
    React.useEffect(() => {
        if (isOpen) setIsFileLoaded(false);
    }, [isOpen, url]);

    // Create watermark pattern
    // User requested to show UserID. The prop 'userEmail' currently carries email OR uid.
    // We will trust the prop content.
    const watermarkText = userEmail || "";
    // Increase count to cover the tall 15000px scrollable area
    const watermarks = Array(4).fill(watermarkText);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
            <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
            <ModalContent bg="transparent" boxShadow="none">
                {/* Anti-Print Style */}
                <style>
                    {`
                        @media print {
                            body { display: none !important; }
                        }
                    `}
                </style>

                <ModalCloseButton
                    position="fixed"
                    top="20px"
                    right="20px"
                    zIndex={999}
                    bg="whiteAlpha.200"
                    color="white"
                    borderRadius="full"
                    _hover={{ bg: "whiteAlpha.400" }}
                />
                <ModalBody
                    p={0}
                    h="100vh"
                    w="100vw"
                    overflow="hidden"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    onContextMenu={(e) => e.preventDefault()} // Disable Right Click
                    userSelect="none" // Disable Text Selection
                >


                    {/* Document Container - Scrollable Parent, Static Iframe */}
                    <Box
                        w={{ base: "100%", md: "80%" }}
                        h={{ base: "100%", md: "90%" }}
                        bg="gray.100"
                        borderRadius={{ base: 0, md: "xl" }}
                        overflow="hidden" // Keep outer hidden, inner scrollable
                        position="relative"
                        boxShadow="2xl"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                    >
                        {/* Wrapper for relative positioning */}
                        <Box w="100%" h="100%" position="relative" onContextMenu={(e) => e.preventDefault()}>
                            {/* Loading Spinner */}
                            {!isFileLoaded && (
                                <Flex
                                    position="absolute"
                                    top={0}
                                    left={0}
                                    w="100%"
                                    h="100%"
                                    justify="center"
                                    align="center"
                                    zIndex={30}
                                    bg="gray.100"
                                >
                                    <Spinner size="xl" color="blue.500" thickness="4px" />
                                </Flex>
                            )}

                            {/* Watermark Overlay - Only show after file loads */}
                            {isFileLoaded && (
                                <Flex
                                    position="absolute"
                                    top={0}
                                    left={0}
                                    w="100%"
                                    h="100%"
                                    zIndex={20}
                                    pointerEvents="none"
                                    justify="space-between" // Push to sides
                                    align="stretch"
                                    p={4}
                                    overflow="hidden"
                                    opacity={0.3} // Slightly clearer
                                >
                                    {/* Left Column */}
                                    <Flex direction="column" justify="space-around" h="100%">
                                        {watermarks.map((text, index) => (
                                            <Text
                                                key={`left-${index}`}
                                                color="gray.900"
                                                fontSize="3xl"
                                                fontWeight="bold"
                                                transform="rotate(-45deg)"
                                                whiteSpace="nowrap"
                                                opacity={0.5}
                                            >
                                                {text}
                                            </Text>
                                        ))}
                                    </Flex>

                                    {/* Right Column */}
                                    <Flex direction="column" justify="space-around" h="100%">
                                        {watermarks.map((text, index) => (
                                            <Text
                                                key={`right-${index}`}
                                                color="gray.900"
                                                fontSize="3xl"
                                                fontWeight="bold"
                                                transform="rotate(-45deg)"
                                                whiteSpace="nowrap"
                                                opacity={0.5}
                                            >
                                                {text}
                                            </Text>
                                        ))}
                                    </Flex>
                                </Flex>
                            )}

                            {/* Click Shield - Removed/Disabled to allow scrolling */}
                            {/* We prioritize Viewability (scrolling) over blocking double-clicks for now */}

                            {/* Header Bar inside container */}
                            <Flex
                                position="absolute"
                                top="0"
                                left="0"
                                right="0"
                                height="50px"
                                bg="white"
                                borderBottom="1px solid"
                                borderColor="gray.200"
                                zIndex={20}
                                align="center"
                                px={4}
                                justify="center"
                            >
                                <Text fontWeight="600" fontSize="sm" color="gray.700" isTruncated maxW="90%">
                                    {title || 'Document Viewer'}
                                </Text>
                            </Flex>

                            <Box w="100%" h="100%" pt="50px" overflow="hidden">
                                <iframe
                                    src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                                    style={{
                                        width: '100%',
                                        height: 'calc(100% + 110px)', // Maintain crop
                                        marginTop: '-100px', // Maintain crop
                                        border: 'none',
                                        // pointerEvents: 'none' <--- REMOVED to allow scrolling
                                    }}
                                    title="Document Preview"
                                    onLoad={() => setIsFileLoaded(true)}
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            </Box>
                        </Box>

                    </Box>


                </ModalBody>
            </ModalContent>
        </Modal >
    );
};

export default DocumentViewerModal;
