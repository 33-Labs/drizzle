import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import { Combobox } from '@headlessui/react'

import { queryBalance } from '../lib/scripts'
import Decimal from 'decimal.js';

import { TokenListProvider, ENV, Strategy } from 'flow-native-token-registry';
import publicConfig from '../publicConfig.js'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function TokenSelector(props) {
  const [query, setQuery] = useState('')
  const [selectedToken, setSelectedToken] = useState()
  const [balance, setBalance] = useState(new Decimal(0))
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    let env = ENV.Mainnet
    if (publicConfig.chainEnv == 'testnet') {
      env = ENV.Testnet
    }

    new TokenListProvider().resolve(Strategy.CDN, env).then(tokens => {
      const tokenList = tokens.getList().map((token) => {
        token.id = `${token.address}.${token.contractName}`
        return token
      })
      setTokens(tokenList)
    })
  }, [setTokens])

  const filteredTokens =
    query === ''
      ? tokens
      : tokens.filter((token) => {
          const content = `${token.name} (${token.symbol})`
          return content.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <Combobox as="div" className={props.className} value={props.user && props.user.loggedIn && selectedToken} onChange={async (token) => {
      if (props.user && props.user.loggedIn) {
        setBalance(new Decimal(0))
        queryBalance(token, props.user.addr).then((balance) => {
          setBalance(new Decimal(balance))
          if (props.onBalanceFetched) {
            props.onBalanceFetched(balance)
          }
        })
  
        setSelectedToken(token)
        props.onTokenSelected(token)
      }
    }}>
      <Combobox.Label className="block text-2xl font-flow font-bold">Token</Combobox.Label>
      {props.user && props.user.loggedIn ? (selectedToken 
        ? <Combobox.Label className="block text-md font-flow leading-6 mt-2 mb-2">Your balance is {balance.toString()} {selectedToken.symbol}</Combobox.Label>
        : <Combobox.Label className="block text-md font-flow leading-6 mt-2 mb-2">Select the token to transfer</Combobox.Label>
      ) : <Combobox.Label className="block text-md font-flow leading-6 mt-2 mb-2">Connect wallet to select token</Combobox.Label>
      }
      <div className="relative mt-1">
        <Combobox.Input
          className="w-full h-[50px] text-lg font-flow border border-drizzle-green bg-drizzle-green/10 py-2 pl-3 pr-10  focus:border-drizzle-green-dark focus:outline-none focus:ring-1 focus:ring-drizzle-green-dark"
          onChange={(event) => {
            setQuery(event.target.value)
          }}
          displayValue={(token) => token && `${token.name} (${token.symbol})`}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {filteredTokens.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto  bg-white py-1 text-lg shadow-lg ring-1 ring-drizzle-green-dark ring-opacity-5 focus:outline-none">
            {filteredTokens.map((token) => (
              <Combobox.Option
                key={token.id}
                value={token}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-drizzle-green/50' : 'text-black'
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex items-center">
                      <div className="w-6 h-6 relative">
                        <Image src={token.logoURI} alt="" layout="fill" objectFit="cover" className="rounded-full" />
                      </div>
                      <span className={classNames('ml-3 truncate', selected && 'font-semibold')}>{`${token.name} (${token.symbol})`}</span>
                    </div>

                    {selected && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-black' : 'text-drizzle-green-dark'
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  )
}
