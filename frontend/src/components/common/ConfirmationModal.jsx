/* eslint-disable react/prop-types */
import AlertDialog from "./AlertDialog";

export default function ConfirmationModal({ modalData }) {
  return (
    <AlertDialog
      cancelText={modalData?.btn2Text}
      confirmText={modalData?.btn1Text}
      description={modalData?.text2}
      isDestructive={modalData?.btn1Text?.toLowerCase().includes("delete")}
      onCancel={modalData?.btn2Handler}
      onConfirm={modalData?.btn1Handler}
      title={modalData?.text1}
    />
  );
}