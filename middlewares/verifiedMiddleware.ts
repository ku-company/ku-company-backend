const verifiedMiddleware = (req: any, res: any, next: any) => {
    if(!req.user.verified){
        return res.status(401).json({
            "message": "Please verify your account to access this resource"
        })
    }
    next();
}

export default verifiedMiddleware