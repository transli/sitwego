import { useState } from "react";
import { Canvas, Circle, Rect, Line } from "@shopify/react-native-skia";
import { View, StyleSheet } from "react-native";
import { atoms } from "~/ui/theme/atoms";
import RnText from "../RnText";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import { themes } from "~/ui/theme/theme_utils";

const PickupToDestination = () => {
  // Fixed pick-up position
  const pickupX = 25;
  const pickupY = 20;

  // State to control destination Y position (making height dynamic)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [destinationY, _] = useState(65);
  const destinationX = 25;

  // Calculate the dynamic height of the canvas
  const padding = 20;
  const canvasHeight = Math.abs(destinationY - pickupY) + padding * 2;

  // Sizes for the dot and square
  const dotRadius = 6;
  const squareSize = 10;

  const { colors, fonts } = useAppTheme();
  return (
    <View style={styles.container}>
      {/* Row to place Skia Canvas and Text side by side */}
      <View style={styles.row}>
        {/* Skia Canvas for the dot, square, and line */}
        <Canvas style={[styles.canvas, { height: canvasHeight }]}>
          <Circle
            cx={pickupX}
            cy={pickupY}
            r={dotRadius}
            color={themes.bg_300}
            style="fill"
          />
          <Circle
            cx={pickupX}
            cy={pickupY}
            r={dotRadius}
            color="black"
            style="stroke"
            strokeWidth={1}
          />
          <Rect
            x={destinationX - squareSize / 2}
            y={destinationY - squareSize / 2}
            width={squareSize}
            height={squareSize}
            color={colors.text}
            style="fill"
          />
          <Rect
            x={destinationX - squareSize / 2}
            y={destinationY - squareSize / 2}
            width={squareSize}
            height={squareSize}
            color={themes.bg_600}
            style="stroke"
            strokeWidth={4}
          />
          <Line
            p1={{ x: pickupX, y: pickupY }}
            p2={{ x: destinationX, y: destinationY }}
            color={themes.bg_300}
            style="stroke"
            strokeWidth={1}
          />
        </Canvas>

        {/* Text container for travel details and addresses */}
        <View style={[{ height: canvasHeight }]}>
          {/* Pick-up details */}
          <View style={[atoms.gap_xs]}>
            {/* <RnText style={[atoms.text_sm, { color: themes.bg_300 }]}>
              2 mins (0.4 mi) away
            </RnText> */}
            <RnText style={[atoms.text_sm, { color: colors.lightGray }]}>
              From Pulaski Ave & W Zeralda St
            </RnText>
            <RnText
              style={[atoms.text_2xs, { fontFamily: fonts.heavy.fontFamily }]}
            >
              PHILADELPHIA
            </RnText>
          </View>
          <View
            style={[atoms.flex_1, atoms.gap_xs, { justifyContent: "flex-end" }]}
          >
            {/* Destination details */}
            {/* <RnText style={[atoms.text_sm, { color: themes.bg_300 }]}>
              30 mins (24.1 mi) trip
            </RnText> */}
            <RnText style={[atoms.text_sm, { color: colors.lightGray }]}>
              To Trainer St & W 9th St, Chester
            </RnText>
            <RnText
              style={[atoms.text_2xs, { fontFamily: fonts.heavy.fontFamily }]}
            >
              LOS ANGELES
            </RnText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { left: -10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  canvas: {
    width: 40,
  },
  textContainer: {
    marginLeft: 10, // Space between canvas and text
    justifyContent: "space-between",
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
});

export default PickupToDestination;
