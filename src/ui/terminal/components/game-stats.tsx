import { Box, BoxProps, Text, TextProps } from "ink";
import { Speed } from "../../../core/types/speed.js";
import React from "react";

type GameStatsProps = {
  color?: TextProps["color"];
  speed: Speed;
  score: number;
} & BoxProps;

export const GameStats = ({
  color,
  speed,
  score,
  ...props
}: GameStatsProps): React.JSX.Element => {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      <Text>{`Speed: `}</Text>
      <Text color={color}>{`${speed}   `}</Text>
      <Text>{`Score: `}</Text>
      <Text color={color}>{`${score}`}</Text>
    </Box>
  );
};
