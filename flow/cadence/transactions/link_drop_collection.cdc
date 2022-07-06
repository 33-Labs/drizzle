import Drizzle from "../contracts/Drizzle.cdc"
import DropN from "../contracts/DropN.cdc"

transaction() {
    prepare(acct: AuthAccount) {
        acct.link<&DropN.DropCollection{Drizzle.IDropCollectionPublic}>(
            DropN.DropCollectionPublicPath,
            target: DropN.DropCollectionStoragePath
        )
    }
}