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

                            {/* Watermark Overlay - Only show after file loads */}
                            {isFileLoaded && (
                                <Flex
                                    position="absolute"
                                    top={0}
                                    left={0}
                                    w="100%"
                                    h="15000px" // Huge height for scrolling
                                    zIndex={20} // Ensure visible above other layers
                                    pointerEvents="none" // Pass through clicks
                                    wrap="wrap"
                                    justify="space-between"  // Push to sides
                                    alignContent="flex-start" // Start from top
                                    p={10} // Padding from edge
                                    overflow="hidden"
                                    opacity={0.25} // Increased visibility
                                >
                                    {watermarks.map((text, index) => (
                                        <Text
                                            key={index}
                                            color="gray.900"
                                            fontSize="5xl" // Larger text
                                            fontWeight="bold"
                                            transform="rotate(-45deg)"
                                            whiteSpace="nowrap"
                                            opacity={0.5}
                                            m={20} // More spacing
                                            width="100%" // Force wrap
                                            textAlign="center"
                                        >
                                            {text}
                                        </Text>
                                    ))}
                                </Flex>
                            )}

                            {/* Interaction Blocker - Transparent Overlay to catch all clicks */}
                            <Box
                                position="absolute"
                                top="0"
                                left="0"
                                w="100%"
                                h="15000px" // Covers full height
                                zIndex={15} // Above iframe / Below watermark
                                bg="transparent"
                                onContextMenu={(e) => e.preventDefault()}
                            />

                            {/* Header Bar inside container */}
                            <Flex
                                position="sticky" // Sticky header so it stays while scrolling
                                top="0" // Reset to 0 relative to scroll parent
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

                            <Box w="100%" h="15000px" overflow="hidden">
                                <iframe
                                    src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        marginTop: '-100px', // Aggressively shift up to hide Google Docs toolbar/pop-out
                                        border: 'none',
                                        pointerEvents: 'none' // BLOCK INTERACTION
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
