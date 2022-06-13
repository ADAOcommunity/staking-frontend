import { useState } from "react";
import UseAnimations from 'react-useanimations';
import alertTriangle from 'react-useanimations/lib/alertTriangle'
import loading from 'react-useanimations/lib/loading'
import success from 'react-useanimations/lib/checkmark'
import initializeLucid from "../util/lucid";
import { useStoreState } from "../util/store";
import { Assets} from 'lucid-cardano'
import { DEPOSIT_DATUM_HASH } from "../util/sc";
import NftPreview from "./NftPreview";
import { LazyLoadComponent } from 'react-lazy-load-image-component';

type ActionState = "loading" | "success" | "error"
export default function StakeModalBtn({ actionName, enabled, policyid, contractAddress, action }: { actionName: string, enabled: boolean, policyid: string , contractAddress: string, action: (assets: Assets | null) => Promise<any> }) {
    const [availableNftUnits, setNftUnits] = useState<string[]>([])
    const [selectedUnits, setSelectedUnits] = useState<string[]>([])
    const [state, setState] = useState<ActionState>()
    const [msg, setMsg] = useState("")
    const walletEnabled = useStoreState(state => state.wallet.connected)
    const walletName = useStoreState(state => state.wallet.name)
    const pkhStore = useStoreState(state => state.pkh)

    const doAction = async (action: Promise<any>) => {
        setMsg("")
        setState('loading')
        setMsg("Waiting...")
        try{
            const res = await action
            setMsg("")
            setState('success')
            setMsg(`Submitted: ${res}`)
        } catch(err: any) {
            setMsg("")
            setState('error')
            console.log(JSON.stringify(err))
            setMsg(`Error: ${err.info || err.message || err || ''}`)
        }
    }

    const selectNft = (unit: string, select: boolean = true) => {
        if(select) {
            setSelectedUnits(
                [...selectedUnits].concat(unit)
            )
        } else {
            setSelectedUnits(
                [...selectedUnits].filter(val => val !== unit)
            )
        }
    }
    
    const loadAvailableNftsToDeposit = async () => {
        if(!walletEnabled || !walletName) return
        setMsg("")
        setState('loading')
        setMsg("Waiting...")
        try {
            const Lucid = await initializeLucid(walletName)
            const utxos = await Lucid.utxosAt(Lucid.wallet.address)
            let nftUnits: string[] = []
            utxos.forEach(u => 
                Object.keys(u.assets).forEach(unit => { 
                    if(unit.startsWith(policyid)) nftUnits.push(unit) 
                }
            ))
            console.log('nftUnits')
            console.log(nftUnits)
            setNftUnits(nftUnits)
            setMsg("")
            setState(undefined)
        } catch (err: any) {
            setMsg("")
            setState('error')
            console.log(JSON.stringify(err))
            setMsg(`Error: ${err.info || err.message || err || ''}`)
        }
    }

    const loadAvailableNftsToWithdraw = async () => {
        if(!walletEnabled || !walletName) return
        setMsg("")
        setState('loading')
        setMsg("Waiting...")
        try {
            const Lucid = await initializeLucid(walletName)
            const utxos = await Lucid.utxosAt(contractAddress)
            const pkh = pkhStore
            if(!pkh) throw 'No key hash for a user, try connecting your wallet again'
            const ownedUtxos = utxos.filter((u) => {
                return u.datumHash == DEPOSIT_DATUM_HASH(
                    pkh
                ).to_hex()
            })
            let nftUnits: string[] = []
            ownedUtxos.forEach(u => 
                Object.keys(u.assets).forEach(unit => { 
                    if(unit.startsWith(policyid)) nftUnits.push(unit) 
                }
            ))
            setNftUnits(nftUnits)
            setMsg("")
            setState(undefined)
        } catch (err: any) {
            setMsg("")
            setState('error')
            console.log(JSON.stringify(err))
            setMsg(`Error: ${err.info || err.message || err || ''}`)
        }
    }

    // const selectAll = (select: boolean = true) => {
    //     if(select)
    //         setSelectedUnits(availableNftUnits)
    //     else
    //         setSelectedUnits([])
    // }

    return (
        <>
            {enabled ? 
                <label htmlFor={`${actionName}-modal`} className="btn btn-sm mr-1 modal-button">{actionName}</label> :
                <button disabled className="btn btn-sm mr-1 modal-button">{actionName}</button>
            }
            <input type="checkbox" id={`${actionName}-modal`} onChange={(e) => {
                if(e.target.checked){
                    if (actionName == 'Withdraw') {
                        loadAvailableNftsToWithdraw()
                    } else if(actionName == 'Deposit') {
                        loadAvailableNftsToDeposit()
                    }
                } else {
                    setMsg("")
                    setState(undefined)
                }
            }} className="modal-toggle"/>
            <label htmlFor={`${actionName}-modal`} className="modal cursor-pointer">
                <label className="modal-box relative flex flex-col bg-neutral text-neutral-content bg-opacity-95 max-w-4xl" htmlFor="">
                    {msg ? 
                        <>
                            <UseAnimations
                                className="mx-auto"
                                strokeColor="currentColor"
                                size={128}
                                animation={
                                    state === 'loading' ?
                                        loading : state === 'success' ?
                                            success : alertTriangle
                                    }
                            />
                            <h3 className="text-base font-bold mx-auto">{msg}</h3>
                        </>
                        :
                        <>
                            <h3 className="text-lg font-bold">Select NFTs&nbsp;{actionName == 'Withdraw' ? 'to withdraw' : 'to stake'}</h3>
                            <div className="flex-row">
                                {/* <FilterSelect/> */}
                                {/* <SearchInput/> */}
                            </div>
                            <div className="grid grid-cols-3 md:grid-cols-5 scrollbar-thin my-4 scrollbar-thumb-sky-900 scrollbar-track-sky-700 overflow-y-scroll">
                                {availableNftUnits.map((unit, index) => {
                                        return <LazyLoadComponent delayMethod="debounce" delayTime={400}>
                                            <NftPreview unit={unit} key={unit+index} select={selectNft}/>
                                        </LazyLoadComponent>
                                    }
                                )}
                            </div>
                            <div className="flex">
                                {/* <button 
                                    className="btn btn-outline text-neutral-content max-w-xs"
                                    disabled={!enabled}
                                    onClick={(e) => {
                                            e.preventDefault()
                                            let assets: any = null
                                            // if (actionName != 'Withdraw' || tokenAmount !== usersLpTokens) {
                                            //     assets = {[stakingUnit]: BigInt(tokenAmount)}
                                            // } 
                                            doAction(
                                                action(assets)
                                            )
                                        }
                                    } 
                                >
                                    {`Select all`}
                                </button> */}
                                <button 
                                    className="btn btn-outline text-neutral-content ml-auto max-w-xs"
                                    disabled={!enabled}
                                    onClick={(e) => {
                                            e.preventDefault()
                                            let assets: Assets | null = null
                                            if ((actionName === 'Withdraw' && availableNftUnits === selectedUnits) || actionName === 'Deposit') {
                                                const units = 
                                                    actionName === 'Deposit' && (!selectedUnits || selectedUnits.length < 1) ? 
                                                        availableNftUnits : selectedUnits
                                                
                                                assets = {}
                                                units.forEach(unit => {
                                                    if(unit && assets) assets[unit] = BigInt(1)
                                                })
                                            }
                                            doAction(
                                                action(assets)
                                            )
                                        }
                                    } 
                                >
                                    {actionName} {!selectedUnits || selectedUnits.length < 1 ? 'All' : ''}
                                </button>
                            </div>
                        </>
                    }
                </label>
            </label>
        </>
    )
}



