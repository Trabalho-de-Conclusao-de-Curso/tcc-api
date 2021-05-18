const { db } = require('../utils/admin');
const { validateAddOpp, reduceOppDetails } = require('../utils/validators');

exports.addOpportunity = (req, res) => {
    const newOpp = {
        interests: req.body.interests,
        organization: req.user.uid,
        description: req.body.description,
        address: req.body.address,
        rating: 5,
        id: '',
        open: true,
        name: req.body.name,
        requirements: req.body.requirements,
        createdAt: new Date().toISOString(),
        duration: req.body.duration,
        period: req.body.period,
        photos: req.body.photos,
        likes: [],
    };

    const { errors, valid } = validateAddOpp(newOpp);
    if (!valid) return res.status(400).json({ errors: errors });
    db.collection('Opportunities')
        .where('name', '==', newOpp.name)
        .get()
        .then(data => {
            if (data.size > 0)
                return res
                    .status(400)
                    .json({ errors: { name: 'This name is already taken' } });
            return db.collection('Opportunities').add(newOpp);
        })
        .then(data => {
            newOpp.id = data.id;
            return db
                .collection('Opportunities')
                .doc(data.id)
                .update('id', data.id);
        })
        .then(() => {
            return res.status(201).json({ id: newOpp.id });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ errors: { general: err.code } });
        });
};

exports.editOpportunity = (req, res) => {
    const { valid, errors, details } = reduceOppDetails(req.body);

    if (!valid) return res.status(400).json({ errors: errors });

    if (!req.body.name === '') {
        db.collection('Opportunities')
            .where('name', '==', details.name)
            .get()
            .then(data => {
                if (!data.empty)
                    return res
                        .status(400)
                        .json({ name: 'this name is already taken' });
                return db
                    .collection('Opportunities')
                    .doc(req.body.id)
                    .update(details);
            })
            .then(() => {
                return res
                    .status(201)
                    .json({ message: `Opportunitie ${req.body.id} updated` });
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: err.code });
            });
    } else {
        db.collection('Opportunities')
            .doc(req.body.id)
            .update(details)
            .then(() => {
                return res
                    .status(201)
                    .json({ message: `Opportunitie ${req.body.id} updated` });
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: err.code });
            });
    }
};

exports.removeOpportunity = (req, res) => {
    const oppId = req.body.oppId;
    db.collection('Opportunities')
        .doc(oppId)
        .delete()
        .then(() => {
            return res
                .status(201)
                .json({ message: `Opportunity ${oppId} removed` });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

exports.openOpportunity = (req, res) => {
    const oppId = req.body.oppId;
    db.collection('Opportunities')
        .doc(oppId)
        .update('open', true)
        .then(() => {
            return res
                .status(201)
                .json({ message: `Opportunity ${oppId} open` });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

exports.closeOpportunity = (req, res) => {
    oppId = req.body.oppId;
    db.collection('Opportunities')
        .doc(oppId)
        .update('open', false)
        .then(() => {
            return res
                .status(201)
                .json({ message: `Opportunity ${oppId} open` });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

exports.getOpportunities = (req, res) => {
    db.collection('Opportunities')
        .where('organization', '==', req.user.uid)
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let opps = [];
            data.forEach(doc => {
                opps.push(doc.data());
            });
            return res.json(opps);
        })
        .catch(err => console.error(err));
};

exports.getOpportunity = (req, res) => {
    let opportunity = {};
    db.collection('Opportunities')
        .doc(req.params.id)
        .get()
        .then(doc => {
            opportunity = doc.data();
            return db
                .collection('Opportunities')
                .doc(req.params.id)
                .collection('Registrations')
                .get();
        })
        .then(data => {
            let registrations = [];
            data.forEach(doc => {
                registrations.push(doc.data());
            });
            opportunity.registrations = registrations;
            return res.json({ opportunity });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.message });
        });
};
