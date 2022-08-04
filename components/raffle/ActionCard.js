import Decimal from "decimal.js"
import { classNames } from "../../lib/utils"
import { claim } from "../../lib/cloud-transactions"
import { useSWRConfig } from 'swr'
import * as fcl from "@onflow/fcl"

import { useRecoilState } from "recoil"
import {
  transactionInProgressState,
  transactionStatusState
} from "../../lib/atoms"

const isClaimable = (claimStatus) => {
  if (!claimStatus) return false
  let aStatus = claimStatus.availability.status.rawValue
  let eStatusR = claimStatus.eligibilityForRegistration.status.rawValue
  let eStatusC = claimStatus.eligibilityForClaim.status.rawValue 
  if (aStatus == "2" && eStatusR == "0") return true
  if ((aStatus == "3" || aStatus == "4") && eStatusC == "1") return true
  return false
}

// [Emoji, Description, Amount, Title]
const parseClaimStatus = (user, claimStatus, nftDispalyName, isPreview) => {
  const elements = {
    emoji: "🎉", description: "YOU WON", amount: `FLOAT #10242048`, title: "PREVIEWING"
  }
  if (isPreview) { return elements }

  if (!user || !user.loggedIn) {
    elements.emoji = "👀"
    elements.description = "CONNECT WALLET TO CHECK ELIGIBILITY"
    elements.amount = null
    elements.title = "Connect Wallet"
    return elements
  }

  if (!claimStatus) {
    elements.emoji = "❓"
    elements.description = "UNKNOWN STATUS"
    elements.amount = null
    elements.title = "UNKNOWN"
    return elements
  }

  let aStatus = claimStatus.availability.status.rawValue
  let eStatusR = claimStatus.eligibilityForRegistration.status.rawValue
  let eStatusC = claimStatus.eligibilityForClaim.status.rawValue
  let eligibleNFT = claimStatus.eligibilityForClaim.eligibleNFTs[0]
  if (aStatus === "1") {
    // ended expired and no capacity
    elements.emoji = "⛔️"
    elements.title = "RAFFLE ENDED"
    // Keep the draw result
    if (eStatusC == "5") {
      elements.description = "YOU HAVE CLAIMED" 
      elements.amount = `${dispalyName} #${eligibleNFT}`
    } else if (eStatusC == "1") {
      elements.description = "YOU ARE THE WINNER OF" 
      elements.amount = `${dispalyName} #${eligibleNFT}`
    } else {
      elements.description = "NO LONGER AVAILABLE"
      elements.amount = null 
    }
  } else if (aStatus === "5") {
    elements.emoji = "⛔️"
    elements.title = "RAFFLE EXPIRED"
    // Keep the draw result
    if (eStatusC == "5") {
      elements.description = "YOU HAVE CLAIMED" 
      elements.amount = `${dispalyName} #${eligibleNFT}`
    } else if (eStatusC == "1") {
      elements.description = "YOU ARE THE WINNER OF" 
      elements.amount = `${dispalyName} #${eligibleNFT}`
    } else {
      elements.description = "NO LONGER AVAILABLE"
      elements.amount = null 
    }
  } else if (aStatus === "3") {
    if (eStatusC == "5") {
      elements.emoji = "🎉"
      elements.description = "YOU HAVE CLAIMED" 
      elements.amount = `${dispalyName} #${eligibleNFT}`
      elements.title = "HAVE CLAIMED"
    } else if (eStatusC == "1") {
      elements.emoji = "🎉"
      elements.description = "YOU ARE THE WINNER OF" 
      elements.amount = `${dispalyName} #${eligibleNFT}`
      elements.title = "CLAIM"
    } else if (eStatusC == "3" && eStatusR == "4") {
      // registered but not winner
      elements.emoji = "🎲"
      elements.description = "HAVE A GOOD DAY"  
      elements.amount = null
      elements.title = "RAFFLE DRAWING"
    } else {
      elements.emoji = "🙉"
      elements.description = "YOU ARE NOT ELIGIBLE"
      elements.title = "NOT ELIGIBLE"
      elements.amount = null 
    }
  } else if (aStatus === "4") {
    if (eStatusC == "5") {
      elements.emoji = "🎉"
      elements.description = "YOU HAVE CLAIMED" 
      elements.amount = `${dispalyName} #${eligibleNFT}`
      elements.title = "HAVE CLAIMED"
    } else if (eStatusC == "1") {
      elements.emoji = "🎉"
      elements.description = "YOU ARE THE WINNER OF" 
      elements.amount = `${dispalyName} #${eligibleNFT}`
      elements.title = "CLAIM"
    } else {
      elements.emoji = "🙉"
      elements.description = "YOU ARE NOT ELIGIBLE"
      elements.title = "NOT ELIGIBLE"
      elements.amount = null 
    }
  } else if (aStatus === "0") {
    elements.emoji = "🕙"
    elements.description = "DIDA DIDA ..."   
    elements.title = "NOT STARTED"
  } else if (aStatus === "6") {
    elements.emoji = "⏸️"
    elements.title = "RAFFLE PAUSED"
    if (eStatusC == "5") {
      elements.description = "YOU HAVE CLAIMED" 
      elements.amount = `${dispalyName} #${eligibleNFT}`
    } else if (eStatusC == "1") {
      elements.description = "YOU ARE THE WINNER OF" 
      elements.amount = `${dispalyName} #${eligibleNFT}`
    } else if (eStatusC == "3") {
      if (eStatusR == "4") {
        elements.description = "YOU HAVE REGISTERED"
        elements.amount = null
      } else if (eStatusR == "2") {
        elements.description = "YOU ARE NOT ELIGIBLE" 
        elements.amount = null
      } else if (eStatusR == "0") {
        elements.description = "YOU ARE ELIGIBLE" 
        elements.amount = null
      }
    } 
  } else if (aStatus === "2") {
    if (eStatusR === "0") {
      elements.emoji = "✅"
      elements.description = "YOU ARE ELIGIBLE"
      elements.title = "REGISTER NOW"
      elements.amount = null
    } else if (eStatusR === "2") {
      elements.emoji = "🙉"
      elements.description = "YOU ARE NOT ELIGIBLE"
      elements.title = "NOT ELIGIBLE"
      elements.amount = null
    } else if (eStatusR === "4") {
      elements.emoji = "✅"
      elements.description = "YOU HAVE REGISTERED!"
      elements.title = "COME BACK LATER"
      elements.amount = null
    }  
  }

  return elements
}

