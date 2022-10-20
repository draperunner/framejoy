import React, { useState, useCallback } from "react";
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
  useToast,
  Button,
  ChakraProvider,
  theme,
  Link,
} from "@chakra-ui/react";
import { FileRejection, useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";

import { getApp } from "firebase/app";
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";
import { UserProvider } from "./auth";

const imageCaptureAvailable = "ImageCapture" in window;

const functions = getFunctions(getApp(), "europe-west1");

if (window.location.hostname === "localhost") {
  console.log("Using functions emulator");
  connectFunctionsEmulator(functions, "localhost", 5001);
}

const frameImage = httpsCallable<{ data: string }, string[]>(
  functions,
  "frameImage",
  {}
);

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

function fileToBase64(file: File | Blob): Promise<string> {
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

const Main = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [framedImages, setFramedImages] = useState<string[]>([]);
  const [takingPhoto, setTakingPhoto] = useState<boolean>(false);

  const toast = useToast();

  const errorToast = useCallback(
    (message: string) =>
      toast({
        position: "bottom",
        title: message,
        status: "error",
        duration: 7000,
        isClosable: true,
      }),
    [toast]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setSubmitted(true);

      try {
        const fileData = await fileToBase64(file);
        const result = await frameImage({
          data: fileData,
        });

        setFramedImages(result.data);
      } catch (error) {
        errorToast("Something went wrong.");
      }
    },
    [errorToast]
  );

  const onDropRejected = useCallback(
    async (fileRejections: FileRejection[]) => {
      fileRejections
        .flatMap((r) => r.errors)
        .map((error) => error.code)
        .filter((code, i, arr) => arr.indexOf(code) === i)
        .forEach((code) => {
          switch (code) {
            case "file-too-large": {
              return errorToast(
                "The file is too large. Please use an image less than 3 MB in size."
              );
            }
            case "file-invalid-type": {
              return errorToast(
                "Invalid file type. Supported types are JPEG, PNG and WEBP."
              );
            }
            case "too-many-files": {
              return errorToast(
                "Too many files provided. Only one is supported."
              );
            }
            default:
              errorToast("Something went wrong.");
          }
        });
    },
    [errorToast]
  );

  const takePhoto = useCallback(async () => {
    if (!imageCaptureAvailable) {
      return;
    }

    setSubmitted(true);
    setTakingPhoto(true);

    let mediaStream;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      const track = mediaStream.getVideoTracks()[0];

      // @ts-ignore
      const imageCapture = new window.ImageCapture(track);
      const blob: Blob = await imageCapture.takePhoto();
      setTakingPhoto(false);

      const fileData = await fileToBase64(blob);
      const result = await frameImage({
        data: fileData,
      });

      setFramedImages(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setTakingPhoto(false);
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    }
  }, []);

  const shareOrDownload = useCallback(async (imageData: string) => {
    const blob = await fetch(imageData).then((res) => res.blob());
    const fileName = "framed-image.jpg";

    const shareData: ShareData = {
      files: [new File([blob], fileName)],
    };

    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      saveAs(blob, fileName);
    }
  }, []);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".png", ".webp"],
    },
    onDrop,
    onDropRejected,
    maxSize: 3 * 10e5, // 3 MB,
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    disabled: submitted,
  });

  return (
    <Box
      textAlign="center"
      fontSize="xl"
      paddingTop={8}
      paddingBottom={8}
      {...getRootProps()}
      backgroundColor={isDragActive ? "blue.50" : "transparent"}
      minHeight="100vh"
      cursor="default"
    >
      <VStack spacing={8}>
        <ScaleFade in={framedImages.length > 0} unmountOnExit>
          <Heading as="h1" marginBottom="2rem">
            Enjoy! 💁‍♂️
          </Heading>
          <SimpleGrid columns={[1, null, 2, 3]} templateRows="masonry">
            {distribute(framedImages, 3).map((group, i) => (
              <Box key={i}>
                {group.map((imageData) => (
                  <Container key={imageData} marginBottom="2rem">
                    <Image
                      src={imageData}
                      alt="Framed image"
                      borderRadius="md"
                      cursor="pointer"
                      border="0.25rem solid transparent"
                      _hover={{ borderColor: "blue.500" }}
                      onClick={() => shareOrDownload(imageData)}
                    />
                  </Container>
                ))}
              </Box>
            ))}
          </SimpleGrid>
          <Button
            margin="1rem"
            onClick={() => {
              setSubmitted(false);
              setFramedImages([]);
            }}
          >
            Try a new image
          </Button>
        </ScaleFade>
        <ScaleFade in={!framedImages.length && submitted} unmountOnExit>
          <Heading as="h1" marginBottom="2rem">
            {takingPhoto ? "Say cheese! 🧀" : "Cutting and glueing ... ✂️"}
          </Heading>
          <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing="1rem">
            <Container minWidth="sm">
              <Skeleton height="245px" />
            </Container>
            <Container minWidth="sm">
              <Skeleton height="460px" />
            </Container>
            <Container minWidth="sm">
              <Skeleton height="245px" />
            </Container>
          </SimpleGrid>
        </ScaleFade>
        <ScaleFade in={!framedImages.length && !submitted} unmountOnExit>
          <Box padding={16}>
            <Container>
              <Heading as="h1" marginBottom="2rem">
                Framejoy
              </Heading>
              <input {...getInputProps()} />
              <Image
                src="/front-image.webp"
                alt="Your image plus a frame equals awesome combo!"
              />
              {imageCaptureAvailable ? (
                <Text textAlign="center" color="blue.600" marginTop={8}>
                  Drop an image anywhere, <Button onClick={open}>browse</Button>{" "}
                  or <Button onClick={takePhoto}>take a photo</Button>
                </Text>
              ) : (
                <Text textAlign="center" color="blue.600" marginTop={8}>
                  Drop an image anywhere or{" "}
                  <Button onClick={open}>browse</Button>
                </Text>
              )}

              <Box marginTop={4}>
                <Text textAlign="center" fontSize="small">
                  Your uploaded image is not stored anywhere. Neither are the
                  generated images, unless you share them!
                </Text>
              </Box>
            </Container>
          </Box>
        </ScaleFade>
      </VStack>
      <Box position="absolute" as="footer" bottom="1" left="0" right="0">
        <Text textAlign="center" fontSize="small">
          The code's on{" "}
          <Link
            href="https://github.com/draperunner/framejoy"
            color="blue.600"
            isExternal
          >
            GitHub! ⭐️
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <UserProvider>
        <Main />
      </UserProvider>
    </ChakraProvider>
  );
};
