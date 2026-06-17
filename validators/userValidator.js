const validateUser = (user) => {

    if (!user.nombre || !user.email || !user.password) {
        return {
            error: "Nombre, email y password son requeridos"
        };
    }

    return { error: null };
};

module.exports = validateUser;