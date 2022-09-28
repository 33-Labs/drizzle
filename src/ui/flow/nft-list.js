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
    name: "Flovatar",
    nftType: "A.921ea449dffec68a.Flovatar.NFT",
    contractName: "Flovatar",
    contractAddress: "0x921ea449dffec68a",
    collectionType: {
      type: "A.921ea449dffec68a.Flovatar.Collection",
      restrictions: [
        "A.921ea449dffec68a.Flovatar.CollectionPublic",
        "A.1d7e57aa55817448.NonFungibleToken.CollectionPublic",
        "A.1d7e57aa55817448.NonFungibleToken.Receiver",
        "A.1d7e57aa55817448.MetadataViews.ResolverCollection"
      ]
    },
    logoURL: "/flovatar.jpeg",
    collectionPublicPath: "/public/FlovatarCollection",
    collectionStoragePath: "/storage/FlovatarCollection"
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
    logoURL: "/flovatar.jpeg",
    collectionPublicPath: "/public/FlovatarComponentCollection",
    collectionStoragePath: "/storage/FlovatarComponentCollection"
  },
  {
    name: "Geeft",
    nftType: "A.80ec5732ee129467.Geeft.NFT",
    contractName: "Geeft",
    contractAddress: "0x80ec5732ee129467",
    collectionType: {
      type: "A.80ec5732ee129467.Geeft.Collection",
      restrictions: [
        "A.80ec5732ee129467.Geeft.CollectionPublic",
        "A.1d7e57aa55817448.NonFungibleToken.CollectionPublic",
        "A.1d7e57aa55817448.NonFungibleToken.Receiver",
        "A.1d7e57aa55817448.MetadataViews.ResolverCollection"
      ]
    },
    logoURL: "/geeft.png",
    collectionPublicPath: "/public/GeeftCollection",
    collectionStoragePath: "/storage/GeeftCollection"
  },
  {
    name: "Driverz",
    nftType: "A.a039bd7d55a96c0c.DriverzNFT.NFT",
    contractName: "Driverz",
    contractAddress: "0xa039bd7d55a96c0c",
    collectionType: {
      type: "A.a039bd7d55a96c0c.DriverzNFT.Collection",
      restrictions: [
        "A.a039bd7d55a96c0c.DriverzNFT.CollectionPublic",
        "A.1d7e57aa55817448.NonFungibleToken.CollectionPublic",
        "A.1d7e57aa55817448.NonFungibleToken.Receiver",
        "A.1d7e57aa55817448.MetadataViews.ResolverCollection"
      ]
    },
    logoURL: "/driverz.png",
    collectionPublicPath: "/public/DriverzNFTCollection",
    collectionStoragePath: "/storage/DriverzNFTCollection"
  }, 
  {
    name: "NBATopShot",
    nftType: "A.0b2a3299cc857e29.TopShot.NFT",
    contractName: "TopShot",
    contractAddress: "0x0b2a3299cc857e29",
    collectionType: {
      type: "A.0b2a3299cc857e29.TopShot.Collection",
      restrictions: [
        "A.0b2a3299cc857e29.TopShot.MomentCollectionPublic",
        "A.1d7e57aa55817448.NonFungibleToken.CollectionPublic",
        "A.1d7e57aa55817448.NonFungibleToken.Receiver",
        "A.1d7e57aa55817448.MetadataViews.ResolverCollection"
      ]
    },
    logoURL: "/topshot.png",
    collectionPublicPath: "/public/MomentCollection",
    collectionStoragePath: "/storage/MomentCollection"
  }
  // {
  //   name: "StarlyCard",
  //   nftType: "A.5b82f21c0edf76e3.StarlyCard.NFT",
  //   contractName: "StarlyCard",
  //   contractAddress: "0x5b82f21c0edf76e3",
  //   collectionType: {
  //     type: "A.5b82f21c0edf76e3.StarlyCard.Collection",
  //     restrictions: [
  //       "A.5b82f21c0edf76e3.StarlyCard.StarlyCardCollectionPublic",
  //       "A.1d7e57aa55817448.NonFungibleToken.CollectionPublic",
  //       "A.1d7e57aa55817448.NonFungibleToken.Receiver",
  //       "A.1d7e57aa55817448.MetadataViews.ResolverCollection"
  //     ]
  //   },
  //   logoURL: "/starly.jpeg",
  //   collectionPublicPath: "/public/starlyCardCollection",
  //   collectionStoragePath: "/storage/starlyCardCollection"
  // }
]