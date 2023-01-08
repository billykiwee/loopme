import React, { useRef } from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Main from '../../../../App/components/Main'
import { SwitchInput } from '../../../../App/components/Switch'
import { db } from '../../../../App/database/firebase'
import { useStateValue } from '../../../../App/provider/StateProvider'
import getFavicon from '../../../../App/utils/getFavicon'
import fetchSettings from '../../../lib/database/linkInBio/fetchSetting'
import { fetchUserLinks } from '../../../lib/database/links/fetchUserLinks'
import LinkInBio from '../LinkInBio'


export function EditLinkInBio({ props }) {

    const { user } = props

    const { userName } = useParams()

    const User = user?.profil
    const [UserLinks, setUserLinks] = useState([])

    useEffect(e=> {
        fetchUserLinks(setUserLinks, user?.email)
    }, [user])

    function putLinkAsIcon(data) {
        db.collection('links').doc(data.id).update({
            asIcon : data.checked
        })
    }


    const [LinksBioSettings, setLinksBioSettings] = useState([])

    const { background, blocks, menu, fontFamily, colorBtn, linkAsIcon } = LinksBioSettings

    useEffect(e=> {
        fetchSettings(setLinksBioSettings, user?.email)
    }, [user?.email])
 

    return (
    
        <div className='grid blocks gap-2rem' >
            <div className='grid'>
                <h2>Mon link in bio</h2>

                <div className='grid gap-1rem p-1'>

                    <div className='display justify-s-b'>
                        <label className='f-s-20'>Lien icon</label>
                    </div>
                    <div className='display gap wrap grey border-r-04 p-1'  >
                        {
                            UserLinks
                            .filter(e=> e.linkInBio === true)
                            .sort((a,b)=> a.position - b.position)
                            .map(ul=> {
                                return <LinksAsIcon ul={ul} putLinkAsIcon={putLinkAsIcon} key={ul.id} />
                            })
                        }
                    </div>
                    <form>
                        <div className='grid justify-s-b gap-1rem'>
                            <label className='f-s-20'>Blocks</label>

                            <div className='grid p-1 border-r-04 grey'>
                                <div className='display justify-s-b gap'>
                                    <span>Border</span>
                                    <input type='range' min={0} max={100} onChange={e=> db.collection('link-in-bio').doc('@' + userName).update({ ['blocks.radius'] : e.target.value } )} />
                                </div>
                                <div className='display justify-s-b gap'>
                                    <span>Color</span>
                                    <label className='w-3 h-3 border-r-100 border' htmlFor='color' style={{background : blocks?.color}} value={blocks?.radius} />
                                    <input type='color' className='opacity-0 absolute' onChange={e=> {
                                        db.collection('link-in-bio').doc('@' + userName).update({ ['blocks.color'] : e.target.value } )

                                        e.target.parentElement.children[1].style.background = e.target.value 
                                    }} id='color' />
                                </div>
                            </div>

                            <div className='grid p-1 border-r-04 grey'>
                                <div className='display justify-s-b gap'>
                                    <span>Background</span>
                                </div>
                                <div className='display justify-s-b gap'>
                                    <span>Color</span>
                                    <label className='w-3 h-3 border-r-100 border' htmlFor='background-color' style={{background : background?.color}} />
                                    <input type='color' className='opacity-0 absolute' onChange={e=> {
                                        db.collection('link-in-bio').doc('@' + userName).update({ ['background.color'] : e.target.value } )

                                        e.target.parentElement.children[1].style.background = e.target.value 
                                    }} id='background-color'/>
                                </div>
                            </div>
                            
                        </div>
                    </form>
                </div>
            </div>
            <div className='relative overflow-hidden border-r-1'>
                <div className='' style={{
                    backgroundImage   : !background?.color && `url(${background?.img?.url}`,
                    filter            : `blur(${background?.img?.blur}px)`,
                    left              : 0,
                    right             : 0,
                    height            : '100%',
                    position          : 'absolute',
                    backgroundSize    : 'cover',
                    backgroundPosition: 'center',
                    backgroundColor   : background?.color
                }} />
                <div className='p-1'>
                    <LinkInBio userView={user} links={UserLinks} /> 
                </div>
            </div>
        </div> 
    
    )
}


function LinksAsIcon({ ul, putLinkAsIcon }) {
  
    return (
        <label className='display gap-04 click' htmlFor={'l-' + ul.id}>
            <SwitchInput 
                dimension={0.6} 
                checked={ul.asIcon} 
                id={'l-' + ul.id}
                onChange={(e) => {
                    putLinkAsIcon({
                        id: ul.id,
                        checked: e.target.checked,
                    })
                }}
            />
            <img src={ul.icon ?? getFavicon(ul.url)} width={16} className='border-r-100' />
            <span>{ul.name}</span>
        </label>
    )
  }
  