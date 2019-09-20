exports.handler = (event, context, callback) => {
    console.log(JSON.stringify({ event, context }));

    callback(null, {
        statusCode: 200,
        body: JSON.stringify({ event, context }),
    });
};