// const FilterSelect = (optionValueMap: {[option: string]: string}) => {
//     return (
//         <div className="flex justify-center">
//             <div className="mb-3">
//                 <label className="relative text-gray-400 focus-within:text-gray-600 block">
//                 <select className="form-select 
//                     block
//                     w-full
//                     px-2
//                     py-1.5
//                     text-base
//                     font-normal
//                     text-gray-700
//                     bg-white bg-clip-padding bg-no-repeat
//                     border border-solid border-gray-300
//                     rounded
//                     transition
//                     ease-in-out
//                     m-0
//                     focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" aria-label="Default select example">
//                     <option selected>&nbsp;&nbsp;&nbsp;&nbsp;Filter collection</option>
//                     {Object.keys(optionValueMap).map(option =>
//                         <option value={`${optionValueMap[option]}`}>
//                             &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{option}
//                         </option>
//                     )}
                         
//                 </select>
//                 <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none w-5 h-5 absolute top-1/2 transform -translate-y-1/2 left-1" fill="currentColor">
//                     <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
//                 </svg>
//                 </label>
//             </div>
//         </div>
//     )
// }

const SearchInput = () => {
    return (
        <div className="flex justify-center">
            <div className="mb-3">
                <div className="input-group relative flex items-stretch w-full mb-4 flex-row">
                    <input type="search" placeholder="Search" aria-label="Search" aria-describedby="button-addon3"
                        className="form-control relative flex-auto min-w-0 block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                    <button className="btn inline-block px-6 py-2 border-2 border-blue-600 text-blue-600 font-medium text-xs leading-tight uppercase rounded hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out" type="button" id="button-addon3">Search</button>
                </div>
            </div>
        </div>
    )
}