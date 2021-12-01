const db = require('./firebase').db;

const expressApp = require('express')()
    .use((req, res) => res.send("Its working"))
    .listen(process.env.PORT || 3001)

// Conectar socket.io al lado del cliente
const io = require('socket.io')(expressApp, {
    cors: {
        origin: 'https://googledocs-clone-client.herokuapp.com',
        methods: ['GET', 'POST'],
    },
})

io.on('connection', socket => {
    // Obtener doc desde el cliente
    socket.on('get-document', async documentId => {
        // Obtener el contenido del doc o crear uno nuevo si no existe
        const data = await GetDocument(documentId);
        // Juntar en una misma "sala" a aquellos clientes con el mismo documentId
        socket.join(documentId);
        // Enviar el contenido del doc al cliente
        socket.emit('load-document', data);

        // Ejecutar cuando el cliente realiza algun cambio
        socket.on('send-changes', delta => {
            // Cuando se recibieron los cambios, enviarlos a los demas clientes
            socket.broadcast.to(documentId).emit('recieve-changes', delta);
        });

        socket.on('save-document', docContent => SaveChanges(documentId, docContent))
    })
});

// Obtener doc de la base de datos
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