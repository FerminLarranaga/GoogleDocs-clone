import React, { useCallback, useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './styles.css';
import { io } from 'socket.io-client';
import { useParams } from 'react-router';

// Personalize the tollbar options of quills
const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['bold', 'italic', 'underlined'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ align: [] }],
    ['image', 'blockquote', 'code-block'],
    ['clean']
];

const SAVE_INTERVAL_MS = 2000;

export default function TextEditor() {
    // Get the id of document
    const {id: documentId} = useParams();

    const [socket,  setSocket] = useState();
    const [quill,  setQuill] = useState();

    // Get the socket of server
    useEffect(() => {
        // Connect to the url the server is running
        const s = io('http://localhost:3001');
        setSocket(s);

        return () => {
            s.disconnect();
        }
    }, []);

    // Load the doc from the server
    useEffect(() => {
        if (socket == null || quill == null) return

        socket.once('load-document', document => {
            quill.setContents(document);
            quill.enable()
        });

        socket.emit('get-document', documentId);
    }, [socket,  quill, documentId]);

    // Recieve changes if any change has been done
    useEffect(() => {
        if (socket == null || quill == null) return

        // Update quill's content with the changes that are being recieved from the server
        const handler = (delta) => {
            quill.updateContents(delta);
        }

        // If any change has been made, the server will automaticaly run handler giving it the change as parameter
        socket.on('recieve-changes', handler);

        return () => {
            socket.off('recieve-changes', handler);
        }
    }, [socket, quill]);

    // Send changes if the current user has done so
    useEffect(() => {
        if (socket == null || quill == null) return

        // Send the changes made by the current user to the server
        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return
            socket.emit('send-changes', delta);
        }
        // If any change is made on the Quill, it whill fire the handler func
        quill.on('text-change', handler);

        return () => {
            quill.off('text-change', handler);
        }
    }, [socket, quill]);

    // Save doc after avery 2 secs
    useEffect(() => {
        if (socket == null || quill == null) return
        
        const saving_interval = setInterval(() => {
            socket.emit('save-document', quill.getContents());
        }, SAVE_INTERVAL_MS);

        return () => {
            clearInterval(saving_interval);
        }
    }, [socket, quill]);

    // Making sure Quill works properly with react, since is not a react component
    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null) return
        wrapper.innerHTML = '';
        const editor = document.createElement('div');
        wrapper.append(editor);

        const q = new Quill(editor, { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS }});
        q.disable();
        q.setText('Loading...');
        setQuill(q);
    }, []);

    return (
        <div className='container' ref={wrapperRef}></div>
    );
}