import { createMatrix } from './createMatrix';
import { rect, rrect, Skia } from '@shopify/react-native-skia';
import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import getCorners from './getCorners';

type Neighbors = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

type RenderFigureOptions = {
  matrixCellSize: number;
  x: number;
  y: number;
  neighbors: Neighbors;
};

type QrCodeSvgOptions = {
  value: string;
  frameSize: number;
  position: { x: number; y: number };
  borderRadiusRatio: number;
  contentCells?: number;
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
};

type SquareSectionOptions = {
  x: number;
  y: number;
  size: number;
  cellSize: number;
  matrixSize: number;
  borderRadiusRatio: number;
};

/*
 * I grabbed the code from react-native-qr-svg library and modified to my specific requirements
 * for instance rounding the three large squares at the edges of the code.
 */
export function renderQrCode({
  value,
  frameSize,
  position,
  borderRadiusRatio,
  contentCells = 6,
  errorCorrectionLevel = 'H',
}: QrCodeSvgOptions) {
  const originalMatrix = createMatrix(value, errorCorrectionLevel);
  const matrixCellSize = frameSize / originalMatrix.length;

  const matrixRowLength = originalMatrix[0]?.length ?? 0;
  const roundedContentCells =
    (matrixRowLength - contentCells) % 2 === 0
      ? contentCells
      : contentCells + 1;

  const contentStartIndex = (matrixRowLength - roundedContentCells) / 2;
  const contentEndIndex = contentStartIndex + roundedContentCells - 1;
  const contentXY = contentStartIndex * matrixCellSize;

  const matrix = originalMatrix.map((row, i) =>
    row.map((el, j) =>
      i >= contentStartIndex &&
      i <= contentEndIndex &&
      j >= contentStartIndex &&
      j <= contentEndIndex
        ? 0
        : el
    )
  );

  const commands: string[] = [];

  let squareSize = 0;
  for (let i = 0; i < matrix[0]!.length; i++) {
    if (matrix[0][i] === 0) break;
    squareSize = i + 1;
  }

  matrix.map((row, i) =>
    row.map((_, j) => {
      if (!row?.[j]) {
        return null;
      }
      const neighbors: Neighbors = {
        top: Boolean(matrix[i - 1]?.[j]),
        bottom: Boolean(matrix[i + 1]?.[j]),
        left: Boolean(row[j - 1]),
        right: Boolean(row[j + 1]),
      };

      const hideTopLeft = i < squareSize && j < squareSize;
      const hideTopRight = i < squareSize && j >= row.length - squareSize;
      const hideBottomLeft = i >= row.length - squareSize && j < squareSize;
      if (hideTopLeft || hideTopRight || hideBottomLeft) {
        return;
      }

      const x = position.x + j * matrixCellSize;
      const y = position.y + i * matrixCellSize;
      const d = renderFigure({
        x,
        y,
        matrixCellSize,
        neighbors,
      });

      commands.push(d);
    })
  );

  const halfCell = matrixCellSize / 2;

  const squarePath = renderSquares({
    x: position.x,
    y: position.y,
    size: squareSize,
    cellSize: matrixCellSize,
    matrixSize: matrix.length,
    borderRadiusRatio,
  });

  const path = Skia.Path.MakeFromSVGString(commands.join(' '))!;
  path.addPath(squarePath);

  const cx =
    position.x + contentXY + matrixCellSize * (contentCells / 2) + halfCell;
  const cy =
    position.y + contentXY + matrixCellSize * (contentCells / 2) + halfCell;
  const r = matrixCellSize * (contentCells / 2 - 0.5);
  path.addCircle(cx, cy, r);

  return {
    path,
    content: { cx, cy, r },
  };
}

