import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type Ref,
  useCallback,
  useState,
  useEffect,
} from "react";
import { StyleSheet, Keyboard } from "react-native";
import {
  PresentEvent,
  TrueSheet,
  type TrueSheetProps,
} from "@lodev09/react-native-true-sheet";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RnView } from "../RnView";
import RnText from "../RnText";
import OtpInput, { OtpInputMethods } from "../OtpInput";
import { atoms } from "~/ui/theme/atoms";

const $content = StyleSheet.create({
  bottomSheetContainer: {
    paddingHorizontal: 10,
    overflow: "hidden",
    flexGrow: 1,
    // flexBasis: "100%",
  },
});

type Props = {
  confirmOtpCodes: (otp: string) => Promise<void>;
};
export const OtpBottomSheet = forwardRef(
  ({ confirmOtpCodes }: Props, ref: Ref<TrueSheet>) => {
    const { colors } = useAppTheme();
    const sheetRef = useRef<TrueSheet>(null);
    const inset = useSafeAreaInsets();
    const [validCode, setValidateCode] = useState("");
    const inputValidateCodeRef = useRef<OtpInputMethods>(null);
    const [isSheetVisible, setIsSheetVisible] = useState(false);

    useEffect(() => {
      if (!inputValidateCodeRef.current) {
        return;
      }
      inputValidateCodeRef.current.focus();
    }, []);

    useEffect(() => {
      if (!inputValidateCodeRef.current || validCode.length > 0) {
        return;
      }
      inputValidateCodeRef.current.clear();
    }, [validCode]);

    useEffect(() => {
      let showSub = Keyboard.addListener("keyboardDidShow", () => {
        if (isSheetVisible && sheetRef.current) {
          sheetRef.current.resize(1);
        }
      });
      let hidSub = Keyboard.addListener("keyboardDidHide", () => {
        if (isSheetVisible && sheetRef.current) {
          sheetRef.current.resize(0);
        }
      });

      return () => {
        showSub.remove();
        hidSub.remove();
      };
    }, [isSheetVisible]);

    const onPresent = useCallback((e: PresentEvent) => {
      console.log("OTP Sheet moadl presented!");
      setIsSheetVisible(true);
    }, []);

    useImperativeHandle<TrueSheet | null, TrueSheet | null>(
      ref,
      () => sheetRef.current,
    );

    const _hideOtpSheet = useCallback(async () => {
      await sheetRef.current?.dismiss();
    }, []);

    const onDismiss = useCallback(() => {
      console.log("OTP Sheet dismissed!");
      setIsSheetVisible(false);
      inputValidateCodeRef.current?.clear();
    }, []);

    const onFufill = useCallback(
      async (otp: string) => {
        await confirmOtpCodes(otp);
        await _hideOtpSheet();
      },
      [_hideOtpSheet, confirmOtpCodes],
    );

    /**
     * Handle text input and clear formError upon text change
     */
    const onTextInput = useCallback((text: string) => {
      setValidateCode(text);
    }, []);

    return (
      <TrueSheet
        ref={sheetRef}
        style={{ top: inset.top }}
        contentContainerStyle={[$content.bottomSheetContainer]}
        dimmed
        dismissible={true}
        sizes={["45%", "large"]}
        blurTint="dark"
        backgroundColor={colors.background}
        edgeToEdge
        onDismiss={onDismiss}
        onPresent={onPresent}
      >
        <RnView style={{ flexGrow: 1, paddingVertical: 16 }}>
          <RnText style={[atoms.text_md, { paddingBottom: 5 }]}>
            Enter Start OTP
          </RnText>
          <OtpInput
            ref={(ref) => {
              if (!ref) return;
              inputValidateCodeRef.current = ref;
            }}
            name="validateCode"
            value={validCode}
            onChangeText={onTextInput}
            // errorText={errorText}
            // hasError={canShowError && !isEmptyObject(finalValidateError)}
            autoFocus={false}
            allowResubmit={false}
            onFulfill={onFufill}
          />
          <RnView
            style={[
              { alignSelf: "center", alignItems: "center", marginTop: 40 },
            ]}
          >
            <RnText style={[atoms.text_sm, {}]}>
              Ask your customer for the start OTP
            </RnText>
          </RnView>
        </RnView>
      </TrueSheet>
    );
  },
);

OtpBottomSheet.displayName = "OtpBottomSheet";
