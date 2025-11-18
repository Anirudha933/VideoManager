class ApiError extends error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        stack=''
    ) {
        super(message);
        this.statusCode=statusCode;
        this.data=NULL;
        this.message=message;
        this.success=false;
        this.error=errors

        if(stack){
            this.stack=stack;
        }
        else{
            // This creates a clean stack trace beginning from where the error was thrown, not from inside your ApiError class.
            Error.captureStackTrace(this,this.constructor);
        }
    }
}

export {ApiError}