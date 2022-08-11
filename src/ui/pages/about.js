import publicConfig from "../publicConfig"

export default function About(props) {
  const h1 = "font-flow text-black font-bold text-2xl mb-3"
  const p = "leading-7 font-flow text-black text-base font-medium"
  return (
    <div className="container mx-auto max-w-[920px] min-w-[380px] px-6">
      <h1 className={h1}>What’s Drizzle?</h1>
      <p className={p}>Drizzle is a Token Distribution Tool <span className="text-drizzle-green">#onFlow</span>! Anyone can use it to create a DROP or start an NFT Raffle in a minute!</p>
      <br></br>
      <p className={p}>Token distribution (Airdrop/Raffle etc) is a common need in crypto space now. A project may want to send giveaway to its community; A DAO may need to reward some contributors; A member of a Discord channel may want to distribute some tokens to other members to show appreciation or just to liven up the channel.</p>
      <br></br>
      <p className={p}>Over the past two years, small DAOs are blooming in Web3, and there will be more and more DAOs crowding into the Web3 world, increasing the needs for Token Distribution. But it’s hard for small communities to find experienced smart contract developers to help them to make Token Distribution Tools, and the currently available tools on Flow are not user-friendly enough:</p>
      <br></br>
      <p className={p}>After collecting an access-list by using FLOAT or Hype.Day, you need to run a program locally or use a centralized service to determine how much an account in the access-list should get or who are the winners(well, this is more than just tedious, it is not transparent), and eventually transfer to the eligible accounts or winners one by one, or use bulk transfer tools like&nbsp; 
      <a href="https://bayou33.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black underline font-bold decoration-drizzle-green decoration-2">
          bayou
        </a>.
      </p>
      <br></br>
      <p className={p}>Drizzle aims to make this simple! You can collect your access-list by using&nbsp;
      <a href={publicConfig.floatURL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black underline font-bold decoration-drizzle-green decoration-2">
            FLOAT
        </a> or&nbsp;
        <a href={"https://hype.day"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black underline font-bold decoration-drizzle-green decoration-2">
            hype.day
        </a>, and then create a DROP or NFT Raffle on chain in less than one minute by using Drizzle! <span className="font-bold">Fast & Transparent!</span></p>
      <br></br>
      <h1 className={h1}>So, what’s DROP?</h1>
      <p className={p}>DROP means airdrop in Drizzle. Currently we support the airdrop of FungibleToken only.</p>
      <p className={p}>The main process of a DROP is quite simple:</p>
      <div className="flex">
        <div className="w-5 shrink-0">👉</div>
        <p className={p}>You create a new DROP by setting the basic information, depositing funds, setting the criteria for eligible accounts and token distribution mode, then share the DROP link to your community;</p>
      </div>
      <div className="flex">
        <div className="w-5 shrink-0">👉</div>
        <p className={p}>Community members access the DROP page via the link, check their eligibility and claim the token if they are eligible.</p>
      </div>
      <br></br>
      <p className={p}>To decide who is eligible for your DROP, you can check&nbsp;
      <a href="#eligible"
          rel="noopener noreferrer"
          className="text-black underline font-bold decoration-drizzle-green decoration-2">
            here
        </a>.
      </p>
      <br></br>
      <p className={p}>For setting the amount of reward, you have two choices as well:</p>
      <div className="flex">
        <div className="w-5 shrink-0">👉</div>
        <p className={p}><span className="font-bold">Identical:</span> All claimers will get identical amount of reward.</p>
      </div>
      <div className="flex">
        <div className="w-5 shrink-0">👉</div>
        <p className={p}><span className="font-bold">Random:</span> The claimers will get a random amount of reward (the range should be from 0.00000001 to (2.0 * available amount / available capacity - 0.00000001)).  To simplify user interaction, a somewhat naive implementation is applied here, and someone might get a higher reward by using “Try & Abort”, so please use it for fun only.</p>
      </div>
      <br></br>
      <p className={p}>Besides, we have a “Whitelist With Amount” mode, with which you can set a specific reward amount to each account on the whitelist manually.</p>
      <br></br>
      <h1 className={h1}>What’s NFT Raffle?</h1>
      <p className={p}>NFT Raffle is a way to airdrop NFTs. There are four main stages in an NFT Raffle:</p>
      <div className="flex">
        <div className="w-5 shrink-0">👉</div>
        <p className={p}>You create a new NFT Raffle by setting the basic information, depositing NFTs and setting the criteria for eligible accounts, then share the Raffle link to your community;</p>
      </div>
      <div className="flex">
        <div className="w-5 shrink-0">👉</div>
        <p className={p}>Community members go to the Raffle page, check their eligibility and register for the Raffle if they are eligible;</p>
      </div>
      <div className="flex">
        <div className="w-5 shrink-0">👉</div>
        <p className={p}>Once the registration end, you can draw the winners. For each draw, a winner will be selected randomly from registrants, and an NFT will be picked out randomly from NFTs in the Raffle as the reward for winner;</p>
      </div>
      <div className="flex">
        <div className="w-5 shrink-0">👉</div>
        <p className={p}>Registrants go to the Raffle page to check whether they are winners or not, and claim the reward if they are.</p>
      </div>
      <br></br>
      <p className={p}>To decide who is eligible for your Raffle, you can check&nbsp;
      <a href="#eligible"
          rel="noopener noreferrer"
          className="text-black underline font-bold decoration-drizzle-green decoration-2">
            here
        </a>.
      </p>
      <br></br>
      <h1 className={h1} id="eligible">Who is eligible?</h1>
      <p className={p}>With drizzle, you can decide who is eligible for your rewards by using our different modes.</p>
      <div className="flex">
        <div className="w-5 shrink-0">👉</div>
        <p className={p}>
        <a href={publicConfig.floatURL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black underline font-bold decoration-drizzle-green decoration-2">
            FLOAT Event.
        </a> You can limit the eligibility to people who own FLOATs of specific FLOAT Event at the time of the DROP being created.</p>
      </div>

      <div className="flex">
        <div className="w-5 shrink-0">👉</div>
        <p className={p}>
        <a href={publicConfig.floatURL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black underline font-bold decoration-drizzle-green decoration-2">
            FLOAT Group.
        </a> You can also limit the eligibility to people who own FLOATs in a FLOAT Group. You can set a threshold to the number of FLOATs the users should have.</p>
      </div>
      <div className="flex">
        <div className="w-5 shrink-0">👉</div>
        <p className={p}><span className="font-bold">Whitelist.</span> You can upload a whitelist. Only accounts on the whitelist are eligible for rewards.</p>
      </div>
      <br></br>
      <h1 className={h1}>Roadmap</h1>
      <p className={p}>More features (Merkle DROP, integration with DAO generators like&nbsp;
        <a href={"https://toucans.app"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black underline font-bold decoration-drizzle-green decoration-2">
            Toucans
        </a>, etc) are to be added!</p>
      <br></br>
      <p className={p}>If you have any suggestion, feel free to contact us(check the footer👇)!</p>
      <br></br>
    </div>
  )
}