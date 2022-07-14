import Head from 'next/head'
import Footer from './Footer'
import Navbar from './Navbar'
export default function Layout({
    children,
}: {
    children: React.ReactNode
    home?: boolean
}) {
    const siteTitle = `ADAOCommunity Staking Portal`
    
    return (
        <div data-theme="mytheme" className='max-w-full m-0'>
            <Head>
                <meta name="apple-mobile-web-app-title" content={siteTitle} />
                <meta name="application-name" content={siteTitle} />
                <meta
                    name="description"
                    content="ADAO Staking portal - get rewards for your LP tokens"
                />
                <meta
                    property="og:image"
                    content=""
                />
                <meta name="og:title" content={siteTitle} />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            <header>
                <Navbar/>
            </header>
            <main>{children}</main>
            <Footer/>
        </div>
    )
}

