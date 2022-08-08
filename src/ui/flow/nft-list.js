export const NFTList = (network) => {
  if (network === "mainnet") {
    return mainnetNFTList
  }
  return testnetNFTList
}

export const testnetNFTList = [
  {
    name: "FLOAT",
    nftType: "A.0afe396ebc8eee65.FLOAT.NFT",
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
    logoURL: "/float.png",
    collectionPublicPath: "/public/FLOATCollectionPublicPath",
    collectionStoragePath: "/storage/FLOATCollectionStoragePath"
  },
  {
    name: "Example",
    nftType: "A.257c27ba4951541d.ExampleNFT.NFT",
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
    logoURL: "/float.png",
    collectionPublicPath: "/public/exampleNFTCollection",
    collectionStoragePath: "/storage/exampleNFTCollection"
  }
]

export const mainnetNFTList = [
  {
    name: "FLOAT",
    nftType: "A.2d4c3caffbeab845.FLOAT.NFT",
    contractName: "FLOAT",
    contractAddress: "0x2d4c3caffbeab845",
    collectionType: {
      type: "A.2d4c3caffbeab845.FLOAT.Collection",
      restrictions: [
        "A.2d4c3caffbeab845.FLOAT.CollectionPublic",
        "A.1d7e57aa55817448.NonFungibleToken.CollectionPublic",
        "A.1d7e57aa55817448.NonFungibleToken.Receiver",
        "A.1d7e57aa55817448.MetadataViews.ResolverCollection"
      ]
    },
    logoURL: "/float.png",
    collectionPublicPath: "/public/FLOATCollectionPublicPath",
    collectionStoragePath: "/storage/FLOATCollectionStoragePath"
  },
  {
    name: "FlovatarComponent",
    nftType: "A.921ea449dffec68a.FlovatarComponent.NFT",
    contractName: "FlovatarComponent",
    contractAddress: "0x921ea449dffec68a",
    collectionType: {
      type: "A.921ea449dffec68a.FlovatarComponent.Collection",
      restrictions: [
        "A.921ea449dffec68a.FlovatarComponent.CollectionPublic",
        "A.1d7e57aa55817448.NonFungibleToken.CollectionPublic",
        "A.1d7e57aa55817448.NonFungibleToken.Receiver",
        "A.1d7e57aa55817448.MetadataViews.ResolverCollection"
      ]
    },
    logoURL: "/flovatar.png",
    collectionPublicPath: "/public/FlovatarComponentCollection",
    collectionStoragePath: "/storage/FlovatarComponentCollection"
  }
]