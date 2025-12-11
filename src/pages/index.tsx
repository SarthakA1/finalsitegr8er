
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

// Custom Blue Cursor SVG Data URI
const blueCursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><path d='M8.985,2.449c-0.655-1.464-2.715-1.464-3.37,0L0.266,14.28c-0.781,1.743,0.923,3.535,2.56,2.695 l2.883-1.481l1.579,7.668 c0.218,1.058,1.691,1.058,1.909,0l1.579-7.668l2.883,1.481c1.637,0.84,3.341-0.952,2.56-2.695L10.985,2.449z' fill='%23667eea' stroke='white' stroke-width='1.5' /></svg>") 16 0, auto`;
// Note: SVG cursors can be tricky. Using a simpler arrow shape for better compat.
// Actually, let's just use a standard style for the container that overrides cursor. 
// Standard CSS cursor with color isn't a thing, so SVG is the way.
// Let's use a simpler clean arrow.
const customCursorStyle = {
  cursor: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.77334 26.6508L4.35246 3.12053L25.9922 17.5855L14.71 18.2585L9.77334 26.6508Z' fill='%233182CE' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 2 2, auto`
};

const LandingPage: NextPage = () => {
  const router = useRouter();
  const setCurriculum = useSetRecoilState(curriculumState);

  const selectCurriculum = (id: 'ib-myp' | 'ib-dp') => {
    setCurriculum({ curriculumId: id });
    window.location.href = `/${id}`;
  };

  return (
    <Box
      minH="100vh"
      w="100%"
      bg="#fdfbf7" // Warmer paper color
      position="relative"
      overflow="hidden"
      sx={{
        backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        ...customCursorStyle // Apply custom cursor to the whole page
      }}
    >
      <Container maxW="container.xl" pt={{ base: 4, md: 8 }} pb={4} position="relative" zIndex={1} h="100vh" display="flex" flexDirection="column" justifyContent="center">

        {/* Hero Section */}
        <Flex direction="column" align="center" textAlign="center" mb={10}>
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
              lineHeight="1.2"
              mb={3}
            >
              Master the IB with GR8ER
            </Heading>
          </MotionBox>
          <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto" fontWeight="500" mt={2} lineHeight="tall">
            The all-in-one resource hub trusted by top achievers worldwide. <br />
            Select your programme to unlock your potential.
          </Text>
        </Flex>

        {/* Curriculum Cards */}
        <Flex
          justify="center"
          gap={{ base: 4, md: 8 }}
          wrap="wrap"
          mb={10}
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
            cursor="pointer" // Fallback
            sx={customCursorStyle} // Ensure cursor persists on hover
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              w={{ base: "280px", md: "300px" }}
              h={{ base: "300px", md: "320px" }}
              bg="white"
              borderRadius="xl"
              p={6}
              position="relative"
              border="2px solid"
              borderColor="gray.100"
              boxShadow="10px 10px 20px #d1d1d1, -10px -10px 20px #ffffff"
            >
              <Box bg="purple.50" p={2} borderRadius="full" mb={4}>
                <Icon as={RiBookMarkFill} w={8} h={8} color="purple.500" />
              </Box>
              <Heading size="md" color="gray.800" mb={1} fontWeight="800">IB MYP</Heading>
              <Text color="gray.400" fontSize="xs" textAlign="center" mb={3} fontWeight="700" letterSpacing="wide">
                GRADES 6-10
              </Text>
              <Text fontSize="sm" color="gray.500" mb={6} textAlign="center" lineHeight="shorter" px={2}>
                Comprehensive guides, community discussions, and resources tailored for success in the Middle Years.
              </Text>
              <Button
                size="md"
                rounded="full"
                colorScheme="purple"
                fontWeight="bold"
                px={8}
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
            cursor="pointer" // Fallback
            sx={customCursorStyle} // Ensure cursor persists on hover
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              w={{ base: "280px", md: "300px" }}
              h={{ base: "300px", md: "320px" }}
              bg="white"
              borderRadius="xl"
              p={6}
              position="relative"
              border="2px solid"
              borderColor="gray.100"
              boxShadow="10px 10px 20px #d1d1d1, -10px -10px 20px #ffffff"
            >
              <Box bg="blue.50" p={2} borderRadius="full" mb={4}>
                <Icon as={RiGlobalLine} w={8} h={8} color="blue.500" />
              </Box>
              <Heading size="md" color="gray.800" mb={1} fontWeight="800">IB DP</Heading>
              <Text color="gray.400" fontSize="xs" textAlign="center" mb={3} fontWeight="700" letterSpacing="wide">
                GRADES 11-12
              </Text>
              <Text fontSize="sm" color="gray.500" mb={6} textAlign="center" lineHeight="shorter" px={2}>
                Extensive past paper archives, detailed revision notes, and expert support for the Diploma Programme.
              </Text>
              <Button
                size="md"
                rounded="full"
                colorScheme="blue"
                fontWeight="bold"
                px={8}
                sx={customCursorStyle}
              >
                Access DP
              </Button>
            </Flex>
          </MotionBox>
        </Flex>

        {/* Trusted By Section */}
        <Stack spacing={3} align="center" mt={0}>
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
