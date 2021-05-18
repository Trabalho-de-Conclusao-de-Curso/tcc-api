const { admin, db } = require('../utils/admin');

exports.getUsersRegisterd = (req, res) => {
    db.collection('Opportunities')
        .doc(req.body.oppId)
        .collection('Registrations')
        .get()
        .then(data => {
            let registrations = [];
            data.forEach(res => {
                registrations.push(res.data());
            });
            return res.status(201).json(registrations);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

exports.getUser = (req, res) => {
    db.collection('Users')
        .doc(req.body.userId)
        .get()
        .then(doc => {
            let user = doc.data();
            return res.status(201).json(user);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

exports.selectUser = (req, res) => {
    db.collection('Opportunities')
        .doc(req.body.oppId)
        .update('open', false)
        .then(() => {
            return db.collection('Users').doc(req.body.userId).get();
        })
        .then(user => {
            return (token = user.data().token);
        })
        .then(mToken => {
            const message = {
                to: mToken,
                sound: 'default',
                body: "It's a match",
                data: {
                    type: 'match',
                    opportunity: req.body.opportunity,
                    organization: req.body.organization,
                },
            };

            return fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });
        })
        .then(() => {
            return db
                .collection('Opportunities')
                .doc(req.body.oppId)
                .collection('Registrations')
                .doc(req.body.userId)
                .update('selected', true);
        })
        .then(() => {
            return res
                .status(201)
                .json({ message: `User ${req.body.userId} chosen` });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};
