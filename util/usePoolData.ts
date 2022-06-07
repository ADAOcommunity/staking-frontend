import { UTxO } from "lucid-cardano";
import { useEffect, useState } from "react";
import initializeLucid from "./lucid";
import { getAllUtxos, getStakedUnitAmount, getStakedTotalAmount, getStakersCount, getStakingAddress } from "./sc";
import { useStoreState } from "./store";
import { API_URL } from '../resources/apiUrl'

export default function usePoolData(scriptHex: string, perEpochTotal: bigint, stakeUnit: string, harvestUnit: string, poolIndex: number){
    //string '0' shows 0 in UI, Number 0 shows loading skeleton for dynamic values
    const zero = '0' //0
    const [totalStaked, setTotalStaked] = useState<string | 0>(zero)
    const [totalStakers, setTotalStakers] = useState<string | 0>(zero)
    const [userStaked, setUserStaked] = useState<string | 0>(zero)
    const [pendingRewards, setPendingRewards] = useState<string | 0>(zero)
    const [estimatedPerEpochRewards, setEstimatedPerEpochRewards] = useState<string | 0>(zero)
    const walletEnabled = useStoreState(state => state.wallet.connected);
    const walletName = useStoreState(state => state.wallet.name);
    const pkhStore = useStoreState(state => state.pkh)
    
    const contractAddress = getStakingAddress(scriptHex)

    const setLoading = (loading: boolean = true) => {
        const zero = loading ? 0 : '0'
        setTotalStaked(zero)
        setTotalStakers(zero)
        setUserStaked(zero)
        setPendingRewards(zero)
        setEstimatedPerEpochRewards(zero)
    }

    const utxos = async (): Promise<UTxO[]> => {
        return getAllUtxos(walletName, contractAddress)
    }

    const getUserStaked = async (utxos: UTxO[]) => {
        let res: bigint | string = await getStakedUnitAmount(utxos, pkhStore, stakeUnit)
        if(!res) res = '0'
        setUserStaked(res.toString())
    }
    const getTotalStakers = async (utxos: UTxO[]) => {
        let res: number | string = await getStakersCount(utxos)
        if(!res || res === 0) res = '0'
        setTotalStakers(res.toString())
    } 
    const getTotalStaked = async (utxos: UTxO[]) => {
        let res: bigint | string = await getStakedTotalAmount(utxos, stakeUnit)
        if(!res) res = '0'
        setTotalStaked(res.toString())
    }

    const getPendingRewards = async () => {
        let res: bigint | string = ''
        if(walletEnabled) {
            const lib = await initializeLucid(walletName)
            try {
                const rawResponse = await fetch(`${API_URL}/pendingRewards`, {
                    method: 'POST',
                    body: JSON.stringify({poolIndex: poolIndex, address: lib.wallet.address})
                });
                let jRes = await rawResponse.json()
                res = jRes.pendingRewards
            } catch (e) {
                console.log("Failed fetching rewards")
                console.log(e)
            }
        }
        if(!res) res = '0'
        setPendingRewards(res.toString())
    }

    // const getPendingRewards = async (utxos: UTxO[]) => {
    //     let res: bigint | string = await getStakedUnitAmount(utxos, pkhStore, harvestUnit)
    //     if(!res) res = '0'
    //     setPendingRewards(res.toString())
    // }
    
    const estimateEpochRewards = () => {
        return (Number(perEpochTotal.toString()))*(Number(userStaked)/Number(totalStaked))
    }

    const load = async () => {
        setLoading()
        const allUtxos = await utxos()
        getTotalStakers(allUtxos)
        getTotalStaked(allUtxos)
        if (!walletEnabled || !walletName) {
            setUserStaked('0')
            setPendingRewards('0')
            setEstimatedPerEpochRewards('0')
            return 
        }
        const pkh = pkhStore
        if(!pkh) throw 'No key hash for a user, try connecting your wallet again'
        getUserStaked(allUtxos)
        getPendingRewards()
    }

    useEffect(() => {
        if (!walletEnabled || !walletName) return
        if(userStaked && totalStaked){ 
            if(userStaked != '0' && totalStaked != '0') {
                setEstimatedPerEpochRewards(
                    estimateEpochRewards()
                    .toString()
                )
            } else {
                setEstimatedPerEpochRewards('0')
            }
        } 
    }, [userStaked, totalStaked])

    useEffect(() => {
        load()
        return () => setLoading(false)
    }, [pkhStore])

    return {totalStaked, totalStakers, userStaked, pendingRewards, estimatedPerEpochRewards, load }
}