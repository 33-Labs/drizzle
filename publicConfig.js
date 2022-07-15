const chainEnv = process.env.NEXT_PUBLIC_CHAIN_ENV
if (!chainEnv) throw "Missing NEXT_PUBLIC_CHAIN_ENV"

const accessNodeAPI = process.env.NEXT_PUBLIC_ACCESS_NODE_API
if (!accessNodeAPI) throw "Missing NEXT_PUBLIC_ACCESS_NODE_API"

const appURL = process.env.NEXT_PUBLIC_APP_URL
if (!appURL) throw "Missing NEXT_PUBLIC_APP_URL"

const walletDiscovery = process.env.NEXT_PUBLIC_WALLET_DISCOVERY
if (!walletDiscovery) throw "Missing NEXT_PUBLIC_WALLET_DISCOVERY"

const flowscanURL = process.env.NEXT_PUBLIC_FLOWSCAN_URL
if (!flowscanURL) throw "Missing NEXT_PUBLIC_FLOWSCAN_URL"

const fungibleTokenAddress = process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS
if (!fungibleTokenAddress) throw "Missing NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS"

const flowTokenAddress = process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS
if (!flowTokenAddress) throw "Missing NEXT_PUBLIC_FLOW_TOKEN_ADDRESS"

const drizzleAddress = process.env.NEXT_PUBLIC_DRIZZLE_ADDRESS
if (!drizzleAddress) throw "Missing NEXT_PUBLIC_DRIZZLE_ADDRESS"

const cloudAddress = process.env.NEXT_PUBLIC_CLOUD_ADDRESS
if (!cloudAddress) throw "Missing NEXT_PUBLIC_CLOUD_ADDRESS"

const eligibilityReviewersAddress = process.env.NEXT_PUBLIC_ELIGIBILITY_REVIEWERS_ADDRESS
if (!eligibilityReviewersAddress) throw "Missing NEXT_PUBLIC_ELIGIBILITY_REVIEWERS_ADDRESS"

const packetsAddress = process.env.NEXT_PUBLIC_PACKETS_ADDRESS
if (!packetsAddress) throw "Missing NEXT_PUBLIC_PACKETS_ADDRESS"

const floatAddress = process.env.NEXT_PUBLIC_FLOAT_ADDRESS
if (!floatAddress) throw "Missing NEXT_PUBLIC_FLOAT_ADDRESS"

const publicConfig = {
  chainEnv,
  accessNodeAPI,
  appURL,
  walletDiscovery,
  flowscanURL,
  fungibleTokenAddress,
  flowTokenAddress,
  drizzleAddress,
  cloudAddress,
  eligibilityReviewersAddress,
  packetsAddress,
  floatAddress
}

export default publicConfig
