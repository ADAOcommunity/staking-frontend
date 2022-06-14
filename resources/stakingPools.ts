import { StakingPoolInfo } from '../types'
import {shittingPool} from './plutus'

const adaoPoolInfo: StakingPoolInfo = {
    userInfo: {
        rewardType: '$ADAO',
    },
    poolInfo: {
        name: "ADAO",
        poolIndex: 0,
        contractAddress: "addr_test1wp2qcuqand5tp58qj8yxgaxzx0h2s5tjysck6u5ekyqfd0cn4ae8v",
        imageSrc: "https://www.theadao.io/wp-content/uploads/2022/02/ADAO-Token-Design-e1644425619941.webp",
        stakingUnit: "648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff19877444f4745",
        stakingPolicy: undefined,
        type: 'FT',
        harvestUnit: "57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54",
        distAddress: "addr_test1vpza7k2n0lc8pl5mud626amrpj6d9h98pnsfc3ygr6zxpksh8phth",
        script: shittingPool,
        maxSize: 10000000,
        rewardPerEpochQt: 69000,
        reward: "$Summon/epoch",
        closesAt: new Date(new Date().getDay() + 3),
        openFrom: new Date()
    }
}

const adao2PoolInfo: StakingPoolInfo = {
    userInfo: {
        rewardType: 'Aether',
    },
    poolInfo: {
        name: "ADAO/ADA Lp",
        poolIndex: 1,
        contractAddress: "addr1...",
        stakingUnit: "648823ffdad1610b4162f4dbc87bd47f6f9cf45d772ddef661eff19877444f4745",
        stakingPolicy: undefined,
        type: 'FT',
        harvestUnit: "57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54",
        distAddress: "",
        script: shittingPool,
        imageSrc: "https://www.theadao.io/wp-content/uploads/2022/02/ADAO-Token-Design-e1644425619941.webp",
        maxSize: 10000000,
        rewardPerEpochQt: 69000,
        reward: "$Aether/epoch",
        closesAt: new Date(new Date().getDay() + 3),
        openFrom: new Date()
    }
}

const adaoNFTPoolInfo: StakingPoolInfo = {
    userInfo: {
        rewardType: '$ADAO',
    },
    poolInfo: {
        name: "ADAONFT",
        poolIndex: 0,
        contractAddress: "addr_test1wp2qcuqand5tp58qj8yxgaxzx0h2s5tjysck6u5ekyqfd0cn4ae8v",
        imageSrc: "https://www.theadao.io/wp-content/uploads/2022/02/ADAO-Token-Design-e1644425619941.webp",
        stakingPolicy: "221dd4233ea90cdd7ca5ddfae94f5adf20bb7d16c1ffde1230f9371b",
        stakingUnit: undefined,
        type: 'NFT',
        harvestUnit: "57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54",
        distAddress: "addr_test1vpza7k2n0lc8pl5mud626amrpj6d9h98pnsfc3ygr6zxpksh8phth",
        script: shittingPool,
        maxSize: 10000000,
        rewardPerEpochQt: 69000,
        reward: "$ADAO/epoch",
        closesAt: new Date(new Date().getDay() + 3),
        openFrom: new Date()
    }
}

const stakingpools = [adaoPoolInfo, adao2PoolInfo, adaoNFTPoolInfo]


export default stakingpools