import { useEffect, useState } from 'react';

const BLOCKFROST_URL = 'https://cardano-testnet.blockfrost.io/api/v0'
const BLOCKFROST_KEY = 'testnetJe6W7FM1Jwkh0PxNMZt9OzNND3T1mS1T'
const IPFS_GATEWAY = 'ipfs.blockfrost.dev'
const ARWEAVE_GATEWAY = 'arweave.net'

export default function NftPreview(props: {unit: string, select: (unit: string, select: boolean) => void}) {
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

            if(!Array.isArray(imgSrc)) {
                imgSrc =
                    imgSrc.includes('ar://') ? 
                        `https://${ARWEAVE_GATEWAY}/${imgSrc.replace('ar://', '')}` : imgSrc ?
                        `https://${IPFS_GATEWAY}/ipfs/${imgSrc.replace('ipfs://', '').replace('ipfs/', '')}` : ''
            }

            if(imgSrc) {
                if(!Array.isArray(imgSrc)) {
                    fetch(imgSrc, { method: 'HEAD' })
                        .then(res => {
                            if (res.ok) {
                                setImage(imgSrc as string)
                            } else {
                                console.log('Image does not exist.');
                            }
                        }).catch(err => err);
                } else {
                    imgSrc = imgSrc.join('')
                    setImage(imgSrc as string)
                }
            }
        }
    }

    useEffect(() => {
        loadImage()
    }, [])

    return <div className="relative m-auto w-36 h-44" onClick={ (e) => {
        e.preventDefault()
        selectImage()
    } }>

            {!image ? 
                <div className='flex w-36 h-36 animate-pulse rounded-lg bg-gray-300'/>
                :
                <img className='w-36 h-36 rounded-lg m-auto' src={image}/>
            }
            {!selected ? 
                <></> :
                <div className={`absolute bg-slate-900 bg-opacity-60 w-36 h-36 top-0 rounded-lg z-10 flex justify-center items-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            }
            <p className='text-lg'>{nftName}</p>
        
    </div>
}

const getNftImage = async (unit: string) : Promise<string | string []> => {
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