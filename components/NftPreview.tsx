import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const BLOCKFROST_URL = 'https://cardano-testnet.blockfrost.io/api/v0'
const BLOCKFROST_KEY = 'testnetJe6W7FM1Jwkh0PxNMZt9OzNND3T1mS1T'
const IPFS_GATEWAY = 'ipfs.blockfrost.dev'
const ARWEAVE_GATEWAY = 'arweave.net'

export default function NftPreview(props: {unit: string, select: (unit: string) => void}) {
    const [selected, setSelected] = useState<boolean>(false)
    const [image, setImage] = useState<string>('')

    const nftName = Buffer.from(props.unit.slice(56), 'hex').toString('ascii')

    const selectImage = () => {
        props.select(props.unit, !selected)
        setSelected(!selected)
    }

    const loadImage = async () => {
        let imgSrc = await getNftImage(props.unit)
        if(imgSrc) {
            imgSrc =
                imgSrc.includes('ar://') ? 
                    `https://${ARWEAVE_GATEWAY}/${imgSrc.replace('ar://', '')}` :
                    `https://${IPFS_GATEWAY}/ipfs/${imgSrc.replace('ipfs://', '').replace('ipfs/', '')}`

            if(imgSrc) setImage(imgSrc)
        }
    }

    useEffect(() => {
        loadImage()
    })

    return (
        <div className="flex relative justify-center text-center items-center object-center flex-col" onClick={selectImage}>
                {!image ? 
                    <Skeleton className='w-36 h-36'/> :
                    <img className='w-36 h-36 rounded-lg' src={image}/>
                }
                {!selected ? 
                    <></> :
                    <div className='absolute bg-slate-900 opacity-60 w-36 h-[10.75rem] rounded-lg'>
                        {/* translate-x-1/2 -translate-y-1/2 */}
                    </div>
                }
                <p className='text-lg'>{nftName}</p>
            
        </div>
    )
}

const getNftImage = async (unit: string) : Promise<string> => {
    let metaImage: string = ''
    try {
        metaImage = (await (await fetch(`${BLOCKFROST_URL}/assets/${unit}`, {
          headers: {
            project_id: BLOCKFROST_KEY,
          },
          method: "GET",
        })).json()).onchain_metadata.image
    } catch(exc) {
        console.log(exc)
    }
    return metaImage
}