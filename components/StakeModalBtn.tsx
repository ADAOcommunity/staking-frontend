import { useState } from "react";
import UseAnimations from 'react-useanimations';
import alertTriangle from 'react-useanimations/lib/alertTriangle'
import loading from 'react-useanimations/lib/loading'
import success from 'react-useanimations/lib/checkmark'
import initializeLucid from "../util/lucid";
import { useStoreState } from "../util/store";
import { Assets} from 'lucid-cardano'
import { DEPOSIT_DATUM_HASH } from "../util/sc";

type ActionState = "loading" | "success" | "error"
export default function StakeModalBtn({ actionName, enabled, stakingUnit, contractAddress, action }: { actionName: string, enabled: boolean, stakingUnit: string , contractAddress: string, action: (assets: Assets | null) => Promise<any> }) {
    const [tokenAmount, setTokenAmount] = useState(0);
    const [state, setState] = useState<ActionState>()
    const [msg, setMsg] = useState("")
    const walletEnabled = useStoreState(state => state.wallet.connected);
    const walletName = useStoreState(state => state.wallet.name);
    const pkhStore = useStoreState(state => state.pkh)
    const [usersLpTokens, setUsersLpTokens] = useState(0);

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
    
    const loadAvailableAmountDeposit = async () => {
        if(!walletEnabled || !walletName) return
        setMsg("")
        setState('loading')
        setMsg("Waiting...")
        try {
            const Lucid = await initializeLucid(walletName)
            let total: bigint = 0n;
            const utxos = await Lucid.utxosAtWithUnit(Lucid.wallet.address, stakingUnit)
            utxos.forEach(u => total += (u.assets[stakingUnit] as bigint))
            const totalN = BigInt(total.toString()) as bigint /// divide by decimals
            setTokenAmount(Number((totalN / BigInt(2) as bigint).toString()))
            setUsersLpTokens(Number((totalN).toString()))
            setMsg("")
            setState(undefined)
        } catch (err: any) {
            setMsg("")
            setState('error')
            console.log(JSON.stringify(err))
            setMsg(`Error: ${err.info || err.message || err || ''}`)
        }
    }

    const loadAvailableAmountWithdraw = async () => {
        if(!walletEnabled || !walletName) return
        setMsg("")
        setState('loading')
        setMsg("Waiting...")
        try {
            const Lucid = await initializeLucid(walletName)
            let total: bigint = 0n;
            const utxos = await Lucid.utxosAtWithUnit(contractAddress, stakingUnit)
            const pkh = pkhStore
            if(!pkh) throw 'No key hash for a user, try connecting your wallet again'
            const ownedUtxos = utxos.filter((u) => {
                return u.datumHash == DEPOSIT_DATUM_HASH(
                    pkh
                ).to_hex()
            });
            ownedUtxos.forEach(u => total += (u.assets[stakingUnit] as bigint))
            const totalN = BigInt(total.toString()) as bigint /// divide by decimals
            setTokenAmount(Number((totalN / BigInt(2) as bigint).toString()))
            setUsersLpTokens(Number((totalN).toString()))
            setMsg("")
            setState(undefined)
        } catch (err: any) {
            setMsg("")
            setState('error')
            console.log(JSON.stringify(err))
            setMsg(`Error: ${err.info || err.message || err || ''}`)
        }
    }

    return (
        <>
            {enabled ? 
                <label htmlFor={`${actionName}-modal`} className="btn btn-sm mr-1 modal-button">{actionName}</label> :
                <button disabled className="btn btn-sm mr-1 modal-button">{actionName}</button>
            }
            <input type="checkbox" id={`${actionName}-modal`} onChange={(e) => {
                if(e.target.checked){
                    if (actionName == 'Withdraw') {
                        loadAvailableAmountWithdraw()
                    } else if(actionName == 'Deposit') {
                        loadAvailableAmountDeposit()
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
                            <h3 className="text-lg font-bold mx-auto">{msg}</h3>
                        </>
                        :
                        <>
                            <h3 className="text-lg font-bold">ADAO/ADA LP token amount</h3>
                            <input 
                                type="number"
                                placeholder="Amount"
                                max={usersLpTokens}
                                value={tokenAmount}
                                onChange={e => setTokenAmount(Number(e.target.value))}
                                className="input mx-auto input-bordered w-full center mt-12 bg-transparent max-w-xs"/>
                            <br/>
                            <input type="range" className="range max-w-lg mx-auto my-12" min={0} max={usersLpTokens} value={tokenAmount} onChange={e => setTokenAmount(Number(e.target.value))}/>
                            <button 
                                className="btn btn-outline text-neutral-content ml-auto max-w-xs"
                                disabled={!enabled}
                                onClick={(e) => {
                                        e.preventDefault()
                                        let assets: any = null
                                        if (actionName != 'Withdraw' || tokenAmount !== usersLpTokens) {
                                            assets = {[stakingUnit]: BigInt(tokenAmount)}
                                        } 
                                        doAction(
                                            action(assets)
                                        )
                                    }
                                } 
                            >
                                {actionName}
                            </button>
                        </>
                    }
                </label>
            </label>
        </>
    )
}
