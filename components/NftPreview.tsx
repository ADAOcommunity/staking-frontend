import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
                        }).catch(err => console.log('Error:', err));
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

    return (
        

        <div className="relative m-auto w-36 h-44" onClick={ (e) => {
            e.preventDefault()
            selectImage()
        } }>

                {!image ? 
                    <Skeleton width={'9rem'} height={'9rem'} className='w-36 h-36'/> :
                    <img className='w-36 h-36 rounded-lg m-auto' src={image}/>
                }
                {!selected ? 
                    <></> :
                    <div className={`absolute bg-slate-900 opacity-60 w-36 h-36 top-0 rounded-lg z-10`}>
                        {/* top-${image ? 0 : 1} left-[0.7rem] */}
                    </div>
                }
                <p className='text-lg'>{nftName}</p>
            
        </div>
    )
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