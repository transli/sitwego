import React, {
  ForwardedRef,
  ReactNode,
  useContext,
  useMemo,
  useRef,
} from "react";
import RnBottomSheetView from "./RnBottomSheetView";

interface BottomActionSheetACT {
  show: (props: ACTBottomSheetProps) => void;
  hide: () => void;
}
type CMP = {
  showOtpSheet: () => void;
  endRide: () => Promise<void>;
  setArrived: () => void;
  hasRideStarted: boolean;
};
export type ACTBottomSheetProps = {
  itemHeight?: number;
  headerHeight?: number;
  hasCancel?: boolean;
  type?: string;
  cmp?: (props: CMP) => React.ReactElement | React.ReactNode | null;
  snaps: (string | number)[];
  onClose?: () => void;
  enableContentPanningGesture?: boolean;
  hasBackDrop: boolean;
  enablePanDownToClose: boolean;
  detached?: boolean;
};
const Context = React.createContext<BottomActionSheetACT>({
  show: function (): void {},
  hide: function (): void {},
});
const { Provider } = Context;
export const useBottomSheet = () => useContext(Context);

const BottomSheetProvider = ({ children }: { children: ReactNode }) => {
  const ref: ForwardedRef<BottomActionSheetACT> = useRef(null);

  const getContext: BottomActionSheetACT = useMemo(
    () => ({
      show: (options) => {
        ref.current?.show(options);
      },
      hide: () => {
        ref.current?.hide();
      },
    }),
    [],
  );

  return (
    <Provider value={getContext}>
      <RnBottomSheetView ref={ref}>{children}</RnBottomSheetView>
    </Provider>
  );
};
export default BottomSheetProvider;
