import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    Container,
    Flex,
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
import { FiUploadCloud, FiCheckCircle, FiChevronRight, FiChevronLeft, FiDollarSign, FiAward, FiTrendingUp } from 'react-icons/fi';
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

    // Form Data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        session: '',
        curriculum: '',
        courseworkType: '',
        subject: '',
    });

    // File State
    const [courseworkFile, setCourseworkFile] = useState<File | null>(null);
    const [proofFile, setProofFile] = useState<File | null>(null);

    const courseworkRef = useRef<HTMLInputElement>(null);
    const proofRef = useRef<HTMLInputElement>(null);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

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
                if (!formData.fullName.trim()) {
                    toast({ title: "Name required", status: "warning" });
                    return false;
                }
                break;
            case 2: // Email
                if (!formData.email.trim() || !formData.email.includes('@')) {
                    toast({ title: "Valid email required", status: "warning" });
                    return false;
                }
                break;
            case 3: // Session
                if (!formData.session) {
                    toast({ title: "Session required", status: "warning" });
                    return false;
                }
                break;
            case 4: // Curriculum
                if (!formData.curriculum) {
                    toast({ title: "Curriculum required", status: "warning" });
                    return false;
                }
                break;
            case 5: // Type
                if (!formData.courseworkType) {
                    toast({ title: "Type required", status: "warning" });
                    return false;
                }
                break;
            case 6: // Subject (Conditional)
                if (shouldShowSubject() && !formData.subject.trim()) {
                    toast({ title: "Subject required", status: "warning" });
                    return false;
                }
                break;
            case 7: // Coursework File
                if (!courseworkFile) {
                    toast({ title: "File required", status: "warning" });
                    return false;
                }
                break;
            case 8: // Proof File
                if (!proofFile) {
                    toast({ title: "Proof required", status: "warning" });
                    return false;
                }
                break;
        }
        return true;
    };

    const shouldShowSubject = () => {
        return formData.curriculum === 'IB DP' && (formData.courseworkType === 'IA' || formData.courseworkType === 'EE');
    };

    // Skip logic for Subject step
    const getNextStep = () => {
        if (step === 5 && !shouldShowSubject()) {
            return 7; // Skip subject
        }
        return step + 1;
    };

    const getPrevStep = () => {
        if (step === 1) return 0;
        if (step === 7 && !shouldShowSubject()) {
            return 5; // Skip subject back
        }
        return step - 1;
    };

    const handleSubmit = async () => {
        if (!proofFile || !courseworkFile) return;

        setLoading(true);
        setUploadProgress(10);

        try {
            // 1. Upload Coursework
            const cwRef = ref(storage, `submissions/coursework/${Date.now()}_${courseworkFile.name}`);
            await uploadBytes(cwRef, courseworkFile);
            const cwUrl = await getDownloadURL(cwRef);
            setUploadProgress(50);

            // 2. Upload Proof
            const proofRefStorage = ref(storage, `submissions/proof/${Date.now()}_${proofFile.name}`);
            await uploadBytes(proofRefStorage, proofFile);
            const proofUrl = await getDownloadURL(proofRefStorage);
            setUploadProgress(90);

            // 3. Save Data
            await addDoc(collection(firestore, 'submissions'), {
                ...formData,
                courseworkUrl: cwUrl,
                proofUrl: proofUrl,
                status: 'pending',
                submittedAt: serverTimestamp(),
            });

            toast({
                title: "Submission Received!",
                description: "We will review your coursework and get back to you.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            router.push('/content-library');

        } catch (error: any) {
            console.error("Submission error", error);
            toast({
                title: "Error submitting",
                description: error.message,
                status: "error",
            });
        }
        setLoading(false);
    };

    // Render Steps
    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <VStack spacing={8} align="center" textAlign="center" py={2}>
                        <VStack spacing={3}>
                            <Box p={4} bg="blue.50" borderRadius="full">
                                <Icon as={FiDollarSign} boxSize={10} color="blue.600" />
                            </Box>
                            <Heading size="lg" bgGradient="linear(to-r, blue.600, blue.400)" bgClip="text">
                                Turn Your Top Grades Into Income
                            </Heading>
                            <Text fontSize="lg" color="gray.600" maxW="md">
                                Your high-scoring coursework served you well. Now, let it work for you. Turn your hard work into a recurring revenue stream.
                            </Text>
                        </VStack>

                        <VStack spacing={4} width="100%" align="stretch" px={2}>
                            <Flex align="center" gap={4} p={4} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.100">
                                <Box p={2} bg="white" borderRadius="lg" boxShadow="sm">
                                    <Icon as={FiUploadCloud} boxSize={5} color="blue.500" />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold" fontSize="md">Upload Your Best Work</Text>
                                    <Text fontSize="sm" color="gray.500">Share your high-scoring coursework.</Text>
                                </VStack>
                            </Flex>

                            <Flex align="center" gap={4} p={4} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.100">
                                <Box p={2} bg="white" borderRadius="lg" boxShadow="sm">
                                    <Icon as={FiAward} boxSize={5} color="purple.500" />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold" fontSize="md">Help Future Students</Text>
                                    <Text fontSize="sm" color="gray.500">Your expertise guides the next generation.</Text>
                                </VStack>
                            </Flex>

                            <Flex align="center" gap={4} p={4} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.100">
                                <Box p={2} bg="white" borderRadius="lg" boxShadow="sm">
                                    <Icon as={FiTrendingUp} boxSize={5} color="green.500" />
                                </Box>
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold" fontSize="md" color="green.800">Earn 60% Royalties</Text>
                                    <Text fontSize="sm" color="green.700">Get paid every time your work is purchased.</Text>
                                </VStack>
                            </Flex>
                        </VStack>
                    </VStack>
                );
            case 1:
                return (
                    <VStack spacing={4} align="stretch">
                        <Heading size="md">Step 1: What should we call you?</Heading>
                        <Text color="gray.600">Real names only please, so we can pay you!</Text>
                        <Input
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => handleChange('fullName', e.target.value)}
                            size="lg"
                            autoFocus
                        />
                    </VStack>
                );
            case 2:
                return (
                    <VStack spacing={4} align="stretch">
                        <Heading size="md">Step 2: Where should we send updates?</Heading>
                        <Text color="gray.600">No spam, promise! Just the important stuff.</Text>
                        <Input
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            size="lg"
                            autoFocus
                        />
                    </VStack>
                );
            case 3:
                return (
                    <VStack spacing={4} align="stretch">
                        <Heading size="md">Step 3: When did you finish this?</Heading>
                        <Text color="gray.600">Select the exam session when you completed this coursework.</Text>
                        <Select
                            placeholder="Select Session"
                            value={formData.session}
                            onChange={(e) => handleChange('session', e.target.value)}
                            size="lg"
                        >
                            <option value="May 2025">May 2025</option>
                            <option value="November 2025">November 2025</option>
                            <option value="May 2024">May 2024</option>
                            <option value="November 2024">November 2024</option>
                            <option value="May 2023">May 2023</option>
                            <option value="November 2023">November 2023</option>
                        </Select>
                    </VStack>
                );
            case 4:
                return (
                    <VStack spacing={4} align="stretch">
                        <Heading size="md">Step 4: Select Your Curriculum</Heading>
                        <Text color="gray.600">Are you in the Diploma Programme or Middle Years Programme?</Text>
                        <Flex gap={4}>
                            {['IB DP', 'IB MYP'].map(opt => (
                                <Button
                                    key={opt}
                                    flex={1}
                                    height="100px"
                                    colorScheme={formData.curriculum === opt ? 'blue' : 'gray'}
                                    variant={formData.curriculum === opt ? 'solid' : 'outline'}
                                    onClick={() => {
                                        handleChange('curriculum', opt);
                                        // Reset type if curriculum changes
                                        handleChange('courseworkType', '');
                                    }}
                                >
                                    {opt}
                                </Button>
                            ))}
                        </Flex>
                    </VStack>
                );
            case 5:
                return (
                    <VStack spacing={4} align="stretch">
                        <Heading size="md">Step 5: Coursework Category</Heading>
                        <Text color="gray.600">Please select the type of coursework you are uploading.</Text>
                        <VStack align="stretch" spacing={2}>
                            {formData.curriculum === 'IB DP' ? (
                                ['TOK', 'IA', 'EE'].map(opt => (
                                    <Button
                                        key={opt}
                                        justifyContent="flex-start"
                                        variant={formData.courseworkType === opt ? 'solid' : 'outline'}
                                        colorScheme={formData.courseworkType === opt ? 'blue' : 'gray'}
                                        onClick={() => handleChange('courseworkType', opt)}
                                    >
                                        {opt}
                                    </Button>
                                ))
                            ) : (
                                ['Personal Project', 'Portfolio - Design', 'Portfolio - Drama', 'Portfolio - Music', 'Portfolio - Visual Arts'].map(opt => (
                                    <Button
                                        key={opt}
                                        justifyContent="flex-start"
                                        variant={formData.courseworkType === opt ? 'solid' : 'outline'}
                                        colorScheme={formData.courseworkType === opt ? 'blue' : 'gray'}
                                        onClick={() => handleChange('courseworkType', opt)}
                                    >
                                        {opt}
                                    </Button>
                                ))
                            )}
                        </VStack>
                    </VStack>
                );
            case 6: // Subject - Only if DP IA/EE
                return (
                    <VStack spacing={4} align="stretch">
                        <Heading size="md">Step 6: Subject Name</Heading>
                        <Text color="gray.600">Enter the full name of the subject (e.g. Mathematics AA HL).</Text>
                        <Input
                            placeholder="e.g. Mathematics AA HL"
                            value={formData.subject}
                            onChange={(e) => handleChange('subject', e.target.value)}
                            size="lg"
                            autoFocus
                        />
                    </VStack>
                );
            case 7:
                return (
                    <VStack spacing={4} align="stretch">
                        <Heading size="md">Step 7: Upload Document</Heading>
                        <Text color="gray.600">Please upload the PDF file of your coursework. (Max 50MB)</Text>
                        <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            p={10}
                            border="2px dashed"
                            borderColor={courseworkFile ? "green.400" : "gray.300"}
                            borderRadius="xl"
                            cursor="pointer"
                            bg={courseworkFile ? "green.50" : "gray.50"}
                            onClick={() => courseworkRef.current?.click()}
                            _hover={{ bg: "gray.100" }}
                        >
                            <Icon as={courseworkFile ? FiCheckCircle : FiUploadCloud} boxSize={10} color={courseworkFile ? "green.500" : "gray.400"} mb={2} />
                            <Text fontWeight="600">{courseworkFile ? courseworkFile.name : "Click to Upload PDF"}</Text>
                            <Input
                                type="file"
                                hidden
                                ref={courseworkRef}
                                accept="application/pdf"
                                onChange={(e) => e.target.files?.[0] && setCourseworkFile(e.target.files[0])}
                            />
                        </Flex>
                    </VStack>
                );
            case 8:
                return (
                    <VStack spacing={4} align="stretch">
                        <Heading size="md">Step 8: Final Verification</Heading>
                        <Text color="gray.600">Upload a screenshot of your result or enrollment for our internal verification.</Text>
                        <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            p={10}
                            border="2px dashed"
                            borderColor={proofFile ? "green.400" : "gray.300"}
                            borderRadius="xl"
                            cursor="pointer"
                            bg={proofFile ? "green.50" : "gray.50"}
                            onClick={() => proofRef.current?.click()}
                            _hover={{ bg: "gray.100" }}
                        >
                            <Icon as={proofFile ? FiCheckCircle : FiUploadCloud} boxSize={10} color={proofFile ? "green.500" : "gray.400"} mb={2} />
                            <Text fontWeight="600">{proofFile ? proofFile.name : "Click to Upload Screenshot"}</Text>
                            <Input
                                type="file"
                                hidden
                                ref={proofRef}
                                accept="image/*,application/pdf"
                                onChange={(e) => e.target.files?.[0] && setProofFile(e.target.files[0])}
                            />
                        </Flex>
                        {loading && (
                            <Box pt={4}>
                                <Text mb={2} fontSize="sm" fontWeight="bold">Uploading...</Text>
                                <Progress value={uploadProgress} size="sm" colorScheme="blue" borderRadius="full" />
                            </Box>
                        )}
                    </VStack>
                );
            default:
                return null;
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
                        <Button
                            colorScheme="green"
                            size="lg"
                            onClick={handleSubmit}
                            isLoading={loading}
                            loadingText="Submitting..."
                            width="full"
                        >
                            Submit Coursework
                        </Button>
                    )}
                </Flex>
            </Box>
        </Container>
    );
};

export default EarnPage;
