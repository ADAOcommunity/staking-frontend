import type { NextPage } from 'next'
import Layout from '../components/Layout'
import dynamic from 'next/dynamic'
import stakingpools from '../resources/stakingPools'

const Home: NextPage = () => {
  const StakingPool = dynamic(() => import('../components/StakingPool'), { ssr: false })
  return (
    <Layout>
      <div className="hero flex flex-col bg-accent-dark bg-cover bg-hero min-h-screen">
        {stakingpools.map(
          sp => <StakingPool key={sp.poolInfo.name} stakingPoolInfo={sp} />
        )}
      </div>
    </Layout>
  )
}

export default Home
