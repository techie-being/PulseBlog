class Apiresponse{
    
    constructor(statusCode,data,message="success"){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;

        // here we do not need to use this ternary syntax because comparison alredy returns true /false based on statusCode
        //this.success = statusCode < 400? true : false;
    };
}

export {Apiresponse}