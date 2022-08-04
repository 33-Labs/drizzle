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
      type: "A.0afe396ebc8eee65.FLOAT.Collection",
      restrictions: [
        "A.0afe396ebc8eee65.FLOAT.CollectionPublic",
        "A.631e88ae7f1d7c20.NonFungibleToken.CollectionPublic",
        "A.631e88ae7f1d7c20.NonFungibleToken.Receiver",
        "A.631e88ae7f1d7c20.MetadataViews.ResolverCollection"
      ]
    },
    collectionPublicPath: "/public/FLOATCollectionPublicPath",
    collectionStoragePath: "/storage/FLOATCollectionStoragePath"
  },
  {
    displayName: "Example",
    logoURI: "/float.png",
    contractName: "ExampleNFT",
    contractAddress: "0x257c27ba4951541d",
    collectionType: {
      type: "A.257c27ba4951541d.ExampleNFT.Collection",
      restrictions: [
        "A.257c27ba4951541d.ExampleNFT.ExampleNFTCollectionPublic",
        "A.631e88ae7f1d7c20.NonFungibleToken.CollectionPublic",
        "A.631e88ae7f1d7c20.MetadataViews.ResolverCollection"
      ]
    },
    collectionPublicPath: "/public/exampleNFTCollection",
    collectionStoragePath: "/storage/exampleNFTCollection"
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