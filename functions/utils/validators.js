const isEmpty = string => {
    if (string.trim() === '') {
        return true;
    } else {
        return false;
    }
};

const isEmail = email => {
    return true;
};

exports.validateSignUpData = data => {
    let errors = {};

    if (isEmpty(data.email)) errors.email = 'Must not be empty';
    else if (!isEmail(data.email))
        errors.email = 'Must be a valid email address';
    if (isEmpty(data.password)) errors.password = 'Must not be empty';
    if (data.password !== data.confirmPassword)
        errors.confirmPassword = 'Passwords must match';
    if (isEmpty(data.name)) errors.name = 'Must not be empty';
    else if (data.name.trim().length < 10) errors.name = 'Name is too short';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.validateSignInData = data => {
    let errors = {};

    if (isEmpty(data.email)) errors.email = 'Must not be empty';
    if (isEmpty(data.password)) errors.password = 'Must not be empty';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.validateUploadData = data => {
    let errors = {};
    if (isEmpty(data.name)) errors.name = 'Must not be empty';
    if (isEmpty(data.address)) errors.address = 'Must not be empty';
    if (isEmpty(data.description)) errors.description = 'Must not be empty';
    else if (data.description.length > 200)
        errors.description = 'Maximun of 200 characters';
    if (isEmpty(data.phone)) errors.phone = 'Must not be empty';
    if (isEmpty(data.country)) errors.country = 'Must not be empty';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.validatePost = data => {
    let errors = {};
    if (isEmpty(data.body)) errors.body = 'Must not be empty';
    else if (data.body.length > 250) errors.body = 'Maximun of 250 characters';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.validateAddOpp = data => {
    let errors = {};
    let interestsOk = false;

    if (isEmpty(data.description)) errors.description = 'Must not be empty';
    else if (data.description.length > 200)
        errors.description = 'Maximun of 200 characters';

    if (isEmpty(data.address)) errors.address = 'Must not be empty';

    if (isEmpty(data.name)) errors.name = 'Must not be empty';
    else if (data.name.trim().length < 10) errors.name = 'Name is too short';

    if (isEmpty(data.requirements)) errors.requirements = 'Must not be empty';
    else if (data.description.length > 200)
        errors.requirements = 'Maximun of 200 characters';

    if (isEmpty(data.period)) errors.period = 'Must not be empty';

    if (isEmpty(data.duration)) errors.duration = 'Must not be empty';

    if (
        data.interests.environment ||
        data.interests.education ||
        data.interests.human_rights ||
        data.interests.animals ||
        data.interests.health ||
        data.interests.sports
    ) {
        interestsOk = true;
    }
    if (!interestsOk) errors.interests = 'Must chose at least one interest';

    if (data.photos === 0) errors.photos = 'Must chose at least one image';

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.reduceOppDetails = data => {
    let details = {};
    let errors = {};

    if (!isEmpty(data.description)) {
        if (data.description.length > 200)
            errors.description = 'Maximun of 200 characters';
        else details.description = data.description;
    }

    if (!isEmpty(data.address)) details.address = data.address;

    if (!isEmpty(data.name)) {
        if (data.name.trim().length < 10) errors.name = 'Name is too short';
        else details.name = data.name;
    }

    if (!isEmpty(data.requirements)) {
        if (data.requirements.length > 200)
            errors.requirements = 'Maximun of 200 characters';
        else details.requirements = data.requirements;
    }

    if (!isEmpty(data.duration)) details.duration = data.duration;

    if (!isEmpty(data.period)) details.period = data.duration;

    let valid = Object.keys(errors).length === 0 ? true : false;

    return {
        valid,
        errors,
        details,
    };
};

exports.reduceOrgDetails = data => {
    let details = {};
    let errors = {};

    if (!isEmpty(data.description)) {
        if (data.description.length > 200)
            errors.description = 'Maximun of 200 characters';
        else details.description = data.description;
    }

    if (!isEmpty(data.address)) details.address = data.address;

    details.interests = data.interests;

    if (!isEmpty(data.phone)) details.phone = data.phone;

    if (!isEmpty(data.place)) details.place = data.place;

    let valid = Object.keys(errors).length === 0 ? true : false;

    return {
        valid,
        errors,
        details,
    };
};
