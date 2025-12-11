
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
  Image,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSetRecoilState } from 'recoil';
import { curriculumState } from '@/atoms/curriculumAtom';
import { RiBookMarkFill, RiGlobalLine } from 'react-icons/ri';

const MotionBox = motion(Box);
const MotionText = motion(Text);

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
        backgroundSize: '20px 20px', // Dot grid pattern
      }}
    >
      {/* Decorative Doodles (Absolute Positioned) */}
      <Box position="absolute" top="10%" left="5%" opacity={0.6} transform="rotate(-15deg)" display={{ base: 'none', md: 'block' }}>
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 10 Q 50 10 90 50 T 90 90" stroke="#FF6B6B" strokeWidth="3" fill="none" opacity="0.5" strokeDasharray="5,5" />
        </svg>
      </Box>
      <Box position="absolute" bottom="20%" right="10%" opacity={0.6} transform="rotate(15deg)" display={{ base: 'none', md: 'block' }}>
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="#4FD1C5" strokeWidth="2" strokeDasharray="10 5" />
        </svg>
      </Box>

      <Container maxW="container.xl" pt={{ base: 4, md: 8 }} pb={4} position="relative" zIndex={1} h="100vh" display="flex" flexDirection="column" justifyContent="center">
        {/* Load Google Font for Annotations */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
        `}} />

        {/* Hero Section - Super Compact */}
        <Flex direction="column" align="center" textAlign="center" mb={6}>
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            position="relative"
          >
            {/* Replaced yellow box shape with purely text-based highlight if desired, or just clean text */}
            <Heading
              as="h1"
              size="2xl"
              fontWeight="900"
              color="gray.800"
              letterSpacing="tight"
              lineHeight="1.2"
              mb={1}
            >
              Master the IB with GR8ER
            </Heading>
            {/* Text Annotation instead of shape */}
            <Box position="absolute" top="-20px" right="-40px" transform="rotate(15deg)">
              <Text fontFamily="'Caveat', cursive" color="red.400" fontSize="2xl" fontWeight="700">Premium!</Text>
            </Box>
          </MotionBox>
          <Text fontSize="md" color="gray.500" maxW="lg" mx="auto" fontWeight="500" mt={2}>
            The premium resource hub. <span style={{ color: '#805AD5', fontWeight: 'bold' }}>Choose your path:</span>
          </Text>
        </Flex>

        {/* Curriculum Cards - Very Compact */}
        <Flex
          justify="center"
          gap={{ base: 4, md: 8 }}
          wrap="wrap"
          mb={8}
          alignItems="stretch"
        >
          {/* Annotation Text Only - No drawn arrow shape, just text pointing */}
          <Box position="absolute" top="20%" left={{ base: '0%', md: '25%' }} transform="rotate(-10deg)" display={{ base: 'none', md: 'block' }} zIndex={2}>
            <Text fontFamily="'Caveat', cursive" color="gray.500" fontSize="2xl" fontWeight="700">Start your journey &rarr;</Text>
          </Box>


          {/* MYP Card */}
          <MotionBox
            whileHover={{ y: -5, boxShadow: "20px 20px 40px #c8c6c2, -20px -20px 40px #ffffff" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => selectCurriculum('ib-myp')}
            cursor="pointer"
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              w={{ base: "280px", md: "280px" }}
              h={{ base: "260px", md: "280px" }}
              bg="white"
              borderRadius="xl"
              p={4}
              position="relative"
              border="2px solid"
              borderColor="gray.100"
              boxShadow="10px 10px 20px #d1d1d1, -10px -10px 20px #ffffff"
            >
              <Box bg="purple.50" p={2} borderRadius="full" mb={2}>
                <Icon as={RiBookMarkFill} w={6} h={6} color="purple.500" />
              </Box>
              <Heading size="md" color="gray.800" mb={0} fontWeight="800">IB MYP</Heading>
              <Text color="gray.400" fontSize="xs" textAlign="center" mb={2} fontWeight="700" letterSpacing="wide">
                GRADES 6-10
              </Text>
              <Text fontSize="xs" color="gray.500" mb={4} textAlign="center" lineHeight="shorter">
                Resources & guides for the Middle Years.
              </Text>
              <Button
                size="sm"
                rounded="full"
                colorScheme="purple"
                fontWeight="bold"
                px={6}
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
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              w={{ base: "280px", md: "280px" }}
              h={{ base: "260px", md: "280px" }}
              bg="white"
              borderRadius="xl"
              p={4}
              position="relative"
              border="2px solid"
              borderColor="gray.100"
              boxShadow="10px 10px 20px #d1d1d1, -10px -10px 20px #ffffff"
            >
              <Box bg="blue.50" p={2} borderRadius="full" mb={2}>
                <Icon as={RiGlobalLine} w={6} h={6} color="blue.500" />
              </Box>
              <Heading size="md" color="gray.800" mb={0} fontWeight="800">IB DP</Heading>
              <Text color="gray.400" fontSize="xs" textAlign="center" mb={2} fontWeight="700" letterSpacing="wide">
                GRADES 11-12
              </Text>
              <Text fontSize="xs" color="gray.500" mb={4} textAlign="center" lineHeight="shorter">
                Past papers & help for Diploma.
              </Text>
              <Button
                size="sm"
                rounded="full"
                colorScheme="blue"
                fontWeight="bold"
                px={6}
              >
                Access DP
              </Button>
            </Flex>
          </MotionBox>
        </Flex>

        {/* Trusted By Section - Tucked in close */}
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
