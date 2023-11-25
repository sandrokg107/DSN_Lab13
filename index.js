const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const secretKey = 'tuClaveSecreta';
const verificationCodes = {};

const client = twilio('AC2bc8f18e14a8da1677b60df2feb6c6d7', 'be4ba887fe05d71c30f4f1302dec0ec2');

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'usuario' && password === 'contrasena') {
    const verificationCode = Math.floor(1000 + Math.random() * 9000);
    verificationCodes[username] = verificationCode;

    // Cambia 'tuNumeroTwilio' con el número de teléfono real del usuario
    enviarCodigoPorSMS(username, '+51913698148', verificationCode);

    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ mensaje: 'Credenciales inválidas' });
  }
});

app.post('/verify', (req, res) => {
  const { username, code } = req.body;

  if (verificationCodes[username] && parseInt(code) === verificationCodes[username]) {
    res.json({ mensaje: 'Código verificado correctamente' });
  } else {
    res.status(401).json({ mensaje: 'Código inválido' });
  }
});

function enviarCodigoPorSMS(username, userPhoneNumber, code) {
  client.messages
    .create({
      body: `Tu código de verificación es: ${code}`,
      from: '+17026088534', // Reemplaza con tu número Twilio
      to: userPhoneNumber
    })
    .then(message => console.log('SMS enviado:', message.sid))
    .catch(error => console.error('Error al enviar SMS:', error));
}

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
