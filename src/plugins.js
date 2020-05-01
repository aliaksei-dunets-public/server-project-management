const plugins = {

    requestDidStart(requestContext) {
        console.log(`Request: \n` + requestContext.request.query);

        return {
            // willSendResponse(requestContext) {
            //     console.log(`Response: \n` + JSON.stringify(requestContext.response.data, null, 2));
            // }
        }
    },

};

module.exports = process.env.NODE_ENV === 'development' ? plugins : null;