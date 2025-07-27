import React, { useEffect, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInputFocusEventData,
  TextInputKeyPressEventData,
  ViewStyle,
} from "react-native";
import { isNumeric } from "~/utils/validations";
import { RnView } from "./RnView";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { atoms } from "~/ui/theme/atoms";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import RnTextInput, { AnimatedTextInputRef } from "./RnTextInput";
import RnText from "./RnText";
import { getValueUsingPixelRatio } from "~/utils/stlyes_metrics";

const inputHeight = getValueUsingPixelRatio(52, 72);

type OtpInputProps = {
  /** Name attribute for the input */
  name?: string;

  /** Input value */
  value?: string;

  /** Should the input auto focus */
  autoFocus?: boolean;

  /** Error text to display */
  errorText?: string;

  /* Should submit when the input is complete */
  shouldSubmitOnComplete?: boolean;

  /** Function to call when the input is changed  */
  onChangeText?: (value: string) => void;

  /** Function to call when the input is submitted or fully complete */
  onFulfill: (value: string) => void;

  /** Specifies if the input has a validation error */
  hasError?: boolean;

  /** Specifies the max length of the input */
  maxLength?: number;

  /** Specifies if the keyboard should be disabled */
  isDisableKeyboard?: boolean;

  /** Last pressed digit on BigDigitPad */
  lastPressedDigit?: string;

  /** TestID for test */
  testID?: string;

  /** Whether to allow auto submit again after the previous attempt fails */
  allowResubmit?: boolean;
};

export type OtpInputMethods = {
  focus: () => void;
  focusLastSelected: () => void;
  resetFocus: () => void;
  clear: () => void;
  blur: () => void;
};
/**
 * Converts a given string into an array of numbers that must have the same
 * number of elements as the number of inputs.
 */
const decomposeString = (value: string, length: number): string[] => {
  let arr = value
    .split("")
    .slice(0, length)
    .map((v) => (isNumeric(v) ? v : " "));
  if (arr.length < length) {
    arr = arr.concat(Array(length - arr.length).fill(" "));
  }
  return arr;
};

/**
 * Converts an array of strings into a single string. If there are undefined or
 * empty values, it will replace them with a space.
 */
const composeToString = (value: string[]): string =>
  value.map((v) => v ?? " ").join("");

const getInputPlaceholderSlots = (length: number): number[] =>
  Array.from(Array(length).keys());
