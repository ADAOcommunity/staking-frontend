import { Blockfrost, WalletProvider, Lucid } from 'lucid-cardano'

const initializeLucid = async (walletapi: WalletAPI | undefined) => {
    let lucid = await Lucid.new(
        new Blockfrost('https://cardano-testnet.blockfrost.io/api/v0', 'testnetRvOtxC8BHnZXiBvdeM9b3mLbi8KQPwzA'),
        'Testnet'//  as Network
    )
    if(walletapi) lucid = lucid.selectWallet(walletapi)
    return lucid
}

export default initializeLucid