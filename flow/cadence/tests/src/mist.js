import { executeScript, getAccountAddress, mintFlow, sendTransaction, shallPass, shallResolve } from "flow-js-testing"
import { getMistAdmin } from "./common"
import { NFT_mintExampleNFT, NFT_setupExampleNFTCollection } from "./examplenft"

export const mintExampleNFTs = async (recipient) => {
  await NFT_setupExampleNFTCollection(recipient)

  const admin = await getMistAdmin()
  await NFT_mintExampleNFT(admin, recipient)
  await NFT_mintExampleNFT(admin, recipient)
  await NFT_mintExampleNFT(admin, recipient)
}

export const createRaffle = async (signer, params) => {
  const signers = [signer]
  const txName = "mist/create_raffle"
  return await sendTransaction({ name: txName, signers: signers, args: params})
}

export const createExampleNFTRaffle = async (signer, overrides = {}) => {
  const nftInfo = await getExampleNFTInfo()

  const defaultWhitelist = await getDefaultWhitelist()

  const {initFlowAmount, 
    image, url, startAt, endAt,
    registerEndAt, numberOfWinners,
    rewardTokenIDs,
    withWhitelist, whitelist,
    withFloats, threshold, eventIDs, eventHosts,
    withFloatGroup, floatGroupName, floatGroupHost,
    returnErr} = overrides

  const needFloats = withFloats || withFloatGroup
  const creator = await getAccountAddress("FLOATCreator")
  const defaultEventIDs = needFloats ? await FLOAT_getEventIDs(creator) : []
  const defaultEventHosts = needFloats ? [creator, creator, creator] : []

  const defaultFloatGroupName = "GTEST"
  const defaultFloatGroupHost = creator
  
  const args = {
    name: "TEST", 
    description: "Test DROP", 
    image: image || null, url: url || null,
    startAt: startAt || null, endAt: endAt || null,
    registerEndAt: registerEndAt || (new Date()).getTime() / 1000 + 10, 
    numberOfWinners: numberOfWinners || 2,
    nftContractAddress: nftInfo.contractAddress,
    nftContractName: nftInfo.contractName,
    nftDisplayName: nftInfo.displayName, 
    nftCollectionStoragePath: nftInfo.collectionStoragePath, 
    nftCollectionPublicPath: nftInfo.collectionPublicPath,
    rewardTokenIDs: rewardTokenIDs || [],
    withWhitelist: withWhitelist || false, whitelist: whitelist || defaultWhitelist,
    withFloats: withFloats || false, threshold: threshold || 2, eventIDs: eventIDs || defaultEventIDs, eventHosts: eventHosts || defaultEventHosts,
    withFloatGroup: withFloatGroup || false, floatGroupName: floatGroupName || defaultFloatGroupName, floatGroupHost: floatGroupHost || defaultFloatGroupHost
  }

  const flowAmount = initFlowAmount ?? 100.0

  await mintFlow(signer, flowAmount)

  console.log(args)
  const [tx, error] = await createRaffle(signer, Object.values(args))
  if (returnErr === true) {
    return error
  }
  expect(error).toBeNull()
}

// ===== UTILS =====

export const getExampleNFTInfo = async () => {
  return {
    contractAddress: await getMistAdmin(),
    contractName: "ExampleNFT",
    displayName: "Example",
    collectionStoragePath: "exampleNFTCollection", 
    collectionPublicPath: "exampleNFTCollection"
  }
}

export const getDefaultWhitelist = async () => {
  const Bob = await getAccountAddress("Bob")
  const Carl = await getAccountAddress("Carl")
  const Dave = await getAccountAddress("Dave")
  const Emily = await getAccountAddress("Emily")

  return {
    [Bob]: true,
    [Carl]: true,
    [Dave]: true,
    [Emily]: true
  }
}