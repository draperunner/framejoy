import * as React from "react";
import { ChakraProvider, Box, theme, Flex, Link, Fade } from "@chakra-ui/react";

import { UserProvider } from "./auth";
import { Main } from "./pages/Main";

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <UserProvider>
        <Main />
      </UserProvider>
    </ChakraProvider>
  );
};
