//Best clean method
const Asynchandler = function(handler){
    return (req,res,next)=>{
        Promise.resolve(handler(req,res,next))
        .catch((error)=>next(error))
    }
}

export {Asynchandler}