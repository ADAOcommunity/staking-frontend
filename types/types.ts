import { SpendingValidator } from "lucid-cardano"


export type PoolInfo = {
  contractAddress: string
  distAddress: string
  type: 'NFT' | 'FT'
  stakingUnit: string | undefined
  stakingPolicy: string | undefined
  harvestUnit: string
  script: SpendingValidator
  maxSize: number
  rewardPerEpochQt: number
  reward: string
  name: string
  poolIndex: number
  imageSrc: string
  openFrom: Date
  closesAt: Date
}

export type UserPoolInfo = {
  rewardType: string
}

export type StakingPoolInfo = {
  userInfo: UserPoolInfo
  poolInfo: PoolInfo
}