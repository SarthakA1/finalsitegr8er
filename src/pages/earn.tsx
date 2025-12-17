import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    Container,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Select,
    Text,
    VStack,
    Icon,
    useToast,
    Progress,
    Fade,
    Alert,
    AlertIcon
} from '@chakra-ui/react';
import { FiUploadCloud, FiCheckCircle, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import Head from 'next/head';
import { storage, firestore } from '@/firebase/clientApp';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';

const EarnPage: React.FC = () => {
    const router = useRouter();
    const toast = useToast();
    const [step, setStep] = useState(0); // Start at 0 for Info Page
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // ... (rest of state)

    // ... (handleChange)

    const handleNext = () => {
        if (!validateStep()) return;
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        const prev = getPrevStep();
        setStep(prev);
    };

    const validateStep = () => {
        if (step === 0) return true; // Info page always valid
        switch (step) {
            case 1: // Name
            // ... (rest of validation)
            case 8: // Proof File
                if (!proofFile) {
                    toast({ title: "Proof required", status: "warning" });
                    return false;
                }
                break;
        }
        return true;
    };

    // ... (shouldShowSubject, getNextStep, getPrevStep are fine)

    // Update getPrevStep to handle step 1 -> 0
    const getPrevStep = () => {
        if (step === 1) return 0;
        if (step === 7 && !shouldShowSubject()) {
            return 5; // Skip subject back
        }
        return step - 1;
    };

    // ... (handleSubmit)

    // Render Steps
    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <VStack spacing={6} align="center" textAlign="center" py={4}>
                        <Icon as={FiUploadCloud} boxSize={16} color="blue.500" />
                        <Heading size="lg">Earn Passive Income 💸</Heading>
                        <Text fontSize="lg" color="gray.600">
                            Upload your high-scoring coursework and earn money every time someone purchases it on <Text as="span" fontWeight="bold" color="blue.600">www.gr8er.live</Text>!
                        </Text>
                        <Text fontSize="md" color="gray.500">
                            Earn passive income as a former IB Student; earnings depend on coursework quality and demand.
                        </Text>
                        <Alert status="success" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" p={4} borderRadius="md" bg="green.50">
                            <AlertIcon boxSize="40px" mr={0} />
                            <Box mt={2} mb={1} fontSize="lg" fontWeight="bold" color="green.800">
                                You receive 60% of the sale price.
                            </Box>
                        </Alert>
                    </VStack>
                );
            case 1:
            // ... (rest of cases)
            case 8:
            // ...
        }
    };

    // Main Layout
    return (
        <Container maxW="container.sm" py={10} minH="100vh" display="flex" flexDirection="column" justifyContent="center">
            <Head>
                <title>Earn Passive Income | GR8ER IB</title>
            </Head>

            <Box bg="white" p={8} borderRadius="2xl" boxShadow="xl" border="1px solid" borderColor="gray.100">
                <Flex mb={8} justify="space-between" align="center">
                    {step > 0 ? (
                        <>
                            <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="wider">STEP {step} OF 8</Text>
                            <Button size="xs" variant="ghost" onClick={handleBack} leftIcon={<FiChevronLeft />}>
                                Back
                            </Button>
                        </>
                    ) : (
                        <Box /> // Spacer
                    )}
                </Flex>

                {step > 0 && (
                    <Progress value={(step / 8) * 100} size="xs" colorScheme="blue" borderRadius="full" mb={8} />
                )}

                <Box minH="300px">
                    <Fade in={true} key={step}>
                        {renderStepContent()}
                    </Fade>
                </Box>

                <Flex mt={8} justify="flex-end">
                    {step === 0 ? (
                        <Button
                            colorScheme="blue"
                            size="lg"
                            rightIcon={<FiChevronRight />}
                            onClick={() => setStep(1)}
                            width="full"
                        >
                            Get Started
                        </Button>
                    ) : step < 8 ? (
                        <Button
                            colorScheme="blackAlpha"
                            bg="black"
                            color="white"
                            size="lg"
                            rightIcon={<FiChevronRight />}
                            onClick={() => {
                                const nextInfo = getNextStep();
                                if (validateStep()) {
                                    setStep(nextInfo);
                                }
                            }}
                            px={8}
                        >
                            Next
                        </Button>
                    ) : (
    // ... (submit button)
                    )}
                </Flex>
            </Box>
        </Container>
    );
};

export default EarnPage;
