import crypto from "crypto"

const key = "3072f8d03c87c9ebea86a64d8ac58707d4708ed247f3abcd84f0097c08865c68"

const raw = '{"code":"00","desc":"success","success":true,"data":{"orderCode":123,"amount":3000,"description":"VQRIO123","accountNumber":"12345678","reference":"TF230204212323","transactionDateTime":"2023-02-04 18:25:00","paymentLinkId":"124c33293c43417ab7879e14c8d9eb18","code":"00","desc":"Thành công","counterAccountBankId":"","counterAccountBankName":"","counterAccountName":"","counterAccountNumber":"","virtualAccountName":"","virtualAccountNumber":"","currency":"VND"}}'

const sign = crypto
  .createHmac("sha256", key)
  .update(raw)
  .digest("hex")

console.log(sign)