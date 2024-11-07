const jwt = require('jsonwebtoken');

const middlewareCurrentUser = (req, res, next) => {

   // if (!req.session?.jwt) return next();
   console.log("inicio middleware")
    if (!req.session?.jwt) {
        const session = req.session;
        const token = req.session?.jwt;
        if(!session){
            return res.status(401).send({ error: 'Req.session undefined' });
        }
        if(!token){
            console.log("req.session;",req.session);
            //req.session; Session {}
            return res.status(401).send({ error: 'Req.session.jwt undefined' });
        }
        return res.status(401).send({ error: 'Not Authorized' });
    }    
    try {
        const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY);
        req.currentUser = payload;
        if (payload.expirationTime < Date.now()) {
            req.currentUser = undefined;
            res.status(200).send({ currentUser: null })
        } else {
            console.log("fin middleware")
            next(); 
        }
    } catch (err) {
        console.error("Error en middleware:",err)
        res.status(401).send({ error: 'Not Authorized' });
    }
};

module.exports = {
    middlewareCurrentUser
};