import React, { useState, useCallback } from "react";
import {
  Box,
  Center,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  ScaleFade,
  SimpleGrid,
  Skeleton,
  Grid,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { v4 as uuid } from "uuid";

import firebase from "firebase/app";
import "firebase/storage";
import "firebase/functions";

import { useUser } from "../auth";

const functions = firebase.functions();

if (window.location.hostname === "localhost") {
  console.log("Using emulator");
  functions.useEmulator("localhost", 5001);
}

const frameImage = functions.httpsCallable("frameImage");

function distribute<T>(array: T[], desiredArrayCount: number): T[][] {
  const distribution: T[][] = new Array(desiredArrayCount)
    .fill([])
    .map(() => []);
  array.forEach((item, index) => {
    const i = index % desiredArrayCount;
    distribution[i].push(item);
  });

  return distribution;
}

export const Main: React.FC = () => {
  const user = useUser();
  const [progress, setProgress] = useState<number>(0);
  const [framedFiles, setFramedFiles] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const storageRef = firebase.storage().ref();
      const uploadTask = storageRef
        .child(
          `content/${user?.uid}/${file.name.replace(
            /.*(\..+$)/,
            `${uuid()}$1`
          )}`
        )
        .put(file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setProgress(progress);
        },
        (error) => {
          console.error(error);
        },
        () => {
          const { bucket, name, fullPath } = uploadTask.snapshot.ref;

          frameImage({ bucket, name, fullPath }).then((result) =>
            setFramedFiles(result.data)
          );
        }
      );
    },
    [user]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "image/jpeg, image/png, image/webp",
    onDrop,
  });

  return (
    <VStack spacing={8}>
      <ScaleFade in={framedFiles.length > 0} unmountOnExit>
        <Heading as="h1" marginBottom="2rem">
          Enjoy! 💁‍♂️
        </Heading>
        <Grid templateColumns="repeat(3, 1fr)" templateRows="masonry">
          {distribute(framedFiles, 3).map((group, i) => (
            <Box key={i}>
              {group.map((url) => (
                <Container width="400px" key={url} marginBottom="2rem">
                  <Image src={url} alt="Framed image" borderRadius="md" />
                </Container>
              ))}
            </Box>
          ))}
        </Grid>
      </ScaleFade>
      <ScaleFade in={!framedFiles.length && progress > 0} unmountOnExit>
        <Heading as="h1" marginBottom="2rem">
          Cutting and glueing ... ✂️
        </Heading>
        <SimpleGrid columns={3}>
          <Container minWidth="400px">
            <Skeleton height="245px" />
          </Container>
          <Container minWidth="400px">
            <Skeleton height="460px" />
          </Container>
          <Container minWidth="400px">
            <Skeleton height="245px" />
          </Container>
        </SimpleGrid>
      </ScaleFade>
      <ScaleFade in={!framedFiles.length && progress === 0} unmountOnExit>
        <Heading as="h1" marginBottom="2rem">
          Framejoy
        </Heading>
        <Box
          {...getRootProps()}
          borderRadius="xl"
          borderStyle="dashed"
          backgroundColor={isDragActive ? "blue.50" : "transparent"}
          borderColor="blue.500"
          borderWidth="thick"
        >
          <Center h="sm" w="lg">
            <input {...getInputProps()} />
            <Text color="blue.600">Drop your image here!</Text>
          </Center>
        </Box>
      </ScaleFade>
    </VStack>
  );
};