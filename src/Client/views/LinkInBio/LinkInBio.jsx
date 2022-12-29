import { ChevronRightIcon, EllipsisHorizontalIcon, EnvelopeOpenIcon, PencilSquareIcon } from '@heroicons/react/24/solid'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Main from '../../../App/components/Main'
import { db } from '../../../App/database/firebase'
import { useStateValue } from '../../../App/provider/StateProvider'
import getFavicon from '../../../App/utils/getFavicon'
import { fetchUser } from '../../lib/database/fetchUser'
import { fetchUserLinks } from '../../lib/database/fetchUserLinks'
import { uploadPhoto } from '../Profil/functions/uploadPhoto'


export default function LinkInBio({userView}) {

    const [{user}] = useStateValue()


    const [User,setUser] = useState([])
    const [UserLinks,setUserLinks] = useState([])

    useEffect(e=> {
        fetchUser(setUser, user?.email)
        fetchUserLinks(setUserLinks, user?.email)

    }, [user?.email])


    const socialMedia = [
        {
            name: 'instagram',
            icon: '/images/instagram.svg',
            link: ''
        },
        {
            name: 'Github',
            icon: '/images/github.svg',
            link: ''
        },
        {
            name: 'linkedin',
            icon: '/images/linkedin.svg',
            link: ''
        },
    ]


    const [start, setStart] = useState(0)
    const onDrag = (result) => {

        let { clientX, clientY, target } = result

        let heightDiv = target.clientHeight

        setStart(clientY);
    
    }

    const [end, setEnd] = useState(0)
    const onDragEnd = (result) => {

        let { clientX, clientY, target } = result

        let heightDiv = target.clientHeight

        if (clientY - heightDiv)
        setEnd(clientY)
    }



    return (
        <Main style={{
            paddingTop: '2rem',
            display: 'grid',
            'align-content': 'space-between',
            'align-items': 'end',
            height: '100vh',
        }}>

            <div className=' gap-1rem'>  
                
                <div className='grid gap-1rem p-1'>
                    {
                        userView 
                        ? 
                        (
                            <div className='display justify-c'>
                                <div className='edit-image-link'>
                                    <img src={User?.photoURL} width={80} height={80} className='border-r-100' />
                                    <div className='display justify-c border-r-100 white shadow border hover-white absolute click p-04' onClick={e=> document.querySelector('#upload-img').click()}  > 
                                        <PencilSquareIcon width={16} />
                                        <input 
                                            type='file' 
                                            hidden 
                                            id='upload-img' 
                                            onChange={fileInput => { uploadPhoto(fileInput, User.email) }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                        : 
                        (
                            <div className='display justify-c'>
                                <img src={User.photoURL} width={80} height={80} className='border-r-100' />
                            </div>
                        )
                    }
                    <div className='grid gap-1rem'>
                        <div className='grid gap'>
                            <div className='display justify-c'>
                                <span className='f-s-25 f-w-400'>@{User.name}</span>
                            </div>
                            <div className='display justify-c'>
                                <span className='f-s-16 c-grey f-w-300 text-align-c'>{User.description}</span>
                            </div>
                        </div>
                        <div className='display gap-1rem justify-c'>
                            {
                               UserLinks
                               .filter(e=> e.linkInBio === true && e.asIcon === true)
                               .map((link, i)=> {
       
                                    return (
                                        <a href={'https://'+ link.shortLink} className='link' key={i}>
                                            <img src={link.icon ?? getFavicon(link.url)} width={34} className='border-r-100' />
                                        </a>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className='grid gap'>
                    {
                        UserLinks
                        .filter(e=> e.linkInBio === true && e.asIcon !== true)
                        .sort((a,b)=> a.position - b.position)
                        .map(link=> {

                            return (
                                <div key={link.url} >
                                    {
                                        !userView 
                                        ?
                                        <a href={'https://' +link.shortLink}>
                                            <div className='display border white border-r-1 border-b p-1 hover click h-2' >
                                                <div className='display justify-c absolute'>
                                                    <img src={link.icon ?? getFavicon(link.url)} width={40} className='border-r-100' />
                                                </div>
                                                <div className='display justify-c w-100p'>
                                                    <span className='f-s-16'>{link.name}</span>
                                                </div>
                                                {
                                                    userView && 
                                                    <div className='display'>
                                                            <EllipsisHorizontalIcon width={28} /> 
                                                    </div>
                                                }
                                            </div>
                                        </a>
                                        :
                                        <div className='display border white border-r-1 border-b p-1 hover click h-2' draggable onDrag={e=> onDrag(e)}  onDragEnd={e=> onDragEnd(e)} >
                                            <div className='display justify-c absolute'>
                                                <img src={link.icon ?? getFavicon(link.url)} width={40} className='border-r-100' />
                                            </div>
                                            <div className='display justify-c w-100p'>
                                                <span className='f-s-16'>{link.name}</span>
                                            </div>
                                            {
                                                userView && 
                                                <Link to={'/edit/' + link.id} className='display'>
                                                    <EllipsisHorizontalIcon width={28} /> 
                                                </Link>
                                            }
                                        </div>
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>
                    
            {
                !userView &&
                <div className='display justify-c' style={{position: 'sticky', bottom: '1rem'}} >
                    <a href='/' className='display gap' id='link-qlee' 
                        onMouseEnter={e=> {
                            document.querySelector('#link-qlee').children[1].style.display = 'flex'
                        }}
                        onMouseLeave={e=> {
                            document.querySelector('#link-qlee').children[1].style.display = 'none'
                        }}
                    >
                        <img src='/favicon.ico' width={32} />
                        <span className='c-grey f-w-300 disable'>Made by Qlee.me</span>
                    </a>
                </div>
            }
        </Main>
    )
}
