import DropN from "../contracts/DropN.cdc"
import FungibleToken from "../contracts/FungibleToken.cdc"

transaction() {

    prepare(acct: AuthAccount) {
        acct.unlink(DropN.DropCollectionPublicPath)
        let resource <- acct.load<@AnyResource>(from: DropN.DropCollectionStoragePath)
        destroy resource
    }

    execute {
    }
}