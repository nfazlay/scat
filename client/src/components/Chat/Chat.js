import React, {useState, useEffect} from 'react';
import queryString, { parse } from 'query-string';
import io from 'socket.io-client'

import './Chat.css';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';

let socket;

const Chat = ({location}) =>{
    
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const ENDPOINT = 'https://scat-server.herokuapp.com/';
    
    useEffect(()=>{
        const {name, room} = queryString.parse(location.search);
        socket = io(ENDPOINT);
        setName(name);
        setRoom(room);

        socket.emit('join', {name, room},(error)=>{
            if(error){
                alert(error);
            }
        });

        return ()=>{
            socket.emit('disconnect');

            socket.off();
        }
    }, [ENDPOINT, location.search]);

    useEffect(() => {
        socket.on('message', (message)=>{
            //spread all other messages and add one ther message
            setMessages([...messages, message])
        });
    }, [messages]);

    //function for sending messages
    const sendMessage = (event) => {
        event.preventDefault();

        if(message){
            socket.emit('sendMessage', message, setMessage(''));
            console.log("Here" ,message, messages);
        }

    }
    return(
        <div className = "outerContainer">
            <div className= "container">
                <InfoBar room={room}></InfoBar>
                <Messages messages ={messages} name={name}></Messages>
                <Input message ={message} setMessage= {setMessage} sendMessage={sendMessage}/>
            </div>
        </div>
    )
};

export default Chat;
