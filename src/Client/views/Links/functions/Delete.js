import { db } from "../../../../App/database/firebase"
import { getStorage, ref, deleteObject } from "firebase/storage";
import UniqueID from "../../../../App/utils/uniqueID";



export async function DeleteLink(props) {

    const { Stats, link, snackBar, popUp, history, type } = props

    popUp.show({
        title      : 'Attention',
        message    : `Tu es sur le point de supprimer ${link.name}`,
        question   : 'Voulez-vous continuer ?',
        buttonText : 'Supprimer',
        buttonColor: 'red',
        valid      : () => deleteLinksSelected(link).then(e=> {
            snackBar.add({
                id     : UniqueID('m-', 5),
                text   : 'Modifications enregistrées 🎉',
                subtext: 'Le lien court à bien été modifié',
                status : 'success'
            })
        }),
        statu: 'question'
    })

    

    const deleteLinksSelected = async (link) => {

        try {
            await db.collection('links').doc(link.id).delete()
            await Stats
            ?.filter(e => e.LinkID === link.id)
            .map(e => {
                
                db.collection('stats')
                .doc(e.statID)
                .delete()
            })
            await faviconExist(link.id)

            popUp.show({})

            history(type !== 'stats' && '/dashboard')
        } 
        catch (error) {
            console.error(error);
        }
    }
}


const faviconExist = async id => {

    const storage = getStorage()
    const path = `links/favicon/${id}`

    const favicon = ref(storage, path)
    
    deleteObject(favicon).then(e=> {
        return true
    })
}