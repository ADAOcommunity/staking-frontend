import type { NextPage } from 'next'
import Layout from '../components/Layout'

const getFaqText = (n : number) => {
    switch(n) {
        case 1: return 'The ADAO staking portal is a frontend interface for interacting with Smart contracts deployed on Cardano, it allows you to trustlessly stake Cardano assets and earn rewards based on amount and time staked.'
        case 2: return 'From the homepage you will be able to see the list of incentivised pools and availible rewards for staking to that pool. Simply deposit the cooresponding asset(s) via the "deposit" button and periodicly claim your rewards via the "Harvest" button.'
        case 3: return 'The ADAO staking portal is "non-custodial". When you stake/deposit your asset(s) in a pool they are held in a Plutus smart contract on-chain, they are "owned" by your privet key and withdrawable only by that same privet key.'
        case 4: return 'Yes! All of the valadation code/Smart contracts are open source and can be found in the ADAOcommunity GitHub. Always demand open source.'
        case 5: return 'A small fee is placed on the deposit action and a smaller fee is placed on harvest, these fees help us cover the cost to manage this service.'
        case 6: return 'Rewards are calculated and accumulated via a snapshot mechanic off-chain, they are based on the amount a user has staked'
        case 7: return 'Rewards are distributed from the backend in a single transaction to each user upon clicking harvest.'   
    
        default: return 'ADAO Staking portal'
    }  
}

const getFaqTitle = (n : number) => {
    switch(n) {
        case 1: return 'What is the ADAO Staking Portal?'
        case 2: return 'How do I use the ADAO staking portal?'
        case 3: return 'Where are my assets held?'
        case 4: return 'Is it open source?'
        case 5: return 'Is it free?'
        case 6: return 'How are rewards calculated?'
        case 7: return 'How are rewards distributed?'
            
    
        default: return 'ADAO Staking portal'
    }
}


const Faq: NextPage = () => {
    return (
        <Layout>
            <div className="hero min-h-screen bg-accent-dark bg-cover bg-hero">
                <div className="hero-content flex flex-col text-neutral text-center">
                    {
                        [1,2,3,4,5,6].map((n) => <FaqItem
                                key={n}
                                heading= {getFaqTitle(n)}
                                text= {getFaqText(n)}
                            />
                        )
                    }
                </div>
            </div>
        </Layout>
    )
}

export default Faq


function FaqItem({heading, text} : {heading: string, text: string}) {
    return (
        <div tabIndex={0} className="collapse collapse-arrow py-2 w-full my-2 rounded-full text-white active:text-opacity-95 focus:outline-white focus:ring">
            <div className="collapse-title text-xl font-medium">
            {heading}
            </div>
            <div className="collapse-content">
                <p>{text}</p>
            </div>
        </div>
    )
}