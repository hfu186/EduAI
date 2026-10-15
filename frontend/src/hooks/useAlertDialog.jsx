import { createContext, useCallback, useContext, useRef, useState } from "react";
import AlertDialog from "../components/common/AlertDialog";

const AlertDialogContext = createContext(null);

export function AlertDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog(options);
    });
  }, []);

  const close = useCallback((confirmed = false) => {
    setDialog(null);
    resolveRef.current?.(confirmed);
    resolveRef.current = null;
  }, []);

  return (
    <AlertDialogContext.Provider value={confirm}>
      {children}
      {dialog && (
        <AlertDialog
          {...dialog}
          onCancel={() => close(false)}
          onConfirm={() => close(true)}
        />
      )}
    </AlertDialogContext.Provider>
  );
}

export default function useAlertDialog() {
  const confirm = useContext(AlertDialogContext);
  if (!confirm) {
    throw new Error("useAlertDialog must be used within AlertDialogProvider");
  }
  return confirm;
}
