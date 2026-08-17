const globalErrorHandler = (err, req, res, next) => {
    console.error(`[SYSTEM OPERATION EXCEPTION FAULT]:`, err.stack);
    const fallbackStatusCode = res.statusCode === 200 ? 500 : res.statusCode;
    return res.status(fallbackStatusCode).json({
        success: false,
        error: err.message || "A fatal exception error was triggered inside the application layers.",
        detail: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = globalErrorHandler;