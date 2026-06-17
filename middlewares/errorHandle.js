const errorHandle = (error, req, res, next) => {

    const statusCode = error.statusCode || 500;

   
    const message =
        error.message || 'Ocurrió un error inesperado';

   
    console.error(
        `[ERROR] ${new Date().toISOString()}`
    );

    console.error(message);

   
    if (error.stack) {

        console.error(error.stack);

    }

    
    res.status(statusCode).json({

        status: 'error',

        statusCode,

        message

    });

};

module.exports = errorHandle;