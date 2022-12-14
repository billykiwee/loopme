import React, { useEffect, useState } from 'react';
import Main from '../../App/components/Main';
import { Link, useParams } from 'react-router-dom'
import { useStateValue } from '../../App/provider/StateProvider'
import { db } from '../../App/database/firebase'
import formatCurrency from '../../App/utils/formatCurrency'
import UniqueID from '../../App/utils/uniqueID'
import { serverTimestamp } from 'firebase/firestore'
import { CardCvcElement, CardExpiryElement, CardNumberElement, Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import axios from 'axios'
import Messages from '../../App/utils/Messages';
import PhoneInput from 'react-phone-input-2'
import { loadStripe } from '@stripe/stripe-js';
import { plans } from '../../Admin/settings/plans';



export function Stripe({planID}) {


    const [MSG, setMSG] = useState({})

    const orderID = 'order-' + UniqueID()

    const { ShopID } = useParams()
    const [{user}] = useStateValue()
    const [UserCart, setUserCart] = useState([])
    const [AllItems, setAllItems] = useState([])

    useEffect(()=> {

        db.collection('client').doc(user?.email).collection('cart').doc(ShopID).collection('items').onSnapshot(snapshot => {
            setUserCart(snapshot.docs.map(doc => doc.data()))
        })

        db.collection('shop').doc(ShopID).collection('menu').onSnapshot(snapshot => {
            setAllItems(snapshot.docs.map(doc => doc.data()))
        })

    },[user?.email])

    function getAmountOfCart() {
        let total = []
        for (const v in UserCart) {
            total.push(Number(UserCart[v].total))
        }
        return total.reduce((partialSum, a) => partialSum + a, 0)
    } 
    const AmountOfCart = getAmountOfCart()


    function getItems(ITEM) {
        for (const v in AllItems) {
            if (ITEM === AllItems[v]?.id) return AllItems[v]
        }
    }


    const [ShowCart, setShowCart] = useState(true)



    const [Name, setName] = useState('')
    const [Phone, setPhone] = useState('')
    const [Email, setEmail] = useState('')
    const [DateTime, setDateTime] = useState('')
    const [RememberCheckOutinfo, setRememberCheckOutinfo] = useState('')


    const stripe = useStripe()
    const elements = useElements()


    const infos = {
        name : Name,
        collect_time : DateTime, 
        phone: Phone, 
        email: Email
    }

    const styleInput = {
        valid : 'border: 1px solid var(--green)',
        error: 'border: 1px solid var(--red)',
        normal: 'border: 1px solid var(--border)'
    }



    async function ValidPayment(e) {

        e.preventDefault()

        async function Check() {

            for (const v in Object.values(infos)) {
                if (Object.values(infos)[v]) document.querySelector('#' + Object.keys(infos)[v]).style = styleInput.normal
            }
            document.querySelectorAll('.div-input grey').forEach(e=> {
                if (!Phone) document.querySelector('#phone').style = styleInput.error
                if (e.value === '') e.style = styleInput.error
            })

            
            if (!DateTime) {
                throw {
                    code: 'collect_time', 
                    error: 'Vous devez renseigner une date et une heure de collecte'
                }
            }
            if (!Name) {
                throw {
                    code: 'name', 
                    error: 'Vous devez renseigner un nom'
                }
            } 
            if (!Phone || Phone === "33") {
                throw {
                    code: 'phone', 
                    error: 'Vous devez renseigner un num??ro de t??l??phone'
                }
            } 
            if (!Email) {
                throw {
                    code: 'email', 
                    error: 'Vous devez renseigner un email'
                }
            } 

            return true
        }

        Check()
        .then(check=> {

            if (check === true) {

                ProcessPayement()
                .then(e=> {
                    setDB(ShopID, 'shop')
                    setDB(user?.email, 'client')
                })
            }

            function setDB(where, collection) {

                db.collection(collection).doc(where).collection('order').doc(orderID)
                .set({
                    id      : orderID,
                    shop    : ShopID,
                    total   : AmountOfCart,
                    name    : Name,
                    phone   : Phone,
                    email   : Email,
                    lines   : UserCart.length,
                    statu   : 'valid',
                    dateTime: DateTime,
                    date    : serverTimestamp()
                })
                .then(e=> {
                    // create a collection of all items to the order 
                    for (const v in UserCart) {
                        db.collection(collection).doc(where).collection('order').doc(orderID).collection('items').doc(UserCart[v].item)
                        .set({
                            quantity: UserCart[v].quantity,
                            total: UserCart[v].total,
                            id: UserCart[v].item
                        })
                    }
                })
                .then(e=> {
    
                    if (RememberCheckOutinfo === true) {
    
                        db.collection('client').doc(user?.email)
                        .set({
                            creditCard_info : {
                                number_card: '',
                                cvc        : '',
                                expery_date: ''
                            }
                        })
                    }
    
                    // Delete all items from cart
                    for (const v in UserCart) {
                        db.collection('client').doc(user?.email).collection('cart').doc(ShopID).collection('items').doc(UserCart[v].item).delete()
                    }
    
                })
            }
        })
        .catch(error=> {
            document.querySelector('#' + error.code).style = styleInput.error
            setMSG({
                statu: 'error',
                msg: error.error
            })
        })
    }


    useEffect(e=> {
        for (const v in Object.values(infos)) {
            if (Object.values(infos)[v]) document.querySelector('#' + Object.keys(infos)[v]).style = styleInput.normal
        } 

    }, [Name, DateTime, Phone, Email])


    async function ProcessPayement() {

        if (!stripe || !elements) return

        // card number element as the card element
        const cardNumberElement = elements?.getElement(CardNumberElement)

        if (cardNumberElement) {

            const {error, paymentMethod} = await stripe?.createPaymentMethod({
                type: 'card',
                card: cardNumberElement
            })
            
            if (error) ifError()

            else {
                try {
                    const response = await axios({
                        url: 'http://localhost:8080/stripe/charge',
                        method: 'post',
                        data : {
                            amount: AmountOfCart * 100,
                            id: paymentMethod?.id
                        }
                    })

                    window.location.href = ShopID + '/order-validated/' + orderID
                    console.log('paiement r??ussi');
                }
                catch(error) {
                    console.log(error);
                }
            }

            function ifError() {
                const info = ['number', 'cvc', 'expiry']

                for (const v in info) {
                    const div = document.querySelector('#card_' + info[v])

                    if (error.code === 'incomplete_' + info[v]) {

                        div.style = styleInput.error
                        setMSG({
                            statu: 'error',
                            msg: error.message
                        })
                    }
                    else {
                        div.style = styleInput.normal
                    }
                }
            }
        }
    }



    return (
        <form onSubmit={ValidPayment} >

            <Messages statu={MSG.statu} msg={MSG.msg} loader={MSG.loader} />

            <div className='grid justify-s-b gap align-top blocks' >

                <div className='grid w-100p '>
                    <div className='grid w-100p '>
                        <div className='grid white border border-r-1 p-1 shadow gap'>

                            <div className='grid m-b-1'>
                                <div className='display justify-s-b m-t-1'>
                                    <span className='f-s-20 m-0'>R??capitulatif</span>
                                    <div className='display'>
                                        <button onClick={e=> setShowCart(ShowCart === false ? true : false)} className='border grey hover' type='button' >
                                            <span>{ShowCart === true ? 'Masquer' : 'Afficher'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className='grid' style={{display : ShowCart === true ? 'block' : 'none'}} >
                                <div className='display justify-s-b align-top f-s-14'>
                                    <div className='grid m-b-04 w-50'>
                                        <span className='c-grey'>Article</span>
                                        <span>Paiement r??current {planID}</span>
                                    </div>
                                    <div className='grid'>
                                        <span className='c-grey'>Prix</span>
                                        <span>{formatCurrency(plans[planID].price)}</span>
                                    </div>
                                </div>
                                <ul className='grid'>
                                    {
                                        UserCart
                                        .map(item=> {
                                            return (
                                                <li className='display justify-s-b border-b m-b-04 ' key={item?.item}>
                                                    <div className='display m-b-04 gap w-100p'>
                                                        <div className='display gap'>
                                                            <img src={getItems(item?.item).photos[0]} width={20} height={20} className='border-r-100'/>
                                                            <span>{getItems(item?.item).name}</span>
                                                        </div>
                                                        <span className='f-s-12 c-grey'>x {item?.quantity}</span>
                                                    </div>
                                                    <div className='display'>
                                                        <span>{formatCurrency(item?.total)}</span>
                                                    </div>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>

                            <div className='display justify-s-b f-w-500'>
                                <span className='f-s-18'>Total :</span>
                                <span className='f-s-20'>{formatCurrency(plans[planID].price)}</span>
                            </div>
                        </div>
                    </div>

                </div>
                
                <div className='grid white border border-r-1 p-1 shadow gap-1rem'>
                    <div className='grid m-b-1'>
                        <h2 className='f-s-25 m-b-1'>Vos informations</h2>
                        <span className='c-grey f-w-300'>Entrez vos informations de contact et de paiement</span>
                    </div>

                    <div className='grid'>
                        <label>Nom</label>
                        <input type='text' placeholder='Joe' className='div-input grey m-t-04' onChange={e=> setName(e.target.value)} id='name' />
                    </div>
                    <div className='grid '>
                        <label className='f-s-16 m-b-04'>Num??ro de t??l??phone</label>
                        <div className='display div-input grey border border-r-04 h-3' id='phone'>
                            <PhoneInput
                                className='c-white' 
                                country='fr' 
                                countryCodeEditable={false} 
                                disableDropdown  
                                onChange={phone=> setPhone(phone)} 
                            />
                        </div>
                    </div>
                    <div className='grid'>
                        <label>Email</label>
                        <input type='email' placeholder={user?.email ?? 'mon-email@gmail.com'} className='div-input grey m-t-04' id='email' onChange={e=> setEmail(e.target.value)}/>
                    </div>
                    
                    <div className='grid gap-1rem' >
                        <div className='grid'>
                            <label className='display m-b-04'>Num??ro de carte</label>
                            <div className='display justify-s-b border border-r-04 p-1 div-input grey h-1' id='card_number' >
                                <div className='w-100p'>
                                    <CardNumberElement className='c-white' />
                                </div>
                                <div className='display gap-04'>
                                    <div className="p-CardBrandIcons-item">
                                        <img alt="" src="https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg"/>
                                    </div>
                                    <div className="p-CardBrandIcons-item">
                                        <img alt="" src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg"/>
                                    </div>
                                    <div className="p-CardBrandIcons-item">
                                        <img alt="" src="https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg"/>
                                    </div>
                                    <div className="p-CardBrandIcons-item p-CardBrandIcons-more">
                                        <img alt="" src="https://js.stripe.com/v3/fingerprinted/img/discover-ac52cd46f89fa40a29a0bfb954e33173.svg"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='display justify-s-b gap'>
                            <div className='grid w-100p'>
                                <label className='display m-b-04'>Code</label>
                                <div className='display justify-s-b border border-r-04 p-1 div-input grey h-1' id='card_cvc'>
                                    <div className='w-100p'>
                                        <CardCvcElement className='c-white' />
                                    </div>
                                    <span className='display'>
                                        <svg className="p-CardCvcIcons-svg" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="var(--colorIconCardCvc)" role="presentation"><path opacity=".2" fill-rule="evenodd" clip-rule="evenodd" d="M15.337 4A5.493 5.493 0 0013 8.5c0 1.33.472 2.55 1.257 3.5H4a1 1 0 00-1 1v1a1 1 0 001 1h16a1 1 0 001-1v-.6a5.526 5.526 0 002-1.737V18a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h12.337zm6.707.293c.239.202.46.424.662.663a2.01 2.01 0 00-.662-.663z"></path><path opacity=".4" fill-rule="evenodd" clip-rule="evenodd" d="M13.6 6a5.477 5.477 0 00-.578 3H1V6h12.6z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M18.5 14a5.5 5.5 0 110-11 5.5 5.5 0 010 11zm-2.184-7.779h-.621l-1.516.77v.786l1.202-.628v3.63h.943V6.22h-.008zm1.807.629c.448 0 .762.251.762.613 0 .393-.37.668-.904.668h-.235v.668h.283c.565 0 .95.282.95.691 0 .393-.377.66-.911.66-.393 0-.786-.126-1.194-.37v.786c.44.189.88.291 1.312.291 1.029 0 1.736-.526 1.736-1.288 0-.535-.33-.967-.88-1.14.472-.157.778-.573.778-1.045 0-.738-.652-1.241-1.595-1.241a3.143 3.143 0 00-1.234.267v.77c.378-.212.763-.33 1.132-.33zm3.394 1.713c.574 0 .974.338.974.778 0 .463-.4.785-.974.785-.346 0-.707-.11-1.076-.337v.809c.385.173.778.26 1.163.26.204 0 .392-.032.573-.08a4.313 4.313 0 00.644-2.262l-.015-.33a1.807 1.807 0 00-.967-.252 3 3 0 00-.448.032V6.944h1.132a4.423 4.423 0 00-.362-.723h-1.587v2.475a3.9 3.9 0 01.943-.133z"></path></svg>
                                    </span>
                                </div>
                            </div>
                            <div className='grid w-100p'>
                                <label className='display m-b-04'>Date d'expiration</label>
                                <div className='display justify-s-b border border-r-04 p-1 div-input grey h-1' id='card_expiry'>
                                    <div className=' w-100p'>
                                        <CardExpiryElement className='c-white' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='display gap'>
                        <input type='checkbox' className='w-1' id='remember_payment' onChange={e=> setRememberCheckOutinfo(e.target.checked)} />
                        <label htmlFor='remember_payment' className='c-grey f-w-300'>Se souvenir de ma carte</label>
                    </div>
                    <div className='display w-100p'>
                        <div className='display w-100p'>
                            <button className='blue c-white hover-blue border-r-1 f-s-16 h-3 p-1' disabled={!stripe}>
                                <span>Payer {formatCurrency(AmountOfCart)}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </form>
    )
}


export default function Payment() {

    const { plan } = useParams()

    const stripePromise = loadStripe('pk_test_51HKFx4L8AEDuYjhscUrD37Q7AP9kCKtBF8uG8xO6DCh5FKNrTuyLAecOgxZyXHPtaV4jduDf6fWoJBiGuqjjcK8c00z71QBckl')

    return (
        <Main>
            <Elements stripe={stripePromise}>
                <Stripe planID={plan.toLocaleUpperCase()} />
            </Elements>
        </Main>
    )
};


