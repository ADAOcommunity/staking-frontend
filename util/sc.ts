import { Assets, C, fromHex, PaymentKeyHash, toHex, UTxO } from "lucid-cardano";
import initializeLucid from "./lucid";

const DATUM_LABEL = 405;
const PUB_KEY_LABEL = 406;

const DEPOSIT_DATUM = (pkh: PaymentKeyHash) => {
    const fieldsInner = C.PlutusList.new()
    fieldsInner.add(C.PlutusData.new_bytes(fromHex(pkh)));
    const pStake = C.PlutusList.new();
    pStake.add(C.PlutusData.new_constr_plutus_data(
        C.ConstrPlutusData.new(
            C.BigNum.from_str(DATUM_TYPE.StakeDatum.toString()),
            fieldsInner
        )
    ));
    const datum = C.PlutusData.new_constr_plutus_data(
        C.ConstrPlutusData.new(
            C.BigNum.from_str(DATUM_TYPE.StakeDatum.toString()),
            pStake
        )
    )
    return toHex(datum.to_bytes());
};

const DEPOSIT_DATUM_HASH = (pkh: PaymentKeyHash) => {
    const fieldsInner = C.PlutusList.new();
    fieldsInner.add(C.PlutusData.new_bytes(fromHex(pkh)));
    const pStake = C.PlutusList.new();
    pStake.add(C.PlutusData.new_constr_plutus_data(
        C.ConstrPlutusData.new(
            C.BigNum.from_str(DATUM_TYPE.StakeDatum.toString()),
            fieldsInner
        )
    ));
    const datum = C.PlutusData.new_constr_plutus_data(
        C.ConstrPlutusData.new(
            C.BigNum.from_str(DATUM_TYPE.StakeDatum.toString()),
            pStake
        )
    )
    return C.hash_plutus_data(datum)
}

const DATUM_TYPE = {
    StakeDatum: 0,
}

const WITHDRAW = () => {
    const redeemer = C.PlutusData.new_constr_plutus_data(
        C.ConstrPlutusData.new(
            C.BigNum.from_str("0"),
            C.PlutusList.new()
        )
    );
    return toHex(redeemer.to_bytes())
}

const searchStakes = async (pk: PaymentKeyHash, utxos: UTxO[]) => {
    const l = utxos.filter((utxo) => {
        if (utxo.datumHash == toHex(DEPOSIT_DATUM_HASH(pk).to_bytes())) {
            return true;
        }
        return false;
    });
    if (l.length > 8) {
        return l.slice(0, 8)
    }
    return l
}

function subAssetsFromUtxos(utxos: UTxO[], value: Assets) : Assets {
    let utxoVal: Assets = {};
    let valKs = Object.keys(value)
    utxos.forEach((u) => {
        let assets: Assets = u.assets;
        let ks = Object.keys(assets)
        ks.forEach((k) => {
            let kVal = assets[k]
            kVal = kVal != undefined ? kVal : 0n;
            let uVal = utxoVal[k];
            uVal = uVal != undefined ? uVal : 0n;
            utxoVal[k] = BigInt(kVal.toString()) + BigInt(uVal.toString())
        });
    });
    valKs.forEach((k) => {
        let kVal = value[k]
        kVal = kVal != undefined ? kVal : 0n;
        let uVal = utxoVal[k]
        uVal = uVal != undefined ? uVal : 0n;
        if (kVal > uVal) {
            throw 'Subtraction Failed.';
        }
        utxoVal[k] = BigInt(uVal.toString()) - BigInt(kVal.toString())
    })
    return utxoVal;
}


const getAllUtxos = async (walletName: string, contractAddress: string) => {
    const Lucid = await initializeLucid(await window.cardano[walletName].enable())
    return await Lucid.utxosAt(contractAddress)
}

const getStakedUnitAmount = (utxos: UTxO[], pkh: string, stakingUnit: string) => {
    let total: bigint = 0n;
    if(!pkh) throw 'No key hash for a user, try connecting your wallet again'
    const ownedUtxos = utxos.filter((u) => {
        return u.datumHash == DEPOSIT_DATUM_HASH(
            pkh
        ).to_hex()
    });
    ownedUtxos.forEach(u => { if(u.assets[stakingUnit]) total += (u.assets[stakingUnit] as bigint) })
    return total
}

const getStakedNftsAmount = (utxos: UTxO[], pkh: string, stakingPolicy: string) => {
    let total: bigint = 0n;
    if(!pkh) throw 'No key hash for a user, try connecting your wallet again'
    const ownedUtxos = utxos.filter((u) => {
        return u.datumHash == DEPOSIT_DATUM_HASH(
            pkh
        ).to_hex()
    });
    console.log('ownedUtxos.length')
    console.log(ownedUtxos.length)
    ownedUtxos.forEach(u => { 
        Object.keys(u.assets).forEach(unit => {
            if(unit.startsWith(stakingPolicy)) {
                total += 1n
            }
        })
    })
    return total
}

const getStakedTotalAmount = (utxos: UTxO[], stakingUnit: string) => {
    let total: bigint = 0n;
    utxos.forEach(u => { if(u.assets[stakingUnit]) total += BigInt(u.assets[stakingUnit].toString()) })
    return total
}

const getStakedNftsTotalAmount = (utxos: UTxO[], stakingPolicy: string) => {
    let total: bigint = 0n;
    console.log('getStakedNftsTotalAmount')
    console.log(utxos)
    utxos.forEach(u => {
        Object.keys(u.assets).forEach(unit => {
            if(unit.startsWith(stakingPolicy)) {
                total += 1n
            }
        }) 
    })
    return total
}


const getStakersCount = (utxos: UTxO[]) => {
    const datumHashes = utxos.map((u) => {
        if(u && u.datumHash) return u.datumHash
    })
    const uniqueDatumsArr = [...new Set(datumHashes)]
    return uniqueDatumsArr.length
}

const addAssets = (assets1 : Assets, assets2 : Assets) : Assets => {
    const units1 = Object.keys(assets1);
    const units2 = Object.keys(assets2);
    let newAssets : Assets = {};
    units1.forEach((unit1) => {
      let au1 = assets1[unit1];
      let au2 = assets2[unit1]
      let newVal = au1 != undefined ? au1 : 0n;
      let newVal2 = au2 != undefined ? au2 : 0n;
  
      if (units2.includes(unit1)) {
        newVal = BigInt(newVal.toString()) + BigInt(newVal2.toString());
      }
      newAssets[unit1] = newVal;
    });
    units2.forEach((unit2) => {
      if (!units1.includes(unit2)) {
        newAssets[unit2] = assets2[unit2]
      }
    });
    return newAssets;
}

const getStakingAddress = (scriptHex: string, testnet: boolean = true) => C.EnterpriseAddress.new(
    testnet ? 0 : 1,
    C.StakeCredential.from_scripthash(
        C.PlutusScript.from_bytes(
            Buffer.from(scriptHex, 'hex'),
        ).hash(C.ScriptHashNamespace.PlutusV1),
    ),
)
    .to_address()
    .to_bech32()


export { PUB_KEY_LABEL, DATUM_LABEL, DATUM_TYPE, DEPOSIT_DATUM, DEPOSIT_DATUM_HASH, WITHDRAW }

export { 
    addAssets, searchStakes, subAssetsFromUtxos, getStakedUnitAmount, getAllUtxos,
    getStakingAddress, getStakersCount, getStakedTotalAmount, getStakedNftsAmount, getStakedNftsTotalAmount
}
