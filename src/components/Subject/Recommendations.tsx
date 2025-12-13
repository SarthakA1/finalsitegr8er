import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
  Badge,
} from "@chakra-ui/react";
import {
  IoBook,
  IoGlobe,
  IoPeople,
  IoFlask,
  IoShapes,
  IoColorPalette,
  IoFitness,
  IoBulb,
  IoCodeSlash,
  IoMagnet,
  IoLeaf,
  IoRocket,
  IoMap,
  IoHourglass,
  IoCalculator,
  IoTrendingUp,
  IoGitNetwork,
  IoConstruct,
  IoCash,
  IoChatbubbles,
} from "react-icons/io5";
import { FaRunning, FaPaintBrush } from "react-icons/fa";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { RiGroup2Fill } from "react-icons/ri";
import { Subject } from "../../atoms/subjectsAtom";
import { firestore } from "../../firebase/clientApp";
import useSubjectData from "../../hooks/useSubjectData";
import { useRecoilValue } from 'recoil';
import { curriculumState } from '@/atoms/curriculumAtom';

const resolveMypIcon = (subjectId: string) => {
  const lower = subjectId.toLowerCase();

  // --- Mathematics (Differentiated) ---
  if (lower.includes("extended") && lower.includes("math")) {
    return { icon: IoTrendingUp, bgGradient: "linear(to-br, red.600, red.800)", color: "white" };
  }
  if (lower.includes("standard") && lower.includes("math")) {
    return { icon: IoCalculator, bgGradient: "linear(to-br, orange.500, red.500)", color: "white" };
  }
  if (lower.includes("math")) { // Fallback Math
    return { icon: IoShapes, bgGradient: "linear(to-br, red.500, pink.500)", color: "white" };
  }

  // --- Sciences (Differentiated) ---
  if (lower.includes("phys")) {
    return { icon: IoMagnet, bgGradient: "linear(to-br, purple.500, purple.700)", color: "white" };
  }
  if (lower.includes("chem")) {
    return { icon: IoFlask, bgGradient: "linear(to-br, green.400, teal.500)", color: "white" };
  }
  if (lower.includes("bio") || lower.includes("living")) {
    return { icon: IoLeaf, bgGradient: "linear(to-br, green.500, green.700)", color: "white" };
  }
  if (lower.includes("sci")) { // Fallback Science
    return { icon: IoFlask, bgGradient: "linear(to-br, teal.400, green.400)", color: "white" };
  }

  // --- Individuals & Societies (Differentiated) ---
  if (lower.includes("hist")) {
    return { icon: IoHourglass, bgGradient: "linear(to-br, yellow.600, orange.700)", color: "white" };
  }
  if (lower.includes("geo")) {
    return { icon: IoMap, bgGradient: "linear(to-br, green.300, blue.400)", color: "white" };
  }
  if (lower.includes("econ") || lower.includes("business")) {
    return { icon: IoCash, bgGradient: "linear(to-br, yellow.400, orange.400)", color: "white" };
  }
  if (lower.includes("indiv") || lower.includes("soc")) { // Fallback I&S
    return { icon: IoPeople, bgGradient: "linear(to-br, orange.400, pink.500)", color: "white" };
  }

  // --- Language ---
  if (lower.includes("english") || (lower.includes("lang") && lower.includes("lit"))) {
    // English / L&L
    return { icon: IoBook, bgGradient: "linear(to-br, blue.500, blue.700)", color: "white" };
  }
  if (lower.includes("acquistion") || lower.includes("french") || lower.includes("spanish") || lower.includes("german")) {
    // Foreign Language
    return { icon: IoChatbubbles, bgGradient: "linear(to-br, pink.400, purple.400)", color: "white" };
  }

  // --- Design ---
  if (lower.includes("design") || lower.includes("tech")) {
    return { icon: IoConstruct, bgGradient: "linear(to-br, gray.500, gray.700)", color: "white" };
  }

  // --- Arts ---
  if (lower.includes("music")) {
    return { icon: IoColorPalette, bgGradient: "linear(to-br, pink.500, purple.500)", color: "white" }; // Note: IoMusicalNotes would be better if imported
  }
  if (lower.includes("art") || lower.includes("drama") || lower.includes("film")) {
    return { icon: IoColorPalette, bgGradient: "linear(to-br, pink.400, pink.600)", color: "white" };
  }

  // --- PHE ---
  if (lower.includes("health") || lower.includes("sport") || lower.includes("phe")) {
    return { icon: IoFitness, bgGradient: "linear(to-br, cyan.500, blue.500)", color: "white" };
  }

  // --- Core / Other ---
  if (lower.includes("personal") || lower.includes("project")) {
    return { icon: IoRocket, bgGradient: "linear(to-br, purple.600, cyan.600)", color: "white" };
  }
  if (lower.includes("inter") || lower.includes("idu")) {
    return { icon: IoGitNetwork, bgGradient: "linear(to-br, indigo.500, purple.500)", color: "white" };
  }

  // Default Fallback
  return { icon: IoGlobe, bgGradient: "linear(to-br, gray.400, gray.600)", color: "white" };
};