const OtpInput = (
  {
    value = "",
    maxLength = 4,
    onChangeText,
    isDisableKeyboard = false,
    onFulfill,
    shouldSubmitOnComplete = true,
    autoFocus = true,
    lastPressedDigit = "",
  }: OtpInputProps,
  ref: React.Ref<OtpInputMethods>,
) => {
  const { colors, fonts } = useAppTheme();
  const inputRef = useRef<AnimatedTextInputRef | null>(null);
  const [input, setInput] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number | undefined>(0);
  const editIndex = useRef(0);
  // const [wasSubmitted, setWasSubmitted] = useState(false);
  const shouldFocusLast = useRef(false);
  const inputWidth = useRef(0);
  const lastFocusedIndex = useRef(0);
  const lastValue = useRef<string | number>("");
  const valueRef = useRef(value);

  useEffect(() => {
    lastValue.current = input.length;
  }, [input]);

  useEffect(() => {
    // Note: there are circumstances where the value state isn't updated yet
    // when e.g. onChangeText gets called the next time. In those cases its safer to access the value from a ref
    // to not have outdated values.
    valueRef.current = value;
  }, [value]);

  const validateAndSubmit = () => {
    const numbers = decomposeString(value, maxLength);

    if (
      !shouldSubmitOnComplete ||
      numbers.filter((n) => isNumeric(n)).length !== maxLength
      // || isOffline
    ) {
      return;
    }
    // Blurs the input and removes focus from the last input and, if it should submit
    // on complete, it will call the onFulfill callback.
    blurOtpCodeInput();
    onFulfill(value);
    lastValue.current = "";
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => validateAndSubmit(), [value, shouldSubmitOnComplete]);

  const blurOtpCodeInput = () => {
    inputRef.current?.blur();
    setFocusedIndex(undefined);
  };
  const focusOtpCodeInput = () => {
    setFocusedIndex(0);
    lastFocusedIndex.current = 0;
    editIndex.current = 0;
    inputRef.current?.focus();
  };

  const setInputAndIndex = (index: number) => {
    setInput("");
    setFocusedIndex(index);
    editIndex.current = index;
  };

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      focusOtpCodeInput();
    },
    focusLastSelected: () => {
      inputRef.current?.focus();
    },
    resetFocus: () => {
      setInput("");
      focusOtpCodeInput();
    },
    clear: () => {
      lastFocusedIndex.current = 0;
      setInputAndIndex(0);
      inputRef.current?.focus();
      onChangeText?.("");
    },
    blur: () => {
      blurOtpCodeInput();
    },
  }));
  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onBegin((e) => {
      // find edit Index
      const index = Math.floor(e.x / (inputWidth.current / maxLength));
      shouldFocusLast.current = false;
      setFocusedIndex(index);
      lastFocusedIndex.current = index;
    });

  /**
   * Focuses on the input when it is pressed.
   */
  const onFocus = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (shouldFocusLast.current) {
      lastValue.current = "";
      setInputAndIndex(lastFocusedIndex.current);
    }
    event.preventDefault();
  };
  const onChangeTextHandler = (text: string) => {
    if (!text.length || !isNumeric) return;
    //check of a character was added or if the content was replaced
    const hasToslice =
      typeof lastValue.current === "string" &&
      text.length - 1 === lastValue.current.length &&
      text.slice(0, text.length - 1) === lastValue.current;
    // get the newly added character
    const newAddedChar =
      hasToslice && typeof text === "string"
        ? //@ts-expect-error
          text.slice(lastValue.current.length, text.length)
        : text;
    lastValue.current = text;

    // Updates the focused input taking into consideration the last input
    // edited and the number of digits added by the user.
    const numbersArr = newAddedChar
      .trim()
      .split("")
      .slice(0, maxLength - editIndex.current);
    const updatedFocusedIndex = Math.min(
      editIndex.current + (numbersArr.length - 1) + 1,
      maxLength - 1,
    );

    let numbers = decomposeString(valueRef.current, maxLength);
    numbers = [
      ...numbers.slice(0, editIndex.current),
      ...numbersArr,
      ...numbers.slice(numbersArr.length + editIndex.current, maxLength),
    ];

    setInputAndIndex(updatedFocusedIndex);

    const finalInput = composeToString(numbers);
    onChangeText?.(finalInput);
    valueRef.current = finalInput;
  };
  /**
   * Handles logic related to certain key presses.
   *
   * NOTE: when using Android Emulator, this can only be tested using
   * hardware keyboard inputs.
   */
  const onKeyPress = (
    event: Partial<NativeSyntheticEvent<TextInputKeyPressEventData>>,
  ) => {
    const keyValue = event?.nativeEvent?.key;

    if (keyValue === "Backspace" || keyValue === "<") {
      let numbers = decomposeString(value, maxLength);

      // If keyboard is disabled and no input is focused we need to remove
      // the last entered digit and focus on the correct input
      if (isDisableKeyboard && focusedIndex === undefined) {
        const curEditIndex = editIndex.current;
        const indexBeforeLastEditIndex =
          curEditIndex === 0 ? curEditIndex : curEditIndex - 1;

        const indexToFocus =
          numbers.at(curEditIndex) === " "
            ? indexBeforeLastEditIndex
            : curEditIndex;
        if (indexToFocus !== undefined) {
          lastFocusedIndex.current = indexToFocus;
          inputRef.current?.focus();
        }
        onChangeText?.(value.substring(0, indexToFocus));

        return;
      }

      // If the currently focused index already has a value, it will delete
      // that value but maintain the focus on the same input.
      if (focusedIndex !== undefined && numbers?.at(focusedIndex) !== " ") {
        setInput("");
        numbers = [
          ...numbers.slice(0, focusedIndex),
          " ",
          ...numbers.slice(focusedIndex + 1, maxLength),
        ];
        editIndex.current = focusedIndex;
        onChangeText?.(composeToString(numbers));
        return;
      }

      const hasInputs = numbers.filter((n) => isNumeric(n)).length !== 0;

      // Fill the array with empty characters if there are no inputs.
      if (focusedIndex === 0 && !hasInputs) {
        numbers = Array<string>(maxLength).fill(" ");

        // Deletes the value of the previous input and focuses on it.
      } else if (focusedIndex && focusedIndex !== 0) {
        numbers = [
          ...numbers.slice(0, Math.max(0, focusedIndex - 1)),
          " ",
          ...numbers.slice(focusedIndex, maxLength),
        ];
      }

      const newFocusedIndex = Math.max(0, (focusedIndex ?? 0) - 1);

      // Saves the input string so that it can compare to the change text
      // event that will be triggered, this is a workaround for mobile that
      // triggers the change text on the event after the key press.
      setInputAndIndex(newFocusedIndex);
      onChangeText?.(composeToString(numbers));

      if (newFocusedIndex !== undefined) {
        lastFocusedIndex.current = newFocusedIndex;
        inputRef.current?.focus();
      }
    }

    if (keyValue === "ArrowLeft" && focusedIndex !== undefined) {
      const newFocusedIndex = Math.max(0, focusedIndex - 1);
      setInputAndIndex(newFocusedIndex);
      inputRef.current?.focus();
    } else if (keyValue === "ArrowRight" && focusedIndex !== undefined) {
      const newFocusedIndex = Math.min(focusedIndex + 1, maxLength - 1);
      setInputAndIndex(newFocusedIndex);
      inputRef.current?.focus();
    } else if (keyValue === "Enter") {
      // We should prevent users from submitting when it's offline.
      // if (isOffline) {
      //   return;
      // }
      console.log(value);
      setInput("");
      onFulfill(value);
    } else if (keyValue === "Tab" && focusedIndex !== undefined) {
      const newFocusedIndex = (event as unknown as KeyboardEvent).shiftKey
        ? focusedIndex - 1
        : focusedIndex + 1;
      if (newFocusedIndex >= 0 && newFocusedIndex < maxLength) {
        setInputAndIndex(newFocusedIndex);
        inputRef.current?.focus();
        if (event?.preventDefault) {
          event.preventDefault();
        }
      }
    }
  };

  /**
   *  If isDisableKeyboard is true we will have to call onKeyPress and onChangeText manually
   *  as the press on digit pad will not trigger native events. We take lastPressedDigit from props
   *  as it stores the last pressed digit pressed on digit pad. We take only the first character
   *  as anything after that is added to differentiate between two same digits passed in a row.
   */

  useEffect(() => {
    if (!isDisableKeyboard) {
      return;
    }

    const textValue = lastPressedDigit.charAt(0);
    onKeyPress({ nativeEvent: { key: textValue } });
    onChangeTextHandler(textValue);

    // We have not added:
    // + the onChangeText and onKeyPress as the dependencies because we only want to run this when lastPressedDigit changes.
  }, [lastPressedDigit, isDisableKeyboard]);
  return (
    <>
      <RnView style={[styles.magicCodeInputContainer, {}]}>
        <GestureDetector gesture={tapGesture}>
          <RnView
            style={[
              StyleSheet.absoluteFill,
              atoms.w_full as ViewStyle,
              { backgroundColor: colors.transparent, zIndex: 1000 },
            ]}
            collapsable={false}
          >
            <RnTextInput
              onLayout={(e) => {
                inputWidth.current = e.nativeEvent.layout.width;
              }}
              ref={(newRef) => {
                inputRef.current = newRef;
              }}
              autoFocus={autoFocus}
              returnKeyType="default"
              inputMode="numeric"
              textContentType="oneTimeCode"
              maxLength={maxLength}
              value={input}
              autoComplete="one-time-code"
              keyboardType="numeric"
              onChangeText={onChangeTextHandler}
              onKeyPress={onKeyPress}
              onFocus={onFocus}
              onBlur={() => {
                shouldFocusLast.current = true;
                lastFocusedIndex.current = focusedIndex ?? 0;
                setFocusedIndex(undefined);
              }}
              selectionColor="transparent"
              role="presentation"
              style={[
                {
                  color: "transparent",
                  flex: 1,
                  paddingTop: 23,
                  paddingBottom: 8,
                  paddingLeft: 0,
                  borderWidth: 0,
                },
                atoms.w_full as ViewStyle,
              ]}
              testID="otp-input"
            />
          </RnView>
        </GestureDetector>
        {getInputPlaceholderSlots(maxLength).map((index) => {
          return (
            <RnView
              key={index}
              style={
                maxLength === 4
                  ? [{ width: "10%", marginLeft: 10 }]
                  : [{ flex: 1 }, index !== 0 && { marginLeft: 12 }]
              }
            >
              <RnView
                style={[
                  {
                    flex: 1,
                    justifyContent: "center",
                    height: "100%",
                    backgroundColor: "transparent",
                    overflow: "hidden",
                    borderBottomWidth: 2,
                    borderColor: colors.lightBackground,
                  },
                  { height: inputHeight - 2 },
                  // hasError || errorText ? styles.borderColorDanger : {},
                  focusedIndex === index ? { borderColor: "#03D47C" } : {},
                ]}
              >
                <RnText
                  style={[
                    styles.magicCodeInput,
                    {
                      fontFamily: fonts.heavy.fontFamily,
                      zIndex: 999,
                      textAlign: "center",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {decomposeString(value, maxLength).at(index) ?? ""}
                </RnText>
              </RnView>
            </RnView>
          );
        })}
      </RnView>
    </>
  );
};

export default React.forwardRef(OtpInput);
const styles = StyleSheet.create({
  magicCodeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: inputHeight,
  },

  magicCodeInput: {
    ...atoms.text_2xl,
    lineHeight: inputHeight + 12,
  },
});
