const BulletP = ({ content }) => {
  return (
    <div className="flex">
      <div className="w-5 shrink-0">&#8226;</div>
      <p className="leading-7 font-flow text-black text-base font-medium">{content}</p>
    </div>
  )
}

export default function About(props) {
  const h1 = "font-flow text-black font-bold text-2xl"
  const p = "leading-7 font-flow text-black text-base font-medium"
  return (
    <div className="container mx-auto max-w-[880px] min-w-[380px] px-6">
      <h1 className={h1}>Well, What’s Drizzle?</h1>
      <p className={p}>Drizzle is an Airdrop Tool <span className="text-drizzle-green">#onFlow</span>! Anyone can use it to create an airdrop (FungibleToken only now) in a minute!</p>
      <br></br>
      <h1 className={h1}>How to use Drizzle?</h1>
      <p className={p}>Create a DROP, share the link to your community, that’s all!</p>
      <p className={p}>With drizzle, you can decide who is eligible for your rewards by using our different modes.</p>

      <div className="flex">
        <div className="w-5 shrink-0">&#8226;</div>
        <p className={p}><span className="font-bold">FLOAT Event.</span> You can limit the eligibility to people who own FLOATs of specific FLOAT Event at the time of the DROP being created.</p>
      </div>

      <div className="flex">
        <div className="w-5 shrink-0">&#8226;</div>
        <p className={p}><span className="font-bold">FLOAT Group.</span> You can also limit the eligibility to people who own FLOATs in a FLOAT Group. You can set a threshold to the number of FLOATs the users should have.</p>
      </div>

      <div className="flex">
        <div className="w-5 shrink-0">&#8226;</div>
        <p className={p}><span className="font-bold">Whitelist.</span> You can upload a whitelist. Only accounts on the whitelist are eligible for rewards.</p>
      </div>

      <div className="flex">
        <div className="w-5 shrink-0">&#8226;</div>
        <p className={p}>And, you can set a capacity to your DROP, which means the DROP is quota-limited.</p>
      </div>

      <p className={p}>For setting the amount of reward, you have two choices as well:</p>
      <div className="flex">
        <div className="w-5 shrink-0">&#8226;</div>
        <p className={p}><span className="font-bold">Identical:</span> All claimers will get identical amount of reward.</p>
      </div>

      <div className="flex">
        <div className="w-5 shrink-0">&#8226;</div>
        <p className={p}><span className="font-bold">Random:</span> The claimers will get a random amount of reward (the range should be from 0.00000001 to (2.0 * available amount / available capacity - 0.00000001)).  To simplify user interaction, a somewhat naive implementation is applied here, and someone might get a higher reward by using “Try & Abort”, so please use it for fun only.</p>
      </div>

      <p className={p}>Besides, we have a “Whitelist With Amount” mode, with which you can set a specific reward amount to each account on the whitelist manually.</p>
      <br></br>
      <h1 className={h1}>Roadmap</h1>
      <p className={p}>More features are to be added soon. (NFT airdrop to be the next one!)</p>
      <br></br>
      <h1 className={h1}>One More Thing?</h1>
      <p className={p}>If you have any suggestion, feel free to contact us (open an issue on our
        <a href="https://github.com/33-Labs/drizzle"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-drizzle-green">
          &nbsp;Github
        </a>) !</p>
      <p className={p}>And…If you need a batch transfer tool <span className="text-drizzle-green">#onFlow</span>, please try
        <a href="https://bayou.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-drizzle-green">
          &nbsp;bayou
        </a>
        !</p>
    </div>
  )
}