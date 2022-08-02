export const NFTList = (network) => {
  if (network === "mainnet") {
    return mainnetNFTList
  }
  return testnetNFTList
}

export const testnetNFTList = [
  {
    displayName: "FLOAT",
    logoURI: "/float.png",
    contractName: "FLOAT",
    contractAddress: "0x0afe396ebc8eee65",
    collectionType: {
      type: "FLOAT.Collection",
      restrictions: [
        "FLOAT.CollectionPublic",
        "NonFungibleToken.CollectionPublic",
        "NonFungibleToken.Receiver",
        "MetadataViews.ResolverCollection"
      ]
    },
    collectionPublicPath: "FLOAT.FLOATCollectionPublicPath",
    collectionStoragePath: "FLOAT.FLOATCollectionStoragePath"
  }
]

export const mainnetNFTList = [
  {
    displayName: "FLOAT",
    logoURI: "/float.png",
    contractName: "FLOAT",
    contractAddress: "0x2d4c3caffbeab845",
    collectionType: {
      type: "FLOAT.Collection",
      restrictions: [
        "FLOAT.CollectionPublic",
        "NonFungibleToken.CollectionPublic",
        "NonFungibleToken.Receiver",
        "MetadataViews.ResolverCollection"
      ]
    },
    collectionPublicPath: "FLOAT.FLOATCollectionPublicPath",
    collectionStoragePath: "FLOAT.FLOATCollectionStoragePath"
  } 
]