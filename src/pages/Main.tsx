import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  ScaleFade,
  SimpleGrid,
  Skeleton,
  Grid,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";

import firebase from "firebase/app";
import "firebase/storage";
import "firebase/functions";

const functions = firebase.app().functions("europe-west1");

if (window.location.hostname === "localhost") {
  console.log("Using emulator");
  functions.useEmulator("localhost", 5001);
}

const frameImage = functions.httpsCallable("frameImage", {});

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

function fileToBase64(file: File): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onabort = () => reject("Aborted");
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export const Main: React.FC = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [framedFiles, setFramedFiles] = useState<string[]>([]);

  const [selectedImage, setSelectedImage] = useState<string>("");
  const { hasCopied, onCopy } = useClipboard(selectedImage);
  const toast = useToast();

  useEffect(() => {
    if (selectedImage) {
      onCopy();
    }
  }, [selectedImage, onCopy]);

  useEffect(() => {
    if (hasCopied) {
      toast({
        position: "bottom",
        title: "Image URL copied!",
        status: "success",
        duration: 1000,
      });
    }
  }, [toast, hasCopied]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setSubmitted(true);

    const fileData = await fileToBase64(file);
    const result = await frameImage({
      data: fileData,
    });

    setFramedFiles(result.data);
  }, []);

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
                  <Image
                    src={url}
                    alt="Framed image"
                    borderRadius="md"
                    cursor="pointer"
                    border="0.25rem solid transparent"
                    _hover={{ borderColor: "blue.500" }}
                    onClick={() => setSelectedImage(url)}
                  />
                </Container>
              ))}
            </Box>
          ))}
        </Grid>
      </ScaleFade>
      <ScaleFade in={!framedFiles.length && submitted} unmountOnExit>
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
      <ScaleFade in={!framedFiles.length && !submitted} unmountOnExit>
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
          padding="4rem"
        >
          <input {...getInputProps()} />
          <Image
            src="/front-image.webp"
            alt="Your image plus a frame equals awesome combo!"
          />
          <Text textAlign="center" color="blue.600">
            Drop an image or click here to see it framed!
          </Text>
        </Box>
        <Box marginTop="4rem">
          <Text textAlign="center" fontSize="small">
            Generated images are stored for one day. Your uploaded image is not
            stored at all.
          </Text>
        </Box>
      </ScaleFade>
    </VStack>
  );
};
