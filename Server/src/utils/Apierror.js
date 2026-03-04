class Apierror extends Error{
    constructor(statusCode,message,success=false,errors=[],stack=""){
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.success = success;
        this.data = null;
        this.errors = errors;
        if(stack){
            this.stack=stack;
        }
        //first argument {this} tell the node js strt recording errors from current object
        //and hide the internal steps of api errors itself {this.constructor}
        else{
            Error.captureStackTrace(this,this.constructor)
        }
        
    }
}
export {Apierror}