const Recommendations: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const { subjectStateValue, onJoinOrLeaveSubject } = useSubjectData();
  const curriculum = useRecoilValue(curriculumState);

  const fetchSubjects = async (limitVal: number, isBackground: boolean = false) => {
    if (!isBackground) setLoading(true);
    try {
      let subjectQuery;
      if (curriculum.curriculumId === 'ib-dp') {
        // Explicitly fetch only IB DP subjects
        subjectQuery = query(
          collection(firestore, "subjects"),
          where("curriculumId", "==", "ib-dp"),
          limit(limitVal)
        );
      } else {
        // For MYP, fetch mostly everything
        subjectQuery = query(
          collection(firestore, "subjects"),
          limit(limitVal)
        );
      }

      const subjectDocs = await getDocs(subjectQuery);
      const subjects = subjectDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subject[];

      const filteredSubjects = subjects.filter(sub => {
        // DEFENSIVE: Remove any subject that might be the "Duplicate Content Library"
        if (sub.id.toLowerCase().includes('library') || (sub.subjectInfo && sub.subjectInfo.toLowerCase().includes('library'))) {
          return false;
        }

        if (curriculum.curriculumId === 'ib-dp') {
          return sub.curriculumId === 'ib-dp';
        } else {
          // MYP Mode: Show if MYP or undefined/null (legacy), but NEVER DP
          return sub.curriculumId !== 'ib-dp';
        }
      });

      // Sort client-side
      filteredSubjects.sort((a, b) => b.numberOfMembers - a.numberOfMembers);

      setSubjects(filteredSubjects);
    } catch (error) {
      console.log("getSubjectsRecommendations error", error);
    }
    if (!isBackground) setLoading(false);
  };

  const getSubjectRecommendations = async () => {
    // Stage 1: Load top 15 (Fast)
    await fetchSubjects(15, false);

    // Stage 2: Load more (Background)
    fetchSubjects(50, true);
  };

  useEffect(() => {
    getSubjectRecommendations();
  }, [curriculum.curriculumId]);

  return (
    <Flex
      direction="column"
      bg="rgba(255, 255, 255, 0.95)" // slightly less transparent for cleaner look
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.100"
      shadow="lg"
      overflow="hidden"
    >
      <Flex
        align="flex-end"
        color="white"
        p="6px 10px"
        height="70px"
        bgGradient="linear(to-r, brand.500, brand.600)"
        fontWeight={700}
        backgroundSize="cover"
      >
        {curriculum.curriculumId === 'ib-dp' ? 'IB DP Subjects' : 'IB MYP Subjects'}
      </Flex>

      <Flex direction="column">
        {loading ? (
          // ... skeletons ...
          <Stack mt={2} p={3}>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
          </Stack>
        ) : (
          <>
            {subjects.map((item, index) => {
              const isJoined = !!subjectStateValue.mySnippets.find(
                (snippet) => snippet.subjectId === item.id
              );

              // Resolve Custom Icon using smart keyword matching
              const customStyle = resolveMypIcon(item.id);

              return (
                <Flex
                  key={item.id}
                  onClick={() => {
                    window.location.href = `/subject/${item.id}`;
                  }}
                  position="relative"
                  align="center"
                  fontSize="10pt"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  p="12px 16px"
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  transition="all 0.2s"
                >
                  <Flex width="100%" align="center">
                    {/* Rank (Optional, keeping it clean) */}
                    <Flex width="30px" justify="center" mr={2}>
                      <Text fontWeight={600} color="gray.400" fontSize="xs">{index + 1}</Text>
                    </Flex>

                    <Flex align="center" flex={1}>
                      {customStyle ? (
                        <Flex
                          align="center"
                          justify="center"
                          boxSize="36px"
                          borderRadius="lg" // Squirel/Rounded square look
                          bgGradient={customStyle.bgGradient}
                          color={customStyle.color}
                          mr={3}
                          shadow="sm"
                        >
                          <Icon as={customStyle.icon} fontSize={20} />
                        </Flex>
                      ) : (
                        item.imageURL ? (
                          <Image
                            src={item.imageURL}
                            borderRadius="full"
                            boxSize="36px"
                            mr={3}
                            border="1px solid"
                            borderColor="gray.100"
                          />
                        ) : (
                          <Flex
                            align="center"
                            justify="center"
                            boxSize="36px"
                            borderRadius="lg"
                            bg="brand.100"
                            color="brand.500"
                            mr={3}
                          >
                            <Icon as={RiGroup2Fill} fontSize={20} />
                          </Flex>
                        )
                      )}

                      <Stack spacing={0}>
                        <Text
                          fontWeight={700}
                          color="gray.700"
                          fontSize="sm"
                          lineHeight="1.2"
                          noOfLines={1}
                        >
                          {item.id}
                        </Text>
                        <Text fontSize="10px" color="gray.500">
                          {item.numberOfMembers} {item.numberOfMembers === 1 ? 'member' : 'members'}
                        </Text>
                      </Stack>
                    </Flex>
                  </Flex>

                  <Box>
                    <Button
                      height="28px"
                      fontSize="xs"
                      variant={isJoined ? "outline" : "solid"}
                      colorScheme={isJoined ? "gray" : "brand"}
                      borderRadius="full"
                      px={4}
                      onClick={(e) => {
                        e.stopPropagation();
                        onJoinOrLeaveSubject(item, isJoined);
                      }}
                      _hover={{
                        transform: "translateY(-1px)",
                        shadow: "md"
                      }}
                    >
                      {isJoined ? "Joined" : "Join"}
                    </Button>
                  </Box>
                </Flex>
              );
            })}
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default Recommendations;