export default function ActionCard(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const { mutate } = useSWRConfig()

  const { isPreview, raffle, host, user, nft, claimStatus, setShowClaimedModal, setClaimedAmountInfo } = props
  const displayName = isPreview ? (nft && nft.displayName) : (raffle.nftInfo && raffle.nftInfo.displayName)

  // [Emoji, Description, Amount, Title]
  const {emoji, description, amount, title} = parseClaimStatus(user, claimStatus, displayName, isPreview)

  return (
    <div>
      <div className="flex flex-col bg-white text-black
      min-w-[240px] sm:max-w-[240px] min-h-[240px] justify-center
  ring-1 ring-black ring-opacity-5 rounded-3xl overflow-hidden p-5
  shadow-drizzle
  ">
        <label className="block w-full text-center text-[60px]">{emoji}</label>
        <label className="block w-full mt-5 text-center text-lg font-bold font-flow">{description}</label>
        <label className="block w-full text-center mt-1 text-2xl font-bold font-flow">{amount}</label>
        <button
          type="button"
          className={classNames(
            (isPreview || (user && user.loggedIn && !isClaimable(claimStatus))) ? "bg-disabled-gray" :
              (transactionInProgress ? "bg-drizzle-green/60" : "bg-drizzle-green hover:bg-drizzle-green-dark"),
            `mt-5 h-[48px] text-base font-medium shadow-sm text-black rounded-2xl`
          )}
          disabled={isPreview || (user && user.loggedIn && !isClaimable(claimStatus)) || transactionInProgress}
          onClick={async () => {
            if (!user || !user.loggedIn) {
              fcl.authenticate()
              return
            }

            if (isPreview || !isClaimable(claimStatus) || !raffle) {
              return
            }

            console.log("YES")

            // const res = await claim(drop.dropID, host, tokenInfo,
            //   setTransactionInProgress,
            //   setTransactionStatus)

            // if (res && res.status === 4 && res.statusCode === 0) {
            //   const claimedEvent = res.events.find((e) => e.type.includes("DropClaimed"))
            //   if (claimedEvent && claimedEvent.data.amount) {
            //     const claimedAmountInfo = `${new Decimal(claimedEvent.data.amount).toString()} ${symbol}`
            //     setClaimedAmountInfo(claimedAmountInfo)
            //     setShowClaimedModal(true)
            //   }
            // } 

            // mutate(["claimStatusFetcher", drop.dropID, host, user && user.addr])
            // mutate(["dropFetcher", drop.dropID, host])
          }}
        >
          {title}
        </button>
      </div>
    </div>
  )
}