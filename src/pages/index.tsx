
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Stack,
  SimpleGrid,
  Container,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSetRecoilState } from 'recoil';
import { curriculumState } from '@/atoms/curriculumAtom';
import { RiBookMarkFill, RiGlobalLine } from 'react-icons/ri';
import React from 'react';

const MotionBox = motion(Box);

// Custom Blue Cursor style
const customCursorStyle = {
  cursor: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.77334 26.6508L4.35246 3.12053L25.9922 17.5855L14.71 18.2585L9.77334 26.6508Z' fill='%233182CE' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 2 2, auto`
};

const LandingPage: NextPage = () => {
  const router = useRouter();
  const setCurriculum = useSetRecoilState(curriculumState);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const selectCurriculum = (id: 'ib-myp' | 'ib-dp') => {
    setCurriculum({ curriculumId: id });
    window.location.href = `/${id}`;
  };

  return (
    <Box
      h="100vh" // Strict height
      w="100%"
      bg="#fdfbf7"
      position="relative"
      overflow="hidden" // No scroll
      sx={{
        backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        ...customCursorStyle
      }}
    >
      {/* Interactive Spotlight Background */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.4), transparent 40%)`,
        }}
        zIndex={0}
      />

      <Container maxW="container.xl" h="100%" position="relative" zIndex={1} display="flex" flexDirection="column" justifyContent="center" pt={0}>

        {/* Hero Section - Tightened */}
        <Flex direction="column" align="center" textAlign="center" mb={4}>
          <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Heading
              as="h1"
              size="2xl"
              fontWeight="900"
              color="gray.800"
              letterSpacing="tight"
              lineHeight="1.1"
              mb={2}
            >
              Master the IB with GR8ER
            </Heading>
          </MotionBox>
          <Text fontSize="md" color="gray.600" maxW="2xl" mx="auto" fontWeight="500" mt={1} lineHeight="short">
            The all-in-one resource hub trusted by top achievers worldwide.
            Select your programme to unlock your potential.
          </Text>
        </Flex>

        {/* Curriculum Cards - Adjusted gap/margins */}
        <Flex
          justify="center"
          gap={{ base: 4, md: 8 }}
          wrap="wrap"
          mb={6}
          alignItems="stretch"
        >
          {/* MYP Card */}
          <MotionBox
            whileHover={{ y: -5, boxShadow: "20px 20px 40px #c8c6c2, -20px -20px 40px #ffffff" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => selectCurriculum('ib-myp')}
            cursor="pointer"
            sx={customCursorStyle}
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              w={{ base: "260px", md: "280px" }}
              h={{ base: "280px", md: "300px" }}
              bg="white"
              borderRadius="xl"
              p={5}
              position="relative"
              border="2px solid"
              borderColor="gray.100"
              boxShadow="10px 10px 20px #d1d1d1, -10px -10px 20px #ffffff"
            >
              <Box bg="purple.50" p={2} borderRadius="full" mb={3}>
                <Icon as={RiBookMarkFill} w={6} h={6} color="purple.500" />
              </Box>
              <Heading size="md" color="gray.800" mb={1} fontWeight="800">IB MYP</Heading>
              <Text color="gray.400" fontSize="xs" textAlign="center" mb={2} fontWeight="700" letterSpacing="wide">
                GRADES 6-10
              </Text>
              <Text fontSize="xs" color="gray.500" mb={4} textAlign="center" lineHeight="shorter" px={2}>
                Comprehensive guides, community discussions, and resources tailored for success in the Middle Years.
              </Text>
              <Button
                size="sm"
                rounded="full"
                colorScheme="purple"
                fontWeight="bold"
                px={6}
                sx={customCursorStyle}
              >
                Access MYP
              </Button>
            </Flex>
          </MotionBox>

          {/* DP Card */}
          <MotionBox
            whileHover={{ y: -5, boxShadow: "20px 20px 40px #c8c6c2, -20px -20px 40px #ffffff" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => selectCurriculum('ib-dp')}
            cursor="pointer"
            sx={customCursorStyle}
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              w={{ base: "260px", md: "280px" }}
              h={{ base: "280px", md: "300px" }}
              bg="white"
              borderRadius="xl"
              p={5}
              position="relative"
              border="2px solid"
              borderColor="gray.100"
              boxShadow="10px 10px 20px #d1d1d1, -10px -10px 20px #ffffff"
            >
              <Box bg="blue.50" p={2} borderRadius="full" mb={3}>
                <Icon as={RiGlobalLine} w={6} h={6} color="blue.500" />
              </Box>
              <Heading size="md" color="gray.800" mb={1} fontWeight="800">IB DP</Heading>
              <Text color="gray.400" fontSize="xs" textAlign="center" mb={2} fontWeight="700" letterSpacing="wide">
                GRADES 11-12
              </Text>
              <Text fontSize="xs" color="gray.500" mb={4} textAlign="center" lineHeight="shorter" px={2}>
                Extensive past paper archives, detailed revision notes, and expert support for the Diploma Programme.
              </Text>
              <Button
                size="sm"
                rounded="full"
                colorScheme="blue"
                fontWeight="bold"
                px={6}
                sx={customCursorStyle}
              >
                Access DP
              </Button>
            </Flex>
          </MotionBox>
        </Flex>

        {/* Trusted By Section */}
        <Stack spacing={2} align="center" mt={0}>
          <Text
            color="gray.400"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="widest"
          >
            Trusted by top schools
          </Text>

          <SimpleGrid
            columns={{ base: 3, md: 5 }}
            spacing={{ base: 4, md: 8 }}
            alignItems="center"
            justifyItems="center"
            w="full"
            maxW="2xl"
          >
            <Text color="gray.400" fontWeight="bold" fontSize="sm">UWCPoints</Text>
            <Text color="gray.400" fontWeight="bold" fontSize="sm">Sevenoaks</Text>
            <Text color="gray.400" fontWeight="bold" fontSize="sm">KCS</Text>
            <Text color="gray.400" fontWeight="bold" fontSize="sm">Anglo</Text>
            <Text color="brand.500" fontWeight="900" fontSize="sm" letterSpacing="tighter">Pathways</Text>
          </SimpleGrid>
        </Stack>

      </Container>
    </Box>
  );
};

export default LandingPage;
