import { Blockfrost, WalletProvider, Lucid } from 'lucid-cardano'

const initializeLucid = async (walletName: string) => {
    const lucid = await Lucid.new(
        new Blockfrost('https://cardano-testnet.blockfrost.io/api/v0', 'testnetRvOtxC8BHnZXiBvdeM9b3mLbi8KQPwzA'),
        'Testnet'//  as Network
    )
    if(walletName) await lucid.selectWallet(walletName as WalletProvider)
    return lucid
}

export default initializeLucid