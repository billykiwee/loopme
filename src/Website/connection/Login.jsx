import React, { useState, useEffect } from 'react'
import { auth, db } from '../../App/database/firebase'
import { useNavigate } from 'react-router-dom'
import { useStateValue } from '../../App/provider/StateProvider'
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from "firebase/auth"
import { serverTimestamp } from 'firebase/firestore'
import UniqueID from '../../App/utils/uniqueID'
import Messages from '../../App/utils/Messages'
import Main from '../../App/components/Main'
import '../../App/css/login.css'
import { getUnsplashImage } from '../../Client/lib/api/unsplash/unsplash'
import { generateLetterImage } from '../../App/utils/generateLetterImage'


export default function Signup() {

    const history = useNavigate()

    const [{user}] = useStateValue()


    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [MSG, setMSG] = useState({})   

    const userID = UniqueID('user', 16)


    const loginConditions = {
        Name : {
            value : name,
            rules : {
                length : {
                    min: 4,
                    max : 16
                }
            }
        },
        Email : {
            value : email,
            rules : {
                regex : /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            },
            error : document.querySelector('#error-email') 
        },
        Password : {
            value: password,
            rules : {
                length : {
                    min: 6
                },
                regex : {
                    special: /.[!,@,#,$,%,^,&,*,?,_,~,-,(,)&é"'(§è!çà)-^$`ù=:;,]/,
                    number : /.[1234567890]/
                }
            },
            error : document.querySelector('#error-password') 
        }
    }

    const { Name, Email, Password } = loginConditions



    function registerByEmail(e) {

        e.preventDefault() 

        async function Signup() {

            if (!Email.value.match(Email.rules.regex)) 
                throw {
                    code : 'error-email',
                    error : 'Veuillez entrer un email valide'
                }
            else Email.error.innerHTML = ''


            if (Password.value.length < Password.rules.length.min)
                throw {
                    code : 'error-password',
                    error : `Le mot de passe doit contenir au moins ${Password.rules.length.min} caractères`
                }

            else if (!Password.value.match(Password.rules.regex.special))
                throw {
                    code : 'error-password',
                    error : 'Le mot de passe doit contenir un caractère spécial'
                }

            else if (!Password.value.match(Password.rules.regex.number))
                throw {
                    code : 'error-password',
                    error : 'Le mot de passe doit contenir un nombre'
                }

            else Password.error.innerHTML = ''


            return {
                email : Email.value, 
                password :Password.value 
            }

        }

        Signup()
        .then(validData=> {

            const { email, password } = validData

            auth.createUserWithEmailAndPassword(email, password)
            .then(toDatabase=> {

                db.collection('users').doc(email).set({
                    plan    : 'FREE',
                    id      : userID,
                    name    : email.split('@')[0],
                    email   : email,
                    photoURL: generateLetterImage(email.split('')[0].toUpperCase()),
                    date    : serverTimestamp()
                }) 
            })
            .then(redirect=> history('/dashboard') )
            .catch(error => {
                //console.error(error)
                setMSG({
                    statu: 'error', 
                    msg: "L'adresse mail est associé à un autre compte"
                })
            })
        })
        .catch(error => {

            Object.values(loginConditions).map(condition=> {
                return condition.error?.id === error.code ? condition.error.innerHTML = error.error : null
            })
        }) 
    }


    function registerByGoogle() {

        const provider = new GoogleAuthProvider()

        async function signup() {

            await signInWithPopup(auth, provider)
            .then(async (result) => {

                // If user log for the frist time
                const isFirstLogin = getAdditionalUserInfo(result).isNewUser
                 
                if (isFirstLogin) {

                    db.collection('users').doc(auth.currentUser.email).set({
                        plan    : 'FREE',
                        id      : userID,
                        name    : auth.currentUser.displayName,
                        email   : auth.currentUser.email,
                        photoURL: auth.currentUser.photoURL,
                        date    : serverTimestamp()
                    }) 
                }
                else return '/dashboard'
            })
        }

        signup()
        .then(redirect => history(redirect)) 
    }


    const [HashPassword, setHashPassword] = useState(false)

    const [Loader, setLoader] = useState(false)

    const [UnsplashImg, setUnsplashImg] = useState('')

    useEffect(e=> {
        getUnsplashImage('nature')
        .then(data => {
            setUnsplashImg(data)
        })

    }, [])



    if (user) history('/dashboard')
    return (

        <div className='login'>
            <div className='login-img'>
                <a href={UnsplashImg.profileUrl} className='display absolute b-0 h-1 p-lr-1 white opacity' onMouseEnter={e=> e.target.style = 'opacity: 1; text-decoration: underline;'} onMouseLeave={e=> e.target.style= 'opacity: ; text-decoration: unset;'} >
                    <small className='display '>@ {UnsplashImg.author}</small>
                </a>
                {
                    !UnsplashImg
                    ? <Messages loader={Loader} />
                    : <img className='border-r-2' height='100%' src={UnsplashImg.url} alt={UnsplashImg.author + ' @ ' + UnsplashImg.profileUrl} />
                }
            </div>
            <div className="form-block">
                <form className='grid w-100p'>

                    <div className='grid m-b-1'>
                        <div className='display justify-c'>
                            <h2 className='text-align-c'>Se connecter avec</h2>
                        </div>
                        <div className='display justify-c gap'>
                            <div className='display'>
                                <button className='border border-r-1 white border-b hover h-3' type='button' onClick={registerByGoogle}>
                                    <span className='f-s-16 opacity p-04 c-black'>Google</span>
                                    <img src='/images/google.svg' width={36} />
                                </button>
                            </div>
                            <div className='display'>
                                <button className='border border-r-1 white border-b hover h-3' type='button' onClick={registerByGoogle}>
                                    <span className='f-s-16 opacity p-04 c-black'>Facebook</span>
                                    <img src='/images/facebook.svg' width={36} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='display border-top justify-c m-t-2 m-b-2 opacity'>
                        <div className='display justify-c white absolute w-3'>
                            <span className=''>ou</span>
                        </div>
                    </div>


                    <Messages statu={MSG.statu} msg={MSG.msg} loader={MSG.loader} />

                    <div className='grid w-100p m-b-1'>
                        <div className='m-b-04'>
                            <label>Email</label>
                        </div>
                        <div className='div-input white display border border-r-1'>
                            <span className='display m-l-1'>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                            <input type="email" placeholder='mon-email@gmail.com' className='border-0 h-3 w-100p'onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <small className='c-red' id='error-email'></small>
                    </div>

                    <div className='grid w-100p m-b-1'>
                        <div className='m-b-04'>
                            <label>Mot de passe</label>
                        </div>
                        <div className='div-input white display border border-r-1'>
                            <span className='display m-l-1'>
                                <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.8586 7.16405C14.3449 7.16405 14.8112 7.3572 15.155 7.70102C15.4988 8.04484 15.692 8.51115 15.692 8.99738M19.3586 8.99738C19.3589 9.85646 19.1579 10.7036 18.7718 11.4711C18.3857 12.2385 17.8251 12.9047 17.1351 13.4165C16.4451 13.9283 15.6449 14.2713 14.7984 14.4181C13.952 14.5649 13.0829 14.5114 12.2609 14.2618L10.192 16.3307H8.35864V18.1641H6.52531V19.9974H3.77531C3.53219 19.9974 3.29904 19.9008 3.12713 19.7289C2.95522 19.557 2.85864 19.3238 2.85864 19.0807V16.7102C2.85869 16.4671 2.95531 16.234 3.12723 16.0621L8.59423 10.5951C8.36547 9.8389 8.30233 9.04225 8.4091 8.25942C8.51587 7.47659 8.79005 6.72595 9.21297 6.05859C9.63589 5.39124 10.1976 4.82283 10.8599 4.39207C11.5223 3.9613 12.2696 3.67829 13.0511 3.56229C13.8327 3.44629 14.63 3.50003 15.3889 3.71984C16.1478 3.93966 16.8504 4.3204 17.4489 4.83614C18.0474 5.35189 18.5278 5.99053 18.8574 6.7086C19.1869 7.42666 19.3579 8.20731 19.3586 8.99738V8.99738Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                            <input  
                                className='border-0 h-3 w-100p'
                                type={HashPassword ? "text" : "password"}  
                                onChange={e => setPassword(e.target.value)} 
                                placeholder='*********'
                                required
                            />
                            <img 
                                className="display click m-r-1" 
                                onClick={e=> setHashPassword(HashPassword === true ? false : true)} 
                                width={20}
                                src={HashPassword ? '/images/eye.svg' : '/images/eye-closed.svg'}
                            /> 
                        </div>
                        <small className='c-red' id='error-password'></small>
                    </div>
                    
                    <div className='grid m-t-1'>    
                        <button className="blue f-s-16 border-r-1 h-4 border-b hover-blue" onClick={registerByEmail} type="submit">
                            <span className='f-s-16 p-1'>Se connecter</span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
