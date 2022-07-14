import { StakingPoolInfo } from '../types'
import * as scripts from './plutus'

// const adaoPoolInfo: StakingPoolInfo = {
//     userInfo: {
//         rewardType: '$SNDMN',
//     },
//     poolInfo: {
//         name: "SoundMoney",
//         poolIndex: 0,
//         imageSrc: "https://www.theadao.io/wp-content/uploads/2022/02/ADAO-Token-Design-e1644425619941.webp",
//         stakingUnit: "5b01968867e13432afaa2f814e1d15e332d6cd0aa77e350972b0967d4144414f476f7665726e616e6365546f6b656e",
//         harvestUnit: "bc25d07c8629c0695e4ec54367f6471b23fe7882b4538806ffeb8328536f756e644d6f6e6579",
//         distAddress: "addr1q8g59w6mtcnperwy5yq7fg3g547f9vjq8709wj3xk0w28573g2a4kh3xrjxufggpuj3z3ftuj2eyq0u72a9zdv7u50fssflav4",
//         type: "FT",
//         stakingPolicy: undefined,
//         script: scripts.shittingPool,
//         maxSize: 10000000,
//         rewardPerEpochQt: 69000,
//         reward: "$SNDMN/epoch",
//         closesAt: new Date(new Date().getDay() + 3),
//         openFrom: new Date()
//     }
// }


const adaoPoolInfo1: StakingPoolInfo = {
    userInfo: {
        rewardType: '$RAT',
    },
    poolInfo: {
        name: "ADAO/ADA LP for $RAT",
        poolIndex: 0,
        imageSrc: "/ratsdao.png",
        stakingUnit: "e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d862c4ec7c4240af09476da67f2d8dadd2e266279b6e18b0ac325f8b5866bbdbc94",
        harvestUnit: "d5dec6074942b36b50975294fd801f7f28c907476b1ecc1b57c916ed524154",
        distAddress: "addr1q8g59w6mtcnperwy5yq7fg3g547f9vjq8709wj3xk0w28573g2a4kh3xrjxufggpuj3z3ftuj2eyq0u72a9zdv7u50fssflav4",
        script: scripts.pool1v2,
	oldScript: scripts.pool1,
        type: "FT",
        stakingPolicy: undefined,
        maxSize: 10000000,
        rewardPerEpochQt: 75000000000,
        reward: "$RAT/epoch",
        closesAt: new Date(new Date().getDay() + 365),
        openFrom: new Date()
    }
}

const adao2PoolInfo: StakingPoolInfo = {
    userInfo: {
        rewardType: '$OAether',
    },
    poolInfo: {
        name: "ADAO for Origin Aether",
        poolIndex: 1,
        stakingUnit: "5b01968867e13432afaa2f814e1d15e332d6cd0aa77e350972b0967d4144414f476f7665726e616e6365546f6b656e",
        harvestUnit: "faea3fac6594c1ca1a08c26ffffe6a3e7fb512a0e84786a26b9d836c6f726967696e416574686572",
        distAddress: "addr1q8g59w6mtcnperwy5yq7fg3g547f9vjq8709wj3xk0w28573g2a4kh3xrjxufggpuj3z3ftuj2eyq0u72a9zdv7u50fssflav4",
        script: scripts.pool2v2,
	oldScript: scripts.pool2,
        type: "FT",
        stakingPolicy: undefined,
        imageSrc: "/origin.png",
        maxSize: 10000000,
        rewardPerEpochQt: 40000000000,
        reward: "$OAether/epoch",
        closesAt: new Date(new Date().getDay() + 365),
        openFrom: new Date()
    }
}


const adao3PoolInfo: StakingPoolInfo = {
    userInfo: {
        rewardType: '$OAether',
    },
    poolInfo: {
        name: "ADAO/ADA LP for Origin Aether",
        poolIndex: 2,
        stakingUnit: "e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d862c4ec7c4240af09476da67f2d8dadd2e266279b6e18b0ac325f8b5866bbdbc94",
        harvestUnit: "faea3fac6594c1ca1a08c26ffffe6a3e7fb512a0e84786a26b9d836c6f726967696e416574686572",
        distAddress: "addr1q8g59w6mtcnperwy5yq7fg3g547f9vjq8709wj3xk0w28573g2a4kh3xrjxufggpuj3z3ftuj2eyq0u72a9zdv7u50fssflav4",
        script: scripts.pool3v2,
	oldScript: scripts.pool3,
        type: "FT",
        stakingPolicy: undefined,
        imageSrc: "/origin.png",
        maxSize: 10000000,
        rewardPerEpochQt: 160000000000,
        reward: "$OAether/epoch",
        closesAt: new Date(new Date().getDay() + 365),
        openFrom: new Date()
    }
}


const stakingpools = [adaoPoolInfo1, adao2PoolInfo, adao3PoolInfo]


export default stakingpools
