import { useEffect, useState } from "react"
import initializeLucid from "../util/lucid"
import { C } from 'lucid-cardano'
import { useStoreActions, useStoreState } from '../util/store'
export default function WalletModalBtn() {
    const [availableWallets, setAvailableWallets] = useState<{ nami: boolean, eternl: boolean, flint: boolean }>({ nami: false, eternl: false, flint: false })
    const [connected, setConnected] = useState(false)
    const walletStore = useStoreState(state => state.wallet)
    const setWallet = useStoreActions(actions => actions.setWallet)
    const setPkh = useStoreActions(actions => actions.setPkh)
        
    const walletConnected = async (wallet: string, closeModal = true) => {
        setConnected(true);
        if (closeModal) {
            (document.querySelector("#wallet-connect-modal") as any).checked = false
        }
        const walletStoreObj = {connected: true, name: wallet}
        setWallet(walletStoreObj)
        const add = await (await initializeLucid(await window.cardano[wallet].enable())).wallet.address()
        const pkh = C.Address.from_bech32(add).as_base()?.payment_cred().to_keyhash()?.to_hex();
        if(pkh) setPkh(pkh)
    }

    const loadWalletSession = async () => {
        if(walletStore.connected && 
            walletStore.name &&
            window.cardano &&
            (await window.cardano[walletStore.name].enable())
        ) { 
            walletConnected(walletStore.name, false)
        }
    }

    useEffect(() => {
        let wallets = { nami: false, eternl: false, flint: false }
        if (window.cardano) {
            if (window.cardano.nami) wallets.nami = true
            if (window.cardano.eternl) wallets.eternl = true
            if (window.cardano.flint) wallets.flint = true
            loadWalletSession()
        }
        if (availableWallets !== wallets) setAvailableWallets(wallets)
    }, [])
    return (
        <>
            <label htmlFor="wallet-connect-modal" className="btn btn-ghost btn-circle text-neutral modal-button">
                <div className="indicator">
                    <svg width="46" height="32" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.98305 0.0142294L3.66212 0L2.82418 0.837942H1.66037C1.50204 0.986955 1.48968 1.16381 1.48968 1.30347C1.48968 1.45864 1.55047 1.62094 1.66037 1.67588L19.6918 1.66192C20.797 1.66106 21.6934 2.55674 21.6934 3.66192V7.61907H17.2372C16.1931 7.61907 15.3468 8.46543 15.3468 9.50947C15.3468 10.5908 16.2233 11.4674 17.3047 11.4674H21.6934V15.4106C21.6934 16.5151 20.798 17.4106 19.6934 17.4106H2C0.89543 17.4106 0 16.5151 0 15.4106V2.01416C0 0.916201 0.885136 0.0235337 1.98305 0.0142294Z" fill="currentColor" />
                        <path d="M20.9873 11.1415H17.3562C16.4692 11.1415 15.7501 10.4224 15.7501 9.53541C15.7501 8.64841 16.4692 7.92935 17.3562 7.92935H20.9873C21.8743 7.92935 22.5933 8.64841 22.5933 9.53541C22.5933 10.4224 21.8743 11.1415 20.9873 11.1415Z" fill="currentColor" />
                        <circle cx="17.2398" cy="9.52771" r="0.682768" />
                    </svg>
                    {connected ? <span className="badge badge-xs badge-info indicator-item"></span> : <></>}
                </div>
            </label>
            <input type="checkbox" id="wallet-connect-modal" className="modal-toggle" />
            <label htmlFor="wallet-connect-modal" className="modal cursor-pointer">
                <label className="modal-box bg-neutral text-neutral-content bg-opacity-90 max-w-2xl" htmlFor="">
                    <h3 className="text-lg font-bold mb-4">Connect your Cardano wallet</h3>
                    <div className="flex flex-col text-center">
                        {Object.keys(availableWallets).map(wallet => {
                            const enabled = (availableWallets as { [key: string]: boolean })[wallet];
                            return (
                                <button
                                    key={wallet} disabled={!enabled}
                                    className="btn btn-outline text-neutral-content my-3 py-2 text-xl rounded-box"
                                    onClick={async () => {
                                        if (await window.cardano[wallet].enable()) {
                                            walletConnected(wallet)
                                        }
                                    }
                                    }
                                >
                                    {wallet}
                                </button>
                            )
                        })}
                    </div>
                </label>
            </label>
        </>
    )
}