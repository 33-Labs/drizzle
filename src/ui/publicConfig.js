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

const floatURL = process.env.NEXT_PUBLIC_FLOAT_URL
if (!floatURL) throw "Missing NEXT_PUBLIC_FLOAT_URL"

const fungibleTokenAddress = process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS
if (!fungibleTokenAddress) throw "Missing NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS"

const nonFungibleTokenAddress = process.env.NEXT_PUBLIC_NON_FUNGIBLE_TOKEN_ADDRESS
if (!nonFungibleTokenAddress) throw "Missing NEXT_PUBLIC_NON_FUNGIBLE_TOKEN_ADDRESS"

const metadataViewsAddress = process.env.NEXT_PUBLIC_METADATA_VIEWS_ADDRESS
if (!metadataViewsAddress) throw "Missing NEXT_PUBLIC_METADATA_VIEWS_ADDRESS"

const flowTokenAddress = process.env.NEXT_PUBLIC_FLOW_TOKEN_ADDRESS
if (!flowTokenAddress) throw "Missing NEXT_PUBLIC_FLOW_TOKEN_ADDRESS"

const cloudAddress = process.env.NEXT_PUBLIC_CLOUD_ADDRESS
if (!cloudAddress) throw "Missing NEXT_PUBLIC_CLOUD_ADDRESS"

const mistAddress = process.env.NEXT_PUBLIC_MIST_ADDRESS
if (!mistAddress) throw "Missing NEXT_PUBLIC_MIST_ADDRESS"

const eligibilityVerifiersAddress = process.env.NEXT_PUBLIC_ELIGIBILITY_VERIFIERS_ADDRESS
if (!eligibilityVerifiersAddress) throw "Missing NEXT_PUBLIC_ELIGIBILITY_VERIFIERS_ADDRESS"

const distributorsAddress = process.env.NEXT_PUBLIC_DISTRIBUTORS_ADDRESS
if (!distributorsAddress) throw "Missing NEXT_PUBLIC_DISTRIBUTORS_ADDRESS"

const drizzleRecorderAddress = process.env.NEXT_PUBLIC_DRIZZLE_RECORDER_ADDRESS
if (!drizzleRecorderAddress) throw "Missing NEXT_PUBLIC_DRIZZLE_RECORDER_ADDRESS"

const domainUtilsAddress = process.env.NEXT_PUBLIC_DOMAIN_UTILS_ADDRESS
if (!domainUtilsAddress) throw "Missing NEXT_PUBLIC_DOMAIN_UTILS_ADDRESS"

const floatAddress = process.env.NEXT_PUBLIC_FLOAT_ADDRESS
if (!floatAddress) throw "Missing NEXT_PUBLIC_FLOAT_ADDRESS"

const bannerSizeLimit = 500000

const flownsAddress = process.env.NEXT_PUBLIC_FLOWNS_ADDRESS
if (!flownsAddress) throw "Missing NEXT_PUBLIC_FLOWNS_ADDRESS"

const domainsAddress = process.env.NEXT_PUBLIC_DOMAINS_ADDRESS
if (!domainsAddress) throw "Missing NEXT_PUBLIC_DOMAINS_ADDRESS"

const findAddress = process.env.NEXT_PUBLIC_FIND_ADDRESS
if (!findAddress) throw "Missing NEXT_PUBLIC_FIND_ADDRESS"

const publicConfig = {
  chainEnv,
  accessNodeAPI,
  appURL,
  walletDiscovery,
  flowscanURL,
  fungibleTokenAddress,
  nonFungibleTokenAddress,
  metadataViewsAddress,
  flowTokenAddress,
  cloudAddress,
  mistAddress,
  drizzleRecorderAddress,
  eligibilityVerifiersAddress,
  distributorsAddress,
  domainUtilsAddress,
  floatAddress,
  flownsAddress,
  domainsAddress,
  findAddress,
  floatURL,
  bannerSizeLimit
}

export default publicConfig
