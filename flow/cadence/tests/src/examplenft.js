import { executeScript, sendTransaction, shallPass } from "flow-js-testing"

export const setupExampleNFTCollection = async (signer) => {
  const signers = [signer]
  const txName = "examplenft/setup_examplenft_collection"
  const args = []

  await shallPass(sendTransaction({ name: txName, signers: signers, args: args })) 
}

export const getCollectionType = async () => {
  const name = "examplenft/get_collection_type"
  const args = []
  const [result, error] = await executeScript({ name: name, args: args })
  expect(error).toBeNull()
  return result
}