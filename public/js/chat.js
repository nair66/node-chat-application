const socket = io()

//Elements 
const $form = document.querySelector('#messageForm')
const $formInput = $form.elements.inputMessage
const $sendLocBtn = document.querySelector('#sendLocBtn')
const $inputBtn = $form.elements.submit
const $messages_container = document.querySelector('#messages_container')

//Templates
const $messageTemplate = document.querySelector('#message_template').innerHTML
const $locationTemplate = document.querySelector('#location_template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar_template').innerHTML

//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () => {
    //New message element
    const $newMessage = $messages_container.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages_container.offsetHeight

    //Height of messages container
    const containerHeight = $messages_container.scrollHeight
    
    //How far have I scrolled?
    const scrollOffset = $messages_container.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages_container.scrollTop = $messages_container.scrollHeight
    }

}

socket.on('message',(msg) => {
    // console.log(msg)
    const html = Mustache.render($messageTemplate,{
        'message' : msg.text,
        'createdAt' : moment(msg.createdAt).format('h:mm a'),
        'userName' : msg.username
    })
    $messages_container.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(location)=> {
    // console.log(location)
    const html = Mustache.render($locationTemplate,{
        'location' : location.url,
        'createdAt' : moment(location.createdAt).format('h:mm a'),
        'userName' : location.username
    })
    $messages_container.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$form.addEventListener('submit',(e) => {
    e.preventDefault()
    $inputBtn.setAttribute('disabled','disabled')

    e.target.elements

    let messageToSend = e.target.elements.inputMessage.value

    socket.emit('sendMessage',messageToSend,(error) => {

        $inputBtn.removeAttribute('disabled')
        $formInput.value = ''
        $formInput.focus()

        if(error){
            return console.log(error)
        }

        console.log('message delivered')
    })
})

$sendLocBtn.addEventListener('click',(e) => {
    if(!navigator.geolocation) { 
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocBtn.setAttribute('disabled','disabled')


    navigator.geolocation.getCurrentPosition((position)=> {
        // console.log(position)
        socket.emit('sendLocation',{'latitude':position.coords.latitude,'longitude':position.coords.longitude},()=>{
            $sendLocBtn.removeAttribute('disabled')
            console.log('Location delivered to server')
        })
    })
})


socket.emit('join',{username, room},(error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData',({room,users}) => {
   const html = Mustache.render($sidebarTemplate,{
       room,
       users
   })

   document.querySelector('#sidebar').innerHTML = html
})