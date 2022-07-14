import Image from 'next/image';
import { C } from 'lucid-cardano';
import { Tx, TxComplete } from 'lucid-cardano';
import { Address, Assets, PaymentKeyHash, toHex, UTxO } from 'lucid-cardano';
import { API_URL } from '../resources/apiUrl'
import StakeModalBtn from './StakeModalBtn';
import ActionModalBtn from './ActionModalBtn';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useStoreState } from '../util/store'
import initializeLucid from '../util/lucid';
import usePoolData from '../util/usePoolData';
import { StakingPoolInfo } from '../types';
import { DEPOSIT_DATUM, addAssets, getStakingAddress, PUB_KEY_LABEL, searchStakes, subAssetsFromUtxos, WITHDRAW } from '../util/sc';
import NftStakeModalBtn from './NftStakeModalBtn';


type HarvestReqBody = {
    poolIndex: number,
    address: string
}

export default function StakingPool({ stakingPoolInfo }: { stakingPoolInfo: StakingPoolInfo }) {
    const userInfo = stakingPoolInfo.userInfo
    const poolInfo = stakingPoolInfo.poolInfo
    const walletEnabled = useStoreState(state => state.wallet.connected);
    const walletName = useStoreState(state => state.wallet.name);
    const pkhStore = useStoreState(state => state.pkh)

    const { totalStaked, totalStakers, userStaked, pendingRewards, estimatedPerEpochRewards, load }
        = usePoolData(poolInfo.script.script, poolInfo.oldScript.script, BigInt(poolInfo.rewardPerEpochQt/1000000), poolInfo.stakingUnit, poolInfo.stakingPolicy, poolInfo.harvestUnit, poolInfo.poolIndex)
    
    const poolI = poolInfo.poolIndex != null ? poolInfo.poolIndex : -1
    

    const awaitTx = async (txhash: string) => {
        const loadedLucid = await initializeLucid(await window.cardano[walletName].enable())
        if(await loadedLucid.awaitTx(txhash)) load()
    }
    const deposit = async (value: Assets | null) => {
        await initializeLucid(await window.cardano[walletName].enable())
        const pkh = pkhStore
        if(!value) throw 'No assets chosen for deposit'
        if (!pkh) throw 'No key hash for a user, try connecting your wallet again'
        let tx: TxComplete
        tx = await depositTx(pkh, value);

        const signedTx = await (tx.sign()).complete();

        const txhash = await signedTx.submit();
        awaitTx(txhash)
        return txhash
    }
    const withdraw = async (value: Assets | null) => {
        return withdrawAct(false, value)
    }
    const harvest = async () => {
        const loadedLucid = await initializeLucid(await window.cardano[walletName].enable())
        console.log(`About to call /api/${stakingPoolInfo.poolInfo.poolIndex}/${await loadedLucid.wallet.address()}/harvestTx`)
        let b : HarvestReqBody = {
            poolIndex: stakingPoolInfo.poolInfo.poolIndex,
            address: await loadedLucid.wallet.address()
        }
        let txHex = null
        let res = null
        try {
            const tmp = await fetch(`${API_URL}/harvestTx`, {
                method: 'POST',
                body: JSON.stringify(b)
            })
            console.log(tmp)
            res = await tmp.json()
        } catch (e) {
            throw e
        }

        console.log(res)
        if(!res || !res.txHex) throw res.error ? res.error : ""
        txHex = Buffer.from(res.txHex, 'hex').toString('hex')
            
        console.log("About to signTx as user.")
        let sig:any;
        try {
            console.log(txHex)
            sig = await signTx(txHex)
        } catch (e) {
            throw `Wallet didn't sign the transaction.`
        }
        console.log(`About to call /api/0/${await loadedLucid.wallet.address()}/${sig}`)
        const rawResponse = await fetch(`${API_URL}/submit`, {
            method: 'POST',
            body: JSON.stringify({poolIndex: poolI, address: await loadedLucid.wallet.address(), txHex: txHex, signatureHex: sig})
        });
        console.log('rawResponse')
        console.log(rawResponse)
        let txHash = await rawResponse.json()
        awaitTx(txHash.transactionId)
        return txHash.transactionId;
    }
    const signTx = async (txCbor: string) => {
        const api = await window.cardano[walletName].enable();
        console.log("Signing the tx")
        let witness: any = await api.signTx(txCbor, true);
        console.log("Witness created")
        return witness;
    }
    const withdrawAct = async (harvest: boolean, value: Assets | null = null) => {
        const loadedLucid = await initializeLucid(await window.cardano[walletName].enable())
        const pkh = pkhStore
        if (!pkh) throw 'No key hash for a user, try connecting your wallet again'

        let utxos1 = await searchStakes(pkh, await loadedLucid.utxosAt(stakingAddress))
	let utxos2 = await searchStakes(pkh, await loadedLucid.utxosAt(stakingAddress2))
	let utxos = utxos1.concat(utxos2)
        if (!utxos || utxos.length < 1) throw harvest ? 'Nothing to harvest' : 'Nothing to withdraw'
	let contract = 0
	if (utxos1 && utxos1.length > 0) {
	    if (utxos2 && utxos2.length > 0) {
	        contract = 3
	    } else {
	        contract = 1
	    }
	} else {
	    if (utxos2 && utxos2.length > 0) {
	        contract = 2
	    } else {
	        contract = 3
	    }
	}

        utxos = utxos.map((utxo) => {
            // for each utxo the user owns we add the datum for this user in the transaction.
            utxo.datum = DEPOSIT_DATUM(pkh);
            return utxo
        })
	console.log("Right before txCreation for withdraw")

        const tx: TxComplete = await withdrawTx(utxos, await loadedLucid.wallet.address(), pkh, harvest, value, contract);

        const signedTx = await (tx.sign()).complete();

        const txhash = await signedTx.submit();
        awaitTx(txhash)
        return txhash
    }

    const stakingScript = poolInfo.script
    const stakingScript2 = poolInfo.oldScript

    const stakingAddress: Address = getStakingAddress(poolInfo.script.script)
    const stakingAddress2: Address = getStakingAddress(poolInfo.oldScript.script)

    async function withdrawTx(utxos: UTxO[], ad: string, pk: PaymentKeyHash, onlyCollect: boolean, withdrawValue: Assets | null, contract: number = 1): Promise<TxComplete> {
        const lucid = await initializeLucid(await window.cardano[walletName].enable())
        let tx = new Tx(lucid)
            .collectFrom(utxos, WITHDRAW())
	console.log(contract)
	if (contract == 1) {
	    tx = tx.attachSpendingValidator(stakingScript)
	} else if (contract == 2) {
	    tx = tx.attachSpendingValidator(stakingScript2)
	} else {
	    tx = tx.attachSpendingValidator(stakingScript).attachSpendingValidator(stakingScript2)
	}
        tx = tx.addSigner(ad)

           console.log('withdrawTx') 
           console.log(utxos, ad, pk, onlyCollect, withdrawValue) 

        if (onlyCollect) {
            let total: bigint = 0n;
            utxos.forEach(u => total += (u.assets[poolInfo.harvestUnit] as bigint))
            const asset: Assets = {}
            asset[poolInfo.harvestUnit] = total;
            const returnToContract = subAssetsFromUtxos(utxos, asset)
            tx = tx
                .payToContract(stakingAddress, DEPOSIT_DATUM(pk), returnToContract)
                .attachMetadataWithConversion(PUB_KEY_LABEL, { 0: pk })
        } else if (withdrawValue) {
            const returnToContract = subAssetsFromUtxos(utxos, withdrawValue)
            tx = tx
                .payToContract(stakingAddress, DEPOSIT_DATUM(pk), returnToContract)
                .attachMetadataWithConversion(PUB_KEY_LABEL, { 0: pk })
        }
	console.log("About to complete")

        const complTx = await tx.complete();
        /*console.log(
            Buffer.from(
                complTx.txComplete.to_bytes()
            ).toString('hex')
        );*/
        return complTx;
    }

    async function depositTx(pkhf: string, value: Assets) {
        const lucid = await initializeLucid(await window.cardano[walletName].enable())
	let utxosAt = await lucid.utxosAt(stakingAddress2)
	let utxos2 = await searchStakes(pkhf, utxosAt)
	console.log(utxos2.length)
	let tx = new Tx(lucid)
	utxos2 = utxos2.map((utxo) => {
            // for each utxo the user owns we add the datum for this user in the transaction.
            utxo.datum = DEPOSIT_DATUM(pkhf);
            return utxo
        })
	console.log("Test here")
	let newVal : Assets = value
	if (utxos2 && utxos2.length > 0) {
	    tx = tx.collectFrom(utxos2, WITHDRAW())
		.attachSpendingValidator(stakingScript2)
		.addSigner(await lucid.wallet.address())
	    let tempVal = subAssetsFromUtxos(utxos2, {})
	    console.log(tempVal)
	    newVal = addAssets(newVal, tempVal)
	}
	console.log("After")
	tx = tx.attachMetadataWithConversion(PUB_KEY_LABEL, { 0: pkhf })
            .payToAddress(poolInfo.distAddress, {'lovelace': 1500000n})
            .payToContract(stakingAddress, DEPOSIT_DATUM(pkhf), newVal)
	console.log("Uh Oh")
	return await tx.complete()
    }

    const copyToClipboard = (str: string) => {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText)
            return navigator.clipboard.writeText(str);
        return Promise.reject('The Clipboard API is not available.');
    };
    return (
        <div className="card bg-base-100 shadow-xl my-2">
            <div className="min-w-full grid grid-cols-2">
                <div className='text-left p-6'>Total {poolInfo.rewardPerEpochQt/1000000} {poolInfo.reward}</div>
                <div className='grid justify-items-end p-6'>
                    <div className={`w-90 grid grid-cols-${estimatedPerEpochRewards ? 1 : 2}`}>
                        Estimated {userInfo.rewardType} per epoch: {estimatedPerEpochRewards || <Skeleton className='ml-2' baseColor='#2A4B89' />}
                    </div>
                </div>
            </div>
            <div className="card-body min-w-full mt-0 pt-0 grid grid-cols-1 md:grid-cols-3">
                <div>
                    <Image width={126} height={126} src={poolInfo.imageSrc} />
                </div>
                <div>
                    <h2 className="card-title">{poolInfo.name}</h2>
                    <p>Staked: {totalStaked || <Skeleton width={'50%'} baseColor='currentColor' />}</p>
                    <p>Stakers: {totalStakers || <Skeleton width={'50%'} baseColor='currentColor' />}</p>
                    <div className='pt-1'>
                        Contract Address
                        <button onClick={() => copyToClipboard(getStakingAddress(poolInfo.script.script))} className='btn btn-ghost btn-circle'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <a target={'_blank'} href={`https://cardanoscan.io/address/${getStakingAddress(poolInfo.script.script)}`} className='btn btn-ghost btn-circle'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>
                <div className="card-actions justify-end">
                    <div className="stats bg-secondary min-w-full text-base-100 grid grid-rows-2 md:grid-rows-1 md:grid-cols-2">
                        <div className="stat">
                            <div className="stat-title">{userInfo.rewardType} Pending Reward</div>
                            <div className="stat-value">{
                                !pendingRewards ? 
                                    <Skeleton baseColor='#2A4B89' /> 
                                        : pendingRewards.toString().split('.').length === 2 ?
                                            <div className='flex'>{pendingRewards.toString().split('.')[0]}<p className='text-xs mt-auto'>.{pendingRewards.toString().split('.')[1]}</p></div> :
                                            pendingRewards}</div>
                            <div className="stat-actions">
                                <ActionModalBtn action={harvest} contractAddress={stakingAddress} enabled={walletEnabled} actionName="Harvest" />
                            </div>
                        </div>
                        <div className="stat">
                            <div className="stat-title">Staked</div>
                            <div className="stat-value">{userStaked || <Skeleton baseColor='#2A4B89' />}</div>
                            <div className="stat-actions">
                                { poolInfo.type === 'NFT' ?  <>
                                        <NftStakeModalBtn
                                            contractAddress={stakingAddress}
                                            policyid={poolInfo.stakingPolicy ? poolInfo.stakingPolicy : ''}
                                            enabled={walletEnabled}
                                            action={withdraw}
                                            actionName="Withdraw"
                                        />
                                        <NftStakeModalBtn
                                            contractAddress={stakingAddress}
                                            policyid={poolInfo.stakingPolicy ? poolInfo.stakingPolicy : ''}
                                            enabled={walletEnabled}
                                            action={deposit}
                                            actionName="Deposit"
                                        />
                                    </>
                                    : <>
                                        <StakeModalBtn
                                            contractAddress={stakingAddress}
					    contractAddress2={stakingAddress2}
                                            stakingUnit={poolInfo.stakingUnit ? poolInfo.stakingUnit : ''}
                                            enabled={walletEnabled}
                                            action={withdraw}
                                            actionName="Withdraw"
                                        />
                                        <StakeModalBtn
                                            contractAddress={stakingAddress}
					    contractAddress2={stakingAddress2}
                                            stakingUnit={poolInfo.stakingUnit ? poolInfo.stakingUnit : ''}
                                            enabled={walletEnabled}
                                            action={deposit}
                                            actionName="Deposit"
                                        /> 
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

