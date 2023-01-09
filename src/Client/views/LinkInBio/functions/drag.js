import { db } from "../../../../App/database/firebase"

export const onDragStratLinkInBio = e => {
    const { draggableId } = e

    const childElement = document.querySelector('#drag-' + draggableId)
    childElement.classList.add('c-blue')
}

export const onDragEndLinkInBio = (result, UserLinks, setUserLinks) => {

    const { source, destination } = result

    if (!destination) return

    const newItems = reorderList(UserLinks, source.index, destination.index)
    setUserLinks(newItems)
    
    getPosition() 

    document.querySelector('.btn-drag')?.children[0].classList.remove('c-blue')
}

function reorderList(list, startIndex, endIndex) {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
}



async function getPosition() {
    const container = document.querySelector('.container')
    const array     = container.childNodes
    return array
}

window.onload = e => getPosition()
.then(array=> {
    Object.values(array).map((e, index)=> {

        const id = e.classList.value

        db.collection('links').doc(id).update({
            position: index
        })
    })
})