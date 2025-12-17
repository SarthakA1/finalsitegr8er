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
    const [step, setStep] = useState(1);
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
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="wider">STEP {step} OF 8</Text>
                    {step > 1 && (
                        <Button size="xs" variant="ghost" onClick={handleBack} leftIcon={<FiChevronLeft />}>
                            Back
                        </Button>
                    )}
                </Flex>

                <Progress value={(step / 8) * 100} size="xs" colorScheme="blue" borderRadius="full" mb={8} />

                <Box minH="300px">
                    <Fade in={true} key={step}>
                        {renderStepContent()}
                    </Fade>
                </Box>

                <Flex mt={8} justify="flex-end">
                    {step < 8 ? (
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
