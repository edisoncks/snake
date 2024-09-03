import { Box, BoxProps, Text, TextProps } from "ink";
import React from "react";

type KeyHintsProps = {
  color?: TextProps["color"];
  showMoveKey: boolean;
  showSpeedKey: boolean;
  showNewGameKey: boolean;
} & BoxProps;

export const KeyHints = ({
  color,
  showMoveKey,
  showSpeedKey,
  showNewGameKey,
  ...props
}: KeyHintsProps): React.JSX.Element => {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      {showMoveKey && <Text color={color}>{`[←↑↓→]/[WASD] Move   `}</Text>}
      {showSpeedKey && <Text color={color}>{`[E] Change Speed   `}</Text>}
      {showNewGameKey && <Text color={color}>{`[N] New Game   `}</Text>}
      <Text color={color}>{`[Q] Quit`}</Text>
    </Box>
  );
};
