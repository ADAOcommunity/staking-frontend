import { createTypedHooks } from 'easy-peasy';
import { Action, action } from 'easy-peasy';
import { createStore } from 'easy-peasy';

interface WalletStore {connected: boolean, name: string}

interface StoreModel {
    wallet: WalletStore
    setWallet: Action<StoreModel, WalletStore>
    pkh: string,
    setPkh: Action<StoreModel, string>
}

const model: StoreModel = {
  wallet : {connected: false, name: ''},
  setWallet: action((state, newWallet) => { state.wallet = newWallet }),
  pkh: '',
  setPkh: action((state, newPkh) => { state.pkh = newPkh })
}

const store = createStore(model)
export default store


const { useStoreActions, useStoreState, useStoreDispatch, useStore } = createTypedHooks<StoreModel>()

export {
  useStoreActions,
  useStoreState,
  useStoreDispatch,
  useStore
}