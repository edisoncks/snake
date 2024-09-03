import { Box, BoxProps } from "ink";
import React from "react";
import { CellsColumn } from "./cells-column.js";

type GameBoardProps = {
  cells: string[][];
  width: number;
  height: number;
} & BoxProps;

export const GameBoard = ({
  cells,
  width,
  height,
  ...props
}: GameBoardProps): React.JSX.Element => {
  return (
    <Box
      width={width}
      height={height}
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      {cells.map((cellsColumn, columnIndex) => (
        <CellsColumn
          key={`col_${columnIndex}`}
          columnIndex={columnIndex}
          width={Math.round(width / cells.length)}
          height={height}
          cells={cellsColumn}
        />
      ))}
    </Box>
  );
};
