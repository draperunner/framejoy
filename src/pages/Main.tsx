import React, { useState, useCallback } from "react";
import {
  Box,
  Center,
  Container,
  Heading,
  Progress,
  Text,
  VStack,
  Wrap,
  Image,
  WrapItem,
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

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  if (framedFiles.length > 0) {
    return (
      <VStack spacing={8}>
        <Heading as="h1">FrameJoy</Heading>
        <Wrap>
          {framedFiles.map((url) => (
            <WrapItem>
              <Center w="180px" h="80px" bg="red.200">
                <Image src={url} alt="Framed image" />
              </Center>
            </WrapItem>
          ))}
        </Wrap>
      </VStack>
    );
  }

  return (
    <VStack spacing={8}>
      <Heading as="h1">FrameJoy</Heading>
      {progress > 0 ? (
        <Container>
          <Progress
            value={progress}
            hasStripe
            size="lg"
            isAnimated
            colorScheme="teal"
          />
        </Container>
      ) : (
        <Box
          {...getRootProps()}
          borderRadius="xl"
          borderStyle="dashed"
          borderColor="teal.100"
          borderWidth="thick"
        >
          <Center h="sm" w="lg">
            <input {...getInputProps()} />
            <Text>Drop the files here ...</Text>
          </Center>
        </Box>
      )}
    </VStack>
  );
};
