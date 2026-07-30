export const formatVND = (amount) => {
  if (amount === 0 || amount === null || amount === undefined) {
    return "Free"
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}