import { atom } from "recoil"

export const transactionInProgressState = atom({
  key: "transactionInProgressState",
  default: false
})

export const transactionStatusState = atom({
  key: "transactionStatusState",
  default: null
})

export const showBasicNotificationState = atom({
  key: "showBasicNotificationState",
  default: false
})

export const basicNotificationContentState = atom({
  key: "basicNotificationContentState",
  default: null
})

export const showAlertModalState = atom({
  key: "showAlertModalState",
  default: false
})

export const alertModalContentState = atom({
  key: "alertModalContentState",
  default: {content: "", actionTitle: "", action: null}
})

export const nameServiceState = atom({
  key: "nameServiceState",
  default: null
})