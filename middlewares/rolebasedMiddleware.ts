const authorizeRole = (...allowedRoles: any) => {
    return (req: any, res: any , next: any) => {
        if(!allowedRoles.includes(req.user.role)){
            return res.status(401).json({
                "message": "Access Denied"
            })
        }
        next();
    }
}

export default authorizeRole