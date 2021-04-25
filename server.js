const db = require('./firebase').db;
const auth = require('./firebase').auth;
const storage = require('./firebase').storage;

// Import socket.io and connect it to the clien side
const io = require('socket.io')(process.env.PORT || 3001, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
})

io.on('connection', socket => {
    // Get documentId from the client
    socket.on('get-document', async documentId => {
        // Get doc content of create a new doc fi it doesn't exist
        const data = await GetDocument(documentId);
        // Join the client only with the ones that are working in the same doc
        socket.join(documentId);
        // Send the doc content to the client
        socket.emit('load-document', data);

        // When the connection with the client is done, wait until the client fires the send-changes func to the server
        socket.on('send-changes', delta => {
            // When the changes have been sent, fire the recieve-changes to all the clients except from the one that has made the changes
            socket.broadcast.to(documentId).emit('recieve-changes', delta);
        });

        socket.on('save-document', docContent => SaveChanges(documentId, docContent))
    })
});

async function GetDocument(documentId) {
    const document = await db.collection('docs').doc(documentId).get();
    
    if (document.data() == null) {
        await db.collection('docs').doc(documentId).set({content: ''});
        return '';
    }
    return document.data().content;
}

function SaveChanges(docId, docContent) {
    db.collection('docs').doc(docId).update({content: docContent});
}