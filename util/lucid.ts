import { Blockfrost, WalletProvider, Lucid } from 'lucid-cardano'

const initializeLucid = async (walletName: WalletAPI) => {
    let lucid = await Lucid.new(
        new Blockfrost('https://cardano-testnet.blockfrost.io/api/v0', 'testnetRvOtxC8BHnZXiBvdeM9b3mLbi8KQPwzA'),
        'Testnet'//  as Network
    )
    if(walletName) lucid = lucid.selectWallet(walletName)
    return lucid
}

export default initializeLucid