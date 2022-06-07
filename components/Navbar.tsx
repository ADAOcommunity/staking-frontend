import dynamic from 'next/dynamic';
import Link from 'next/link';
// import WalletModalBtn from './WalletModalBtn';

export default function Navbar() {
    const WalletModalBtn = dynamic(() => import('./WalletModalBtn'), { ssr: false })

    return (
        <div className="navbar bg-accent-dark bg-cover bg-base-200">
            <div className="navbar-start">
                <div className="dropdown">
                    <label tabIndex={0} className="btn text-neutral btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </label>
                    <ul tabIndex={0} className="menu menu-compact dropdown-content text-white mt-3 p-2 shadow bg-secondary rounded-box w-52">
                        <li><Link href="/">Homepage</Link></li>
                        <li><Link href="/faq">FAQ</Link></li>
                    </ul>
                </div>
            </div>
            <div className="navbar-center">
                <img width={126} src="https://media.discordapp.net/attachments/897257085551669279/979143077199487006/ADAO_-_Logo_-_ADAO_White.png" />
            </div>
            <div className="navbar-end">
                <WalletModalBtn />
            </div>
        </div>
    )
}