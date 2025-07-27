import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { Image as ExpoImage, ImageBackground } from "expo-image";
import {
  type ImagePickerOptions,
  launchImageLibraryAsync,
} from "expo-image-picker";

import RnText from "~/components/RnText";
import { RnView } from "~/components/RnView";
import { s } from "~/styles/Common-Styles";
import { atoms } from "~/ui/theme/atoms";
import { useAppTheme } from "~/ui/theme/ThemeProvider";
import RnTextInput from "~/components/RnTextInput";
import React, { useCallback, useMemo, useRef } from "react";
import { DateFieldRef, DateInputField } from "~/ui/DateComponent";
import { TouchableHighlight } from "react-native";
import { useSheetWrapper } from "~/hooks/useSheetWrapper";
import { getDataUriSize } from "~/utils/media/utils";
import { usePhotoLibraryPermission } from "~/hooks/usePermision";
import { compressImgIfNeeded } from "~/lib/Image/imgResize";
import { isNative } from "~/utils/platform";
import { DocFormType, useOnboardingControls } from "../state";
import { OnboardingControls } from "../OnBoardingControls";
import { Pressable } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";

export function Docs() {
  const { dispatch, state } = useOnboardingControls();
  const { colors, fonts } = useAppTheme();
  const { control, getValues } = useForm<DocFormType>();
  const insets = useSafeAreaInsets();
  const dateRef = useRef<DateFieldRef>(null);
  const pickerRef = useRef(null);
  const onContinue = useCallback(() => {
    const values = getValues();
    dispatch({
      type: "setDocs",
      docs: values.docs,
      apiResponse: undefined,
    });
    dispatch({ type: "next" });
  }, [dispatch, getValues]);
  return (
    <RnView style={[s.align_start, s.justifyBetween]}>
      <RnView
        style={[
          s.w100pct,
          atoms.gap_sm,
          s.flexCol,
          { flexWrap: "wrap", marginTop: insets.top },
        ]}
      >
        <RnText style={[atoms.text_xl]}>Account Setup</RnText>
        <RnText
          style={[
            {
              lineHeight: 20,
              fontSize: 14,
              color: colors.lightGray,
              paddingBottom: 10,
            },
          ]}
        >
          Provide Documents
        </RnText>
        <RnView style={[s.flexDirectionRow, { flexWrap: "wrap" }, s.gap6]}>
          <RnText>
            Upload a profile image should match your id image.
            <RnText style={{ color: colors.notification, fontSize: 18 }}>
              *
            </RnText>
          </RnText>
          <Controller
            name="docs.profileImage"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => {
              return (
                <ImageController
                  value={value}
                  label="Upload a profile photo"
                  onChange={function (value: string): void {
                    onChange(value);
                  }}
                />
              );
            }}
          />
        </RnView>
        <RnView style={[s.flexDirectionRow, { flexWrap: "wrap" }, s.gap6]}>
          <RnText>
            Select document (ID) type{" "}
            <RnText style={{ color: colors.notification, fontSize: 18 }}>
              *
            </RnText>
          </RnText>
          <RnView
            style={[
              s.w100pct,
              {
                borderWidth: 1,
                borderColor: colors.lightBackground,
                borderRadius: 8,
              },
              s.py4,
              s.px4,
            ]}
          >
            <Controller
              name="docs.idType"
              rules={{ required: true }}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Picker
                  ref={pickerRef}
                  mode="dropdown"
                  selectedValue={value}
                  onValueChange={(itemValue) => {
                    if (itemValue) {
                      onChange(itemValue);
                    }
                  }}
                >
                  <Picker.Item
                    style={{
                      fontSize: 20,
                      fontFamily: fonts.medium.fontFamily,
                    }}
                    label="National Identity Card (ID)"
                    value="identity_card"
                  />
                  <Picker.Item
                    style={{
                      fontSize: 20,
                      fontFamily: fonts.medium.fontFamily,
                    }}
                    label="Passport"
                    value="passport"
                  />
                </Picker>
              )}
            />
          </RnView>
        </RnView>
        <RnView style={[s.flexDirectionRow, { flexWrap: "wrap" }, s.gap6]}>
          <RnText>
            What is your Id Number
            <RnText style={{ color: colors.notification, fontSize: 18 }}>
              *
            </RnText>
          </RnText>
          <Controller
            name="docs.idNo"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <RnTextInput
                style={[
                  s.input,
                  s.f16,
                  s.w100pct,
                  {
                    paddingLeft: 16,
                    fontFamily: fonts.regular.fontFamily,
                    color: colors.text,
                    borderColor: colors.lightBackground,
                  },
                ]}
                autoCorrect={false}
                cursorColor={colors.lightBackground}
                inputMode="numeric"
                maxLength={15}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="289500000"
                placeholderTextColor={colors.lightGray}
                value={value}
              />
            )}
          />
          <Controller
            name="docs.idImageBack"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => {
              return (
                <ImageController
                  value={value}
                  label="Upload Id photo back"
                  onChange={function (value: string): void {
                    onChange(value);
                  }}
                />
              );
            }}
          />
          <RnView style={{ marginVertical: 0 }} />
          <Controller
            name="docs.idImageFront"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => {
              return (
                <ImageController
                  value={value}
                  label="Upload Id photo front"
                  onChange={function (value: string): void {
                    onChange(value);
                  }}
                />
              );
            }}
          />
        </RnView>
        <RnView style={[s.flexDirectionRow, { flexWrap: "wrap" }, s.gap6]}>
          <RnText>
            Driving License expiry date
            <RnText style={{ color: colors.notification, fontSize: 18 }}>
              *
            </RnText>
          </RnText>
          <Controller
            name="docs.dlExpiry"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <DateInputField
                inputRef={dateRef}
                value={value}
                minimumDate={new Date()}
                onChangeDate={function (date: string): void {
                  onChange(date);
                }}
                label={"Dl expiry date"}
              />
            )}
          />
          <Controller
            name="docs.driverLicense"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => {
              return (
                <ImageController
                  value={value}
                  label="Upload driving License photo"
                  onChange={function (value: string): void {
                    onChange(value);
                  }}
                />
              );
            }}
          />
        </RnView>
        <RnView style={[s.flexDirectionRow, { flexWrap: "wrap" }, s.gap6]}>
          <RnText>
            Clearance Certificate / report expiry date
            <RnText style={{ color: colors.notification, fontSize: 18 }}>
              *
            </RnText>
          </RnText>
          <Controller
            name="docs.certificateOfGoodConductExpiry"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <DateInputField
                inputRef={dateRef}
                value={value}
                minimumDate={new Date()}
                onChangeDate={function (date: string): void {
                  onChange(date);
                }}
                label={"Certificate Expiry date"}
              />
            )}
          />
          <Controller
            name="docs.certificateOfGoodConductFromDCI"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => {
              return (
                <ImageController
                  value={value}
                  label="Upload a photo of certificate of good conduct"
                  onChange={function (value: string): void {
                    onChange(value);
                  }}
                />
              );
            }}
          />
        </RnView>
        <RnView style={[s.flexDirectionRow, { flexWrap: "wrap" }, s.gap6]}>
          <RnText>
            Provide PSV Badge expiry date
            <RnText style={{ color: colors.notification, fontSize: 18 }}>
              *
            </RnText>
          </RnText>
          <Controller
            name="docs.psvBadgeExpiry"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => (
              <DateInputField
                inputRef={dateRef}
                value={value}
                minimumDate={new Date()}
                onChangeDate={function (date: string): void {
                  onChange(date);
                }}
                label="PSV badge expiry"
              />
            )}
          />
          <Controller
            name="docs.psvBadge"
            rules={{ required: true }}
            control={control}
            render={({ field: { onBlur, onChange, value } }) => {
              return (
                <ImageController
                  value={value}
                  label="Upload a photo of PSV badge"
                  onChange={function (value: string): void {
                    onChange(value);
                  }}
                />
              );
            }}
          />
        </RnView>
      </RnView>
      <OnboardingControls.Portal>
        <RnView
          style={[
            { marginBottom: insets.bottom },
            s.justifyCenter,
            s.alignCenter,
            s.py8,
          ]}
        >
          <Pressable
            onPress={onContinue}
            style={[
              s.p16,
              {
                width: "80%",
                backgroundColor: colors.primary,
                borderRadius: 8,
              },
            ]}
          >
            <RnText style={[atoms.text_lg, s.textCenter]}>Continue</RnText>
          </Pressable>
        </RnView>
      </OnboardingControls.Portal>
    </RnView>
  );
}

