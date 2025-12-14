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
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { RiGroup2Fill } from "react-icons/ri";
import { Subject } from "../../atoms/subjectsAtom";
import { firestore } from "../../firebase/clientApp";
import useSubjectData from "../../hooks/useSubjectData";
import { useRecoilValue } from 'recoil';
import { curriculumState } from '@/atoms/curriculumAtom';

import { resolveMypIcon } from "../../utils/subjectIcons";


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
                          {curriculum.curriculumId === 'ib-dp' ? (item.subjectInfo || item.id) : item.id}
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
