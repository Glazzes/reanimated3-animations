import React, { useRef } from "react";

import BottomSheet from "./sheet/BottomSheet";

import { BottomSheetType } from "./types";

export const BottomSheetContext = React.createContext<BottomSheetType>(
  {} as BottomSheetType,
);

const BottomSheetProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const sheetRef = useRef<BottomSheetType>(null);

  const open = () => sheetRef.current?.open();
  const close = () => sheetRef.current?.close();

  return (
    <BottomSheetContext.Provider value={{ open, close }}>
      {children}
      <BottomSheet ref={sheetRef} />
    </BottomSheetContext.Provider>
  );
};

export default BottomSheetProvider;
