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
                        import PDFCanvasViewer from './PDFCanvasViewer';

                        // ... (existing helper)

                        // Inside DocumentViewerModal ...

                        {/* Scrollable Inner Box */}
                        <Box w="100%" h="100%" overflowY="auto" onContextMenu={(e) => e.preventDefault()}>
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

                            {/* Viewer Content */}
                            <Box position="relative" w="100%" minH="100%">
                                <PDFCanvasViewer
                                    url={url}
                                    onLoadComplete={() => setIsFileLoaded(true)}
                                />

                                {/* Watermark Overlay - Fixed position relative to viewer content */}
                                {isFileLoaded && (
                                    <Flex
                                        position="absolute"
                                        top={0}
                                        left={0}
                                        w="100%"
                                        h="100%" // Matches content height
                                        zIndex={20}
                                        pointerEvents="none"
                                        wrap="wrap"
                                        justify="center"
                                        alignContent="flex-start"
                                        p={10}
                                        overflow="hidden"
                                    >
                                        {/* Repeat watermarks based on content? 
                                            Since we don't know height easily without callbacks, 
                                            we can just render a fixed pattern or sticky overlay.
                                            Actually, 'position: absolute' inside the scrollable relative Box 
                                            will stretch to the full scroll height of the PDF content.
                                        */}
                                        {watermarks.map((text, index) => (
                                            <Text
                                                key={index}
                                                color="gray.900"
                                                fontSize="5xl"
                                                fontWeight="bold"
                                                transform="rotate(-45deg)"
                                                whiteSpace="nowrap"
                                                opacity={0.15}
                                                m={20}
                                                textAlign="center"
                                            >
                                                {text}
                                            </Text>
                                        ))}
                                    </Flex>
                                )}

                                {/* Interaction Blocker - Transparent Overlay */}
                                <Box
                                    position="absolute"
                                    top="0"
                                    left="0"
                                    w="100%"
                                    h="100%"
                                    zIndex={25}
                                    bg="transparent"
                                    onContextMenu={(e) => e.preventDefault()}
                                />
                            </Box>
                        </Box>
                    </Box>

                </Box>


            </ModalBody>
        </ModalContent>
        </Modal >
    );
};

export default DocumentViewerModal;
