// Created By Miftah GanzZ
// Jangan Hapus Credit
const express = require('express');
const shortid = require('shortid');
const path = require('path');
const fs = require('fs/promises');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'db', 'shortlink.json');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let urlDatabase = {};

// Function
async function readUrls() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    urlDatabase = JSON.parse(data);
  } catch (error) {
    console.error('Error reading URLs:', error.message);
  }
}

async function saveUrls() {
  try {
    await fs.writeFile(dbPath, JSON.stringify(urlDatabase, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving URLs:', error.message);
  }
}

// router
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tos.html'));
});

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contac.html'));
});

// fitur kek nya
app.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "your_username",
      pass: "pass",
    },
  });

  const mailOptions = {
    from: "your_gmail_smtp",
    to: 'your_gmail@gmail.com',
    subject: `Message from ${name}`,
    text: message,
    replyTo: email,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('An error occurred while sending the email.');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('Email successfully sent!');
    }
  });
});

app.post('/shorten', async (req, res) => {
  const originalUrl = req.body.url;
  const shortUrl = shortid.generate();
  const createdDate = new Date().toISOString();

  urlDatabase[shortUrl] = {
    originalUrl: originalUrl,
    shortUrl: `https://${req.get('host')}/${shortUrl}`,
    createdDate: createdDate,
  };

  await saveUrls();

  const response = {
    originalUrl: originalUrl,
    shortUrl: `https://${req.get('host')}/${shortUrl}`,
    createdDate: createdDate,
  };

  res.json(response);
});

app.get('/shortlink', async (req, res) => {
  const originalUrl = req.query.url;
  const shortUrl = shortid.generate();
  const createdDate = new Date().toISOString();

  if (!originalUrl) {
    return res.status(400).json({ error: 'URL parameter is missing' });
  }

  urlDatabase[shortUrl] = {
    originalUrl: originalUrl,
    shortUrl: `https://${req.get('host')}/${shortUrl}`,
    createdDate: createdDate,
  };

  try {
    await saveUrls();
  } catch (error) {
    console.error('Error saving URLs:', error.message);
  }

  const response = {
    author: 'Miftah GanzZ',
    status: 'success',
    code: 200,
    data: {
      originalUrl: originalUrl,
      shortUrl: `https://${req.get('host')}/${shortUrl}`,
      createdDate: createdDate,
    },
  };

  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(response, null, 2));
});

app.post('/:name?', (req, res) => {
  const originalUrl = req.body.url;
  const customName = req.params.name;

  if (customName && urlDatabase[customName]) {
    res.status(400).json({ error: 'Custom name already exists' });
  } else {
    let shortUrl;
    if (customName) {
      shortUrl = `https://${req.get('host')}/cn/${customName}`;
      urlDatabase[customName] = {
        originalUrl: originalUrl,
        shortUrl: shortUrl,
        createdDate: new Date().toISOString(),
      };
    } else {
      shortUrl = `https://${req.get('host')}/${shortid.generate()}`;
      urlDatabase[shortUrl] = {
        originalUrl: originalUrl,
        shortUrl: shortUrl,
        createdDate: new Date().toISOString(),
      };
    }

    saveUrls();

    res.json({
      originalUrl: originalUrl,
      shortUrl: shortUrl,
      createdDate: new Date().toISOString(),
    });
  }
});

app.get('/cn/:name', (req, res) => {
  const customName = req.params.name;
  const shortUrlData = urlDatabase[customName];

  if (shortUrlData) {
    res.redirect(301, shortUrlData.originalUrl);
  } else {
    res.status(404).send('Custom URL not found');
  }
});

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = req.params.shortUrl;
  const originalUrlData = urlDatabase[shortUrl];

  if (originalUrlData) {
    res.redirect(301, originalUrlData.originalUrl);
  } else {
    res.status(404).send('Not Found');
  }
});

readUrls().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
