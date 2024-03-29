const router = require("express").Router()
const {isAuth} = require('../middlewares/authMiddleware')
const electronicManager = require('../managers/electronicManager')
const {getErrorMessage} = require('../utils/errorUtils')
const userManager = require('../managers/userManager')

router.get('/search', isAuth, (req, res) => {
    res.render('search')
})



router.get('/create', (req, res) => {
    res.render('electronic/create')
})



router.post('/create', isAuth, async(req, res) => {
    const newElectronic = req.body
    try{
        await electronicManager.create(req.user._id, newElectronic);
        res.redirect('/catalog')
       }catch(err){
        const message = getErrorMessage(err)
        res.status(400).render("electronic/create", {...newElectronic, error: message})
       }
    })


router.get('/catalog', async (req, res) => {
    const electronics = await electronicManager.getAll().lean()
    res.render('catalog', {electronics})
})


router.get('/:electronicId/details', async (req, res) => {
 
    const electronicId = req.params.electronicId
    try{
        const electronic = await electronicManager.getOneWithDetails(electronicId).lean()
        const isOwner = electronic.owner._id.toString() == req.user?._id.toString()//movie.owner(object) ==  req.user._id(string) (convirts them to the same type)
        // const casts = await castManager.getByIds(movie.casts).lean() //--- only if populate is not used(populates the cast info into the movie with the ref: Cast in the Movie Schema)
        res.render('electronic/details', {electronic, isOwner})
} catch(error){
    res.status(400).redirect('/404')
}
 
})


router.get("/:electronicId/edit", isAuth, async (req, res) => {
    
    if(!req.user){
        return res.redirect('/auth/login')
    }
try{
    const electronic = await electronicManager.getOneWithDetails(req.params.electronicId).lean()
    res.render("electronic/edit", {electronic})
}catch(err){
    res.status(404).redirect("404")
   }
})

router.post("/:electronicId/edit", isAuth, async (req, res) => {
    const electronic = req.body
    const electronicId = req.params.electronicId
    
    try{
        const isOwnerInfo = await electronicManager.getOneWithDetails(electronicId)
        const isOwner = isOwnerInfo.owner._id.toString() == req.user?._id
        if(!isOwner){
            return res.redirect(`/catalog`)
        }
        await electronicManager.edit(electronicId, electronic)
            res.redirect(`/${req.params.electronicId}/details`)

    }catch(err){
        const message = getErrorMessage(err)
        res.status(400).render("electronic/edit", {electronic, error: message})
       }
})


router.get("/:electronicId/delete", isAuth, async (req, res) => {
    const electronicId = req.params.electronicId
    try{
        const isOwnerInfo = await electronicManager.getOneWithDetails(electronicId)
        const isOwner = isOwnerInfo.owner._id.toString() == req.user?._id
        
        if(!isOwner){
            return res.redirect(`/catalog`)
        }
        await electronicManager.delete(electronicId)
        res.redirect('/')

    }catch(err){
        res.status(400).render('404')
       }
})

module.exports = router