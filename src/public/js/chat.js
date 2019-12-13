
const socket = io()

//elements
const $messageForm = document.querySelector('#submit-form')
const $messageFormInput= $messageForm.querySelector('input')
const $messageFormButton= $messageForm.querySelector('button')
const $shareLocationButton= document.querySelector('#share-location')
const $message= document.querySelector('#message')



//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


///Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})


const autoScroll = ()=>{

    //new message
    const $newMessage = $message.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // //visible height
    const visibleHeight = $message.offsetHeight
 
    // //height of messages container
    const containerHeight = $message.scrollHeight

    // //how for have i scrolled
    const scrollOffset= $message.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
       $message.scrollTop = $message.scrollHeight
    }
}




$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    //disable form
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = document.querySelector('#input1').value

    socket.emit('sendMessage', message, (error)=>{
        //enable again
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }

        console.log('Delivered')
    })
})




socket.on('message', (message) => {
    //console.log(message)
    const html= Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoScroll()
})



socket.on('locationMessage', (urlObj)=>{
    //console.log(url)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: urlObj.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoScroll()
})





socket.on('roomData', ({room, users}) =>{

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html

})



//SHARING LOCATION///
$shareLocationButton.addEventListener('click', ()=>{

    if(!navigator.geolocation){
        return alert('Geolocation not supported by this browser')
    }
    
    $shareLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{

        socket.emit('sendLocation',{
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, (error)=>{
            
            if (error){
                return console.log(error)
            }

            console.log('Location shared!')
            $shareLocationButton.removeAttribute( 'disabled')
        })
        
    })


})

socket.emit('join', {username, room}, (error)=>{

    if(error){
        alert(error)
        location.href='/'
    }
})





