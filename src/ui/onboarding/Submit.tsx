import { RnView } from "~/components/RnView";
import { useAppTheme } from "../theme/ThemeProvider";
import { useOnboardingControls } from "./state";
import RnText from "~/components/RnText";
import { s } from "~/styles/Common-Styles";

export function SubmitData() {
  const { colors } = useAppTheme();
  const { dispatch, state } = useOnboardingControls();
  console.log(state);
  return (
    <RnView style={[s.align_start, s.justifyBetween]}>
      <RnText>Submit page</RnText>
    </RnView>
  );
}
