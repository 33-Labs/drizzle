import Mist from "../contracts/Mist.cdc"
import ExampleNFT from "../contracts/examplenft/ExampleNFT.cdc"

transaction(raffleID: UInt64, tokenIDs: [UInt64]) {
    let raffle: &Mist.Raffle
    let nftCollectionRef: &ExampleNFT.Collection

    prepare(acct: AuthAccount) {
        let raffleCollection = acct.borrow<&Mist.RaffleCollection>(from: Mist.RaffleCollectionStoragePath)
            ?? panic("Could not borrow raffleCollection")

        self.raffle = raffleCollection.borrowRaffleRef(raffleID: raffleID)!

        self.nftCollectionRef = acct.borrow<&ExampleNFT.Collection>(from: self.raffle.nftInfo.storagePath)
            ?? panic("Could not borrow collection from signer")
    }

    execute {
        for tokenID in tokenIDs {
            let token <- self.nftCollectionRef.withdraw(withdrawID: tokenID)
            self.raffle.deposit(token: <- token)
        }
    }
}