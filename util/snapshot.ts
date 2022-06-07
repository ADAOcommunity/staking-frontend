import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { Assets, Blockfrost, Lucid, Network, Unit } from 'lucid-cardano';
import fetch from 'node-fetch'
import dotenv from 'dotenv';
import stakingpools from '../resources/stakingPools'
dotenv.config();

const BLOCKFROST_URL = process.env.BLOCKFROST_URL
const BLOCKFROST_KEY = process.env.BLOCKFROST_KEY
const NETWORK = process.env.NETWORK

if(!BLOCKFROST_URL || !BLOCKFROST_KEY || !NETWORK) {
    throw 'Environment variables not set'
}

const prisma = new PrismaClient();

const PUB_KEY_LABEL = 406;
const getMetadata = async (txHash: string) : Promise<Object> => {
    const md : unknown = await fetch(`${BLOCKFROST_URL}/txs/${txHash}/metadata`, {
      headers: {
        project_id: BLOCKFROST_KEY,
      },
      method: "GET",
    }).then((res) => res.json());
    return Object(md);
}
const getPubKey = async (txHash : string, outputIndex : number) => {
    const md : any = await getMetadata(txHash)
    console.log('-------------')
    console.log('GET PUBKEY')
    console.log(md)
    try {
      let pkh = md
        .find((m : any) => m.label == PUB_KEY_LABEL)
        .json_metadata[outputIndex]
      // datum = C.PlutusData.from_bytes(fromHex(datum));
      // pkh = C.Ed25519KeyHash.from_bytes(fromHex(pkh))
      return pkh;
    } catch (e) {
      console.log("Some required metadata entries were not found.");
    }
}

const dbFromPool = async (poolIndex : number, poolargs : any, valueAdded : Assets) =>  {
    await Lucid.initialize(
        NETWORK as Network,
        new Blockfrost(BLOCKFROST_URL, BLOCKFROST_KEY)
        );
    const unitsAdded = Object.keys(valueAdded)
    // For each of the utxos we need to compute the share of valueAdded.
    // Then we need to update the Snapshot to contain the newly updated valueToHarvest.
    const allUtxos = await Lucid.utxosAt(poolargs.poolInfo.contractAddress)
    let hashes: string[] = [];
    let mapofHash: Map<string, string> = new Map();
    let mapofStake: Map<string, BigInt> = new Map();
    let totalStake = 0n;
    // let newPayouts: Map<string, Map<Unit, BigInt>> = new Map();

    const pool = await prisma.pool.findFirst({
        where: {
            poolIndex: poolIndex
        }
    })
    if (!pool) {
        throw "The pool used is not valid."
    }

    for (var utxo of allUtxos) {
        let pubkeyhash = "";
        let dHash = utxo.datumHash ? utxo.datumHash : "";
        let probablePkh = mapofHash.get(dHash);
        pubkeyhash = probablePkh ? probablePkh : "";
        if (!pubkeyhash) {
            try {
                // TODO - It probably makes sense to store the DatumHash of a user in the db as well so as to reduce queries to blockfrost.
                pubkeyhash = await getPubKey(utxo.txHash, utxo.outputIndex);
                if (pubkeyhash) {
                    mapofHash.set(dHash, pubkeyhash);
                }
            } catch (e) {
                console.log(e);
            }
        }
        if(!pubkeyhash) {
            continue;
        }
        if (Object.keys(utxo.assets).indexOf(poolargs.poolInfo.stakingUnit) != -1) {
            let add = utxo.assets[poolargs.poolInfo.stakingUnit]
            add = add ? add : 0n;
            let added = BigInt(add.toString())
            let currentStake = mapofStake.get(pubkeyhash)
            currentStake = currentStake ? currentStake : 0n;
            let bigIntCStake = BigInt(currentStake.toString())
            added = added ? added : 0n;
            let bigIntAdded = BigInt(added);
            totalStake += bigIntAdded;
            if (mapofStake.has(pubkeyhash)) {
                added += bigIntCStake
            }
            mapofStake.set(pubkeyhash, added)
        }
    }
    for (var user of mapofStake.keys()) {
        let snapshot = await prisma.snapshot.findFirst({
            where: {
                keyhash: user,
                poolId: pool.id
            }
        })
        if (!snapshot) {
            snapshot = await prisma.snapshot.create({
                data: {
                    keyhash: user,
                    poolId: pool.id
                }
            });
        }
        let userStake = mapofStake.get(user)
        userStake = userStake ? userStake : 0n;
        let val : BigInt = valueAdded[poolargs.poolInfo.harvestUnit]
        let userPayout = BigInt(Math.floor((Number(userStake)/Number(totalStake))*Number(val.valueOf())))
        console.log(`User ${user} being paid ${userPayout} in ${poolargs.poolInfo.harvestUnit}`)
        let harvestUnit: string = poolargs.poolInfo.harvestUnit

        let unit = await prisma.unit.findFirst({
            where:{
                unit: harvestUnit
            }
        })
        if (!unit) {
            unit = await prisma.unit.create({
                data:{
                    unit: harvestUnit
                }
            })
        }

        const asset = await prisma.asset.create({
            data: {
                unitUnit: harvestUnit,
                value: userPayout,
                snapshotId: snapshot.id
            }
        })
    }
}

export { dbFromPool }