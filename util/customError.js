const customError  = err=>{

    const error= Object && Object?.values(err?.errors).map(val=>val?.message)
   
    return  error.join(".")
    
 }
 
 module.exports=customError