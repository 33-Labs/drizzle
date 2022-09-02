import { config } from "@onflow/fcl"
import publicConfig from "../publicConfig"
import {send as httpSend} from "@onflow/transport-http"

config({
  "accessNode.api": publicConfig.accessNodeAPI,
  "discovery.wallet": publicConfig.walletDiscovery,
  "sdk.transport": httpSend,
  "app.detail.title": "drizzle",
  "app.detail.icon": "https://www.drizzle33.app/_next/image?url=%2Fdrizzle.png&w=128&q=75"
})