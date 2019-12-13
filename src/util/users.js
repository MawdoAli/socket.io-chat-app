const users =[]

const addUser = ({id, username, room})=>{

    //clean the data
    username.trim().toLowerCase()
    room.trim().toLowerCase()



    //validate the data
    if(!username || !room){
        return{
            error: 'Username and room are required'
        }
    }




    //check for exisying user
    const existingUser = users.find((user)=>{
        return user.room==room && user.username== username
    })  



    if(existingUser) {
        return{
            error: 'User already taken'
        }
    }




    const user = {id, username, room}
    users.push(user)
    return {user}

}





const removeUser = (id)=>{
    //find the user's index
    const index = users.findIndex( (user) => {
        return user.id==id
    })

    //remove the user
    if (index !== -1){
        return users.splice(index, 1)[0]
    }
}


const getUser= (id)=>{
    return users.find((user)=>{
        return user.id==id
    })
    
}

const getUserInRoom= (room)=>{
    return users.filter((user) => {
        return user.room === room
    })

}


module.exports={
    getUser,
    getUserInRoom,
    removeUser,
    addUser
}