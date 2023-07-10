import React from "react";
import ReactDOM from "react-dom/client";
import * as game from "./game";
import { ChakraProvider } from "@chakra-ui/react";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <game.Game />
    </ChakraProvider>
  </React.StrictMode>
);
