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

const Recommendations: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const { subjectStateValue, onJoinOrLeaveSubject } = useSubjectData();
  const curriculum = useRecoilValue(curriculumState);

  const getSubjectRecommendations = async () => {
    setLoading(true);
    try {
      let subjectQuery;
      if (curriculum.curriculumId === 'ib-dp') {
        // Explicitly fetch only IB DP subjects
        subjectQuery = query(
          collection(firestore, "subjects"),
          where("curriculumId", "==", "ib-dp"),
          limit(20)
        );
      } else {
        // For MYP, fetch mostly everything
        subjectQuery = query(
          collection(firestore, "subjects"),
          limit(50)
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
    setLoading(false);
  };

  useEffect(() => {
    getSubjectRecommendations();
  }, [curriculum.curriculumId]);

  return (
    <Flex
      direction="column"
      bg="rgba(255, 255, 255, 0.8)"
      backdropFilter="blur(12px)"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.300"
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
                  borderColor="gray.200"
                  p="10px 12px"
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  transition="all 0.2s"
                >
                  <Flex width="80%" align="center">
                    <Flex width="15%">
                      <Text fontWeight={600} color="gray.500">{index + 1}</Text>
                    </Flex>
                    <Flex align="center" width="80%">
                      {item.imageURL ? (
                        <Image
                          src={item.imageURL}
                          borderRadius="full"
                          boxSize="28px"
                          mr={2}
                        />
                      ) : (
                        <Icon
                          as={RiGroup2Fill}
                          fontSize={30}
                          color="brand.500"
                          mr={2}
                        />
                      )}
                      <span
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: 600,
                          color: "#2D3748"
                        }}
                      >
                        {`${item.id}`}
                      </span>
                    </Flex>
                  </Flex>
                  <Box position="absolute" right="10px">
                    <Button
                      height="22px"
                      fontSize="8pt"
                      variant={isJoined ? "outline" : "solid"}
                      colorScheme={isJoined ? "gray" : "brand"}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click event from propagating
                        onJoinOrLeaveSubject(item, isJoined);
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
