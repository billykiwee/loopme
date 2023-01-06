import { useState, useEffect } from 'react';
import { db } from '../../../App/database/firebase';

export default function useFetchUser(userEmail) {

    const [userData, setUserData] = useState()

    useEffect(() => {
        if (!userEmail) return

        const query = db.collection('users').where('email', '==', userEmail)

        const data = query.onSnapshot(snapshot => {
            if (snapshot.empty) {
                console.error(`Aucun utilisateur trouvé avec l'email ${userEmail}`)
                return null
            }
            const fetchedUser = snapshot.docs.map(doc => doc.data())
            
            setUserData(...fetchedUser)
        })

        return data
    }, [userEmail])

    return userData
}