function renderFigure({
  x,
  y,
  matrixCellSize,
  neighbors,
}: RenderFigureOptions): string {
  let { q1, q2, q3, q4 } = getCorners(x, y, matrixCellSize);

  if (
    !(neighbors.top || neighbors.right || neighbors.bottom || neighbors.left)
  ) {
    const radius = matrixCellSize / 2 / 2;
    const path = Skia.Path.Make();
    path.addRRect(
      rrect(rect(x, y, matrixCellSize, matrixCellSize), radius, radius)
    );

    return path.toSVGString();
  }

  // q4  0  d1  0  q1
  // 0   0  0   0  0
  // d4  0  0   0  d2
  // 0   0  0   0  0
  // q3  0  d3  0  q2
  const d1 = {
    x: x + matrixCellSize / 2,
    y: y,
  };
  const d2 = {
    x: x + matrixCellSize,
    y: y + matrixCellSize / 2,
  };
  const d1d2 =
    neighbors.top || neighbors.right
      ? `L${q1.x} ${q1.y} L${d2.x} ${d2.y}`
      : `Q${q1.x} ${q1.y} ${d2.x} ${d2.y}`;
  const d3 = {
    x: x + matrixCellSize / 2,
    y: y + matrixCellSize,
  };
  const d2d3 =
    neighbors.right || neighbors.bottom
      ? `L${q2.x} ${q2.y} L${d3.x} ${d3.y}`
      : `Q${q2.x} ${q2.y} ${d3.x} ${d3.y}`;
  const d4 = {
    x: x,
    y: y + matrixCellSize / 2,
  };
  const d3d4 =
    neighbors.bottom || neighbors.left
      ? `L${q3.x} ${q3.y} L${d4.x} ${d4.y}`
      : `Q${q3.x} ${q3.y} ${d4.x} ${d4.y}`;
  const d4d1 =
    neighbors.left || neighbors.top
      ? `L${q4.x} ${q4.y} L${d1.x} ${d1.y}`
      : `Q${q4.x} ${q4.y} ${d1.x} ${d1.y}`;

  return `M${d1.x} ${d1.y} ${d1d2} ${d2d3} ${d3d4} ${d4d1}`;
}

function renderSquares(options: SquareSectionOptions) {
  const { x, y, size, cellSize, matrixSize, borderRadiusRatio } = options;

  const lr = borderRadiusRatio * size * cellSize * 3;
  const topLX = x + cellSize / 2;
  const topLY = y + cellSize / 2;
  const topRX = x + cellSize / 2 + (matrixSize - size) * cellSize;
  const topRY = y + cellSize / 2;
  const bottomX = topLX;
  const bottomY = y + cellSize / 2 + (matrixSize - size) * cellSize;
  const squareSize = size * cellSize - cellSize;

  const path = Skia.Path.Make();
  path.addRRect(rrect(rect(topLX, topLY, squareSize, squareSize), lr, lr));
  path.addRRect(rrect(rect(topRX, topRY, squareSize, squareSize), lr, lr));
  path.addRRect(rrect(rect(bottomX, bottomY, squareSize, squareSize), lr, lr));
  path.stroke({ width: cellSize });

  const sr = borderRadiusRatio * (size - 2) * cellSize * 2;
  const sTopLX = x + cellSize * 2;
  const sTopLY = y + cellSize * 2;
  const sTopRX = x + cellSize * 2 + (matrixSize - size) * cellSize;
  const sTopRY = sTopLY;
  const sBX = sTopLX;
  const sBY = y + cellSize * 2 + (matrixSize - size) * cellSize;
  const smallSize = (size - 4) * cellSize;

  const sPath = Skia.Path.Make();
  sPath.addRRect(rrect(rect(sTopLX, sTopLY, smallSize, smallSize), sr, sr));
  sPath.addRRect(rrect(rect(sTopRX, sTopRY, smallSize, smallSize), sr, sr));
  sPath.addRRect(rrect(rect(sBX, sBY, smallSize, smallSize), sr, sr));

  path.addPath(sPath);

  return path;
}