type ImageControllerTypes = {
  value: string;
  onChange: (value: string) => void;
  label: string;
};
const ImageController: React.FC<ImageControllerTypes> = ({
  value,
  onChange,
  label,
}) => {
  const { colors } = useAppTheme();

  const { requestPhotoAccessIfNeeded } = usePhotoLibraryPermission();

  const sheetWraper = useSheetWrapper();

  const openImagePicker = useCallback(
    async (opt: ImagePickerOptions) => {
      const resp = await sheetWraper(
        launchImageLibraryAsync({
          ...opt,
          exif: false,
          mediaTypes: "images",
          quality: 1,
          legacy: true,
        }),
      );

      return (resp.assets ?? [])
        .slice(0, 1)
        .filter((asset, _) => {
          if (
            !asset.mimeType?.startsWith("image/") ||
            (!asset.mimeType?.endsWith("jpeg") &&
              !asset.mimeType?.endsWith("jpg") &&
              !asset.mimeType?.endsWith("png"))
          ) {
            // setError(_(msg`Only .jpg and .png files are supported`));
            console.log("Only .jpg and .png files are supported");
            return false;
          }
          return true;
        })
        .map((image) => ({
          mime: image.mimeType ?? "image/jpeg",
          height: image.height,
          width: image.width,
          path: image.uri,
          size: getDataUriSize(image.uri),
        }));
    },
    [sheetWraper],
  );

  const openOpenLib = useCallback(
    async function () {
      if (!(await requestPhotoAccessIfNeeded())) {
        return;
      }
      const img = await openImagePicker({
        aspect: [16, 9],
      });

      let image = img[0];
      if (!image) return;

      image = await compressImgIfNeeded(image, 1000000);

      if (isNative) {
        await ExpoImage.prefetch(image.path);
      }

      onChange(image.path);
    },
    [onChange, openImagePicker, requestPhotoAccessIfNeeded],
  );

  const tmpImg = useMemo(() => value ?? "", [value]);

  return (
    <TouchableHighlight
      onPress={openOpenLib}
      style={[
        s.w100pct,
        s.alignCenter,
        s.justifyCenter,
        {
          aspectRatio: 16 / 9,
          borderRadius: 16,
          backgroundColor: colors.lightBackground,
        },
      ]}
    >
      <ImageBackground
        source={tmpImg}
        style={{
          width: "100%",
          flex: 1,
          borderRadius: 16,
          overflow: "hidden",
        }}
        // imageStyle={{ borderRadius: 16 }}
        responsivePolicy="static"
        contentFit="cover"
        accessibilityIgnoresInvertColors
        transition={{ duration: 300, effect: "cross-dissolve" }}
      >
        <RnView style={[s.flex1, s.alignCenter, s.justifyCenter]}>
          <RnText>{label}</RnText>
        </RnView>
      </ImageBackground>
    </TouchableHighlight>
  );
};
