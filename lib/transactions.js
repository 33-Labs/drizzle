import drizzleService from "./drizzleService"
import * as fcl from "@onflow/fcl"

// Different from the response of FCL
// We don't need to show every status to users
const TxStatus = {
  // Initializing: Initialing
  // the transaction is waiting to be approved
  initializing() {
    return {status: "Initializing", error: null, txid: null}
  },
  // Pending: Pending & Finalized & Executed
  // the transaction has not been confirmed on chain
  pending(txid) {
    return {status: "Pending", error: null, txid: txid}
  },
  // Success: Sealed with no error
  success(txid) {
    return {status: "Success", error: null, txid: txid}
  },
  // Failed: Sealed with error
  failed(error, txid) {
    return {status: "Failed", error: error, txid: txid}
  }
}

export const test = async (
  setTransactionInProgress,
  setTransactionStatus
) => {
  let transactionId = null
  setTransactionInProgress(true)
  setTransactionStatus(TxStatus.initializing())

  try {
    transactionId = await drizzleService.testTx()
    setTransactionStatus(TxStatus.pending(transactionId))

    fcl.tx(transactionId).subscribe(res => {
      if (res.status === 4) {
        if (res.statusCode === 0) {
          setTransactionStatus(TxStatus.success(transactionId))
        } else {
          setTransactionStatus(TxStatus.failed(res.errorMessage, transactionId))
        }
        setTimeout(() => setTransactionInProgress(false), 5000)
      }
    })

    let res = await fcl.tx(transactionId).onceSealed()
    return res
  } catch (e) {
    setTransactionStatus(TxStatus.failed(e, null))
    console.log(e)
    setTimeout(() => setTransactionInProgress(false), 5000)
  }